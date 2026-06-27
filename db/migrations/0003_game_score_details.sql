-- 0003_game_score_details.sql — per-game details + a normalised rsvp FK.
--
-- game_scores.rsvp was declared SERIAL in 0001 (which attaches an owned sequence
-- and a default) and an earlier draft added a bogus single-column UNIQUE(rsvp)
-- that would let a player store only one game. Here we add the JSONB details
-- column, drop that bad constraint, and re-create the FK as a plain integer with
-- ON DELETE CASCADE so withdrawing an RSVP cleans up its scores.

ALTER TABLE game_scores ADD COLUMN IF NOT EXISTS details jsonb;

-- Remove the erroneous single-column UNIQUE(rsvp) if a prior draft created it.
ALTER TABLE game_scores DROP CONSTRAINT IF EXISTS game_scores_rsvp_key;

-- Detach the SERIAL default/sequence and require the column.
ALTER TABLE game_scores ALTER COLUMN rsvp DROP DEFAULT;
ALTER TABLE game_scores ALTER COLUMN rsvp SET NOT NULL;

-- Re-create the foreign key with cascade delete.
ALTER TABLE game_scores DROP CONSTRAINT IF EXISTS game_scores_rsvp_fkey;
ALTER TABLE game_scores
    ADD CONSTRAINT game_scores_rsvp_fkey
    FOREIGN KEY (rsvp) REFERENCES rsvps(id) ON DELETE CASCADE;
