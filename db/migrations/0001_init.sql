-- 0001_init.sql — RSVPs for the annual Mario Kart tournament.

CREATE TABLE IF NOT EXISTS rsvps (
    id                 SERIAL PRIMARY KEY,
    name               TEXT        NOT NULL,
    email              TEXT        UNIQUE,
    phone              TEXT        NOT NULL UNIQUE, 
    attending          BOOLEAN     NOT NULL DEFAULT TRUE,
    guests             INTEGER     NOT NULL DEFAULT 0 CHECK (guests >= 0),
    favorite_character TEXT,
    message            TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rsvps_created_at_idx ON rsvps (created_at DESC);

CREATE TABLE IF NOT EXISTS game_scores (
    id                 SERIAL PRIMARY KEY,
    rsvp               SERIAL REFERENCES "rsvps"("id"),
    game               TEXT NOT NULL,
    trial              INTEGER,
    score              INTEGER,
    created_at         TIMESTAMPTZ DEFAULT now()
); 