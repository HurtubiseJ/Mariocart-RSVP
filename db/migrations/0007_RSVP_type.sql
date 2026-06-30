


ALTER TABLE rsvps
    ADD COLUMN IF NOT EXISTS rsvp_type text NOT NULL DEFAULT 'player', -- Either "player" or "spectator"
    ADD COLUMN IF NOT EXISTS rated_skill INTEGER NOT NULL DEFAULT -1,
    ADD COLUMN IF NOT EXISTS num_breaths INTEGER NOT NULL DEFAULT -1,
    ADD COLUMN IF NOT EXISTS vibes integer;




