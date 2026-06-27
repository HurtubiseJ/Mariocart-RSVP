-- 0005_standings_recompute.sql — standings stay correct after every game change.
--
-- The original trigger added each new score incrementally and only fired on
-- INSERT, so a re-submitted (upserted) or deleted game would drift. This recompute
-- variant sums the player's stored (already front-end-weighted) game scores from
-- scratch and fires on INSERT/UPDATE/DELETE — the single source of truth for the
-- leaderboard. No scoring weights live in SQL; the front end stores the weighted
-- per-game contribution and the DB simply sums them.

-- Cascade standings rows when an RSVP is removed.
ALTER TABLE standings DROP CONSTRAINT IF EXISTS standings_rsvp_fkey;
ALTER TABLE standings
    ADD CONSTRAINT standings_rsvp_fkey
    FOREIGN KEY (rsvp) REFERENCES rsvps(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION update_standings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_rsvp INTEGER := COALESCE(NEW.rsvp, OLD.rsvp);
BEGIN
    -- When the RSVP itself is being deleted, its game_scores are removed by
    -- cascade and this fires per row. Don't recreate a standings row for a player
    -- who no longer exists (the standings row is cascade-deleted separately).
    IF NOT EXISTS (SELECT 1 FROM rsvps WHERE id = target_rsvp) THEN
        RETURN NULL;
    END IF;

    INSERT INTO standings (rsvp, total_score)
    VALUES (
        target_rsvp,
        (SELECT COALESCE(SUM(score), 0) FROM game_scores WHERE rsvp = target_rsvp)
    )
    ON CONFLICT (rsvp) DO UPDATE
        SET total_score = EXCLUDED.total_score,
            updated_at  = now();
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS update_standings_on_insert ON game_scores;
DROP TRIGGER IF EXISTS update_standings_on_change ON game_scores;
CREATE TRIGGER update_standings_on_change
    AFTER INSERT OR UPDATE OR DELETE ON game_scores
    FOR EACH ROW EXECUTE FUNCTION update_standings();
