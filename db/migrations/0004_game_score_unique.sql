-- 0004_game_score_unique.sql — one row per (player, game, trial).
--
-- The backend upserts game scores ON CONFLICT (rsvp, game, trial), so a player
-- can re-submit a game (e.g. after a retry) without piling up duplicate rows.

ALTER TABLE game_scores DROP CONSTRAINT IF EXISTS unique_rsvp_game_trial;
ALTER TABLE game_scores
    ADD CONSTRAINT unique_rsvp_game_trial UNIQUE (rsvp, game, trial);
