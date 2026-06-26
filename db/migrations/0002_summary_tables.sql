
CREATE TABLE IF NOT EXISTS "standings" (
    id                  SERIAL PRIMARY KEY,
    rsvp                SERIAL REFERENCES "rsvps"("id"),
    total_score         INTEGER NOT NULL,
    updated_at          TIMESTAMPTZ DEFAULT now(),
    created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "standings_idx" ON "stadings"("standing" DESC);

CREATE OR REPLACE FUNCTION update_standings() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY "definer"
DECLARE
    o_total_score      serial;
BEGIN
    SELECT total_score INTO o_total_score
    FROM "standings" 
    WHERE id = NEW.rsvp;

    IF (o_total_score IS NOT NULL) THEN
        UPDATE standings
        set total_score = (o_total_score + NEW.score), updated_at = NOW()
        where NEW.rsvp = standings.rsvp;
    ELSE IF (TRUE) THEN 
        INSERT INTO standings (rsvp, total_score, updated_at, created_at)
        VALUES (NEW.rsvp, NEW.score);
    END IF; 
END;

CREATE TRIGGER update_standings_on_insert()
    AFTER INSERT ON game_scores 
    FOR EACH STATEMENT EXECUTE FUNCTION update_standings();
