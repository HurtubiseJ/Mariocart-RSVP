-- 0008_ride_home.sql — capture how each player plans to get home.
-- Nullable: spectators and legacy rows leave it NULL.
-- Values from the RSVP flow: 'have_driver' | 'staying_lukes' | 'unsure'.

ALTER TABLE rsvps
    ADD COLUMN IF NOT EXISTS ride_home text;
