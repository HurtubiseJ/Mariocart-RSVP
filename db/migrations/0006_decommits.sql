-- 0006_decommits.sql — log of players withdrawing their RSVP (un-RSVP).
--
-- Each withdrawal records the phone used to locate the RSVP, the reason, and the
-- time. A player may withdraw, re-RSVP, and withdraw again; UNIQUE (phone,
-- created_at) keeps every decommit while preventing exact duplicates.

CREATE TABLE IF NOT EXISTS decommits (
    id         SERIAL PRIMARY KEY,
    phone      TEXT        NOT NULL,
    reason     TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (phone, created_at)
);

CREATE INDEX IF NOT EXISTS decommits_phone_idx ON decommits (phone);
