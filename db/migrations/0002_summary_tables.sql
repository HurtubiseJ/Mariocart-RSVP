-- 0002_summary_tables.sql — running per-RSVP score totals for the leaderboard.

CREATE TABLE IF NOT EXISTS standings (
    id          SERIAL PRIMARY KEY,
    rsvp        INTEGER NOT NULL UNIQUE REFERENCES rsvps(id),
    total_score INTEGER NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now(),
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS standings_total_score_idx
    ON standings (total_score DESC);

CREATE OR REPLACE FUNCTION update_standings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO standings (rsvp, total_score)
    VALUES (NEW.rsvp, COALESCE(NEW.score, 0))
    ON CONFLICT (rsvp) DO UPDATE
        SET total_score = standings.total_score + EXCLUDED.total_score,
            updated_at  = now();
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS update_standings_on_insert ON game_scores;
CREATE TRIGGER update_standings_on_insert
    AFTER INSERT ON game_scores
    FOR EACH ROW EXECUTE FUNCTION update_standings();
