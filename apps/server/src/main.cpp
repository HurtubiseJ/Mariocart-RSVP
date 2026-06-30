// Mario Kart tournament RSVP API.
//
// A deliberately small Crow + libpqxx server. Each route opens a short-lived
// connection, runs one transaction, and returns JSON. That is not the fastest
// design, but it keeps the C++ easy to follow while you are learning.

#include <crow.h>
#include <crow/middlewares/cors.h>
#include <pqxx/pqxx>

#include <optional>
#include <string>
#include <vector>

#include "db.hpp"

int main() {
    crow::App<crow::CORSHandler> app;

    // Allow the Next.js frontend (any origin in dev) to call the API.
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global()
        .origin("https://mariocart-rsvp.vercel.app")
        .methods("GET"_method, "POST"_method, "DELETE"_method)
        .headers("Content-Type");

    const std::string dsn = db::connection_string();

    // GET /health — liveness check.
    CROW_ROUTE(app, "/health")
    ([](){
        crow::json::wvalue j;
        j["status"] = "ok";
        return crow::response{j};
    });

    // GET /api/rsvps — list every RSVP, newest first.
    CROW_ROUTE(app, "/api/rsvps").methods(crow::HTTPMethod::Get)([&dsn] {
        try {
            pqxx::connection conn{dsn};
            pqxx::work tx{conn};
            pqxx::result rows = tx.exec(
                "SELECT id, name, email, phone, attending, guests, "
                "favorite_character, message, vibes, rsvp_type, rated_skill, num_breaths, created_at "
                "FROM rsvps ORDER BY created_at DESC");
            tx.commit();

            std::vector<crow::json::wvalue> items;
            for (const auto& row : rows) items.push_back(db::row_to_json(pqxx::row{row}));
            return crow::response{crow::json::wvalue(items)};
        } catch (const std::exception& e) {
            return crow::response{500, std::string{"db error: "} + e.what()};
        }
    });

    // GET /api/rsvps/<id> — fetch one RSVP.
    CROW_ROUTE(app, "/api/rsvps/<int>").methods("GET"_method)([&dsn](int id) {
        try {
            pqxx::connection conn{dsn};
            pqxx::work tx{conn};
            pqxx::result rows = tx.exec_params(
                "SELECT id, name, email, phone, attending, guests, vibes, "
                "favorite_character, message, rsvp_type, rated_skill, num_breaths, created_at "
                "FROM rsvps WHERE id = $1",
                id);
            tx.commit();

            if (rows.empty()) return crow::response{404, "not found"};
            return crow::response{db::row_to_json(pqxx::row{rows[0]})};
        } catch (const std::exception& e) {
            return crow::response{500, std::string{"db error: "} + e.what()};
        }
    });

    // POST /api/rsvps — create an RSVP. Body: { name, email, attending?,
    // guests?, favorite_character?, message? }.
    CROW_ROUTE(app, "/api/rsvps").methods("POST"_method)([&dsn](const crow::request& req) {
        const auto in = crow::json::load(req.body);
        if (!in || !in.has("name") || !in.has("phone")) {
            return crow::response{400, "name and phone are required"};
        }

        if (in["name"].t() != crow::json::type::String ||
            in["phone"].t() != crow::json::type::String) {
            return crow::response{400, "name and phone must be strings"};
        }

        if (in["rsvp_type"].t() != crow::json::type::String) {
            return crow::response{400, "Type: (rsvp_type -> player|spectator) is required."};
        }

        const std::string name  = std::string(in["name"].s());
        const std::string phone = std::string(in["phone"].s());
        const std::string p_type = std::string(in["rsvp_type"].s());
        const int vibes = in["vibes"].i();
        const int num_b = in["num_breaths"].i();
        const int rated_skill = in["rated_skill"].i();

        // email is optional: the frontend sends JSON null when omitted.
        std::optional<std::string> email;
        if (in.has("email") && in["email"].t() == crow::json::type::String) {
            email = std::string(in["email"].s());
        }

        const bool attending = in.has("attending") ? in["attending"].b() : true;
        const int  guests    = in.has("guests") ? static_cast<int>(in["guests"].i()) : 0;

        std::optional<std::string> favorite_character;
        if (in.has("favorite_character") &&
            in["favorite_character"].t() == crow::json::type::String) {
            favorite_character = std::string(in["favorite_character"].s());
        }
        std::optional<std::string> message;
        if (in.has("message") && in["message"].t() == crow::json::type::String) {
            message = std::string(in["message"].s());
        }

        std::optional<std::string> created_at;

        try {
            pqxx::connection conn{dsn};
            pqxx::work tx{conn};
            pqxx::row row = tx.exec_params1(
                "INSERT INTO rsvps "
                "(name, email, phone, attending, guests, favorite_character, message, vibes, rsvp_type, num_breaths, rated_skill) "
                "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) "
                "RETURNING id, name, email, phone, attending, guests, "
                "favorite_character, message, vibes, rsvp_type, num_breaths, rated_skill, created_at",
                name, email, phone, attending, guests, favorite_character, message, vibes, p_type, num_b, rated_skill);
            tx.commit();

            crow::response res{db::row_to_json(row)};
            res.code = 201;
            return res;
        } catch (const pqxx::unique_violation&) {
            return crow::response{409, "an RSVP with that phone already exists"};
        } catch (const std::exception& e) {
            return crow::response{500, std::string{"db error: "} + e.what()};
        }
    });

    // DELETE /api/rsvps/<id> — remove an RSVP.
    CROW_ROUTE(app, "/api/rsvps/<int>").methods("DELETE"_method)([&dsn](int id) {
        try {
            pqxx::connection conn{dsn};
            pqxx::work tx{conn};
            pqxx::result r = tx.exec_params("DELETE FROM rsvps WHERE id = $1", id);
            tx.commit();

            if (r.affected_rows() == 0) return crow::response{404, "not found"};
            return crow::response{204};
        } catch (const std::exception& e) {
            return crow::response{500, std::string{"db error: "} + e.what()};
        }
    });

    // POST /api/game — store (or replace) one game's score for a player. Upserts
    // on (rsvp, game, trial) so a retry overwrites rather than duplicates. A score
    // of 0 is valid, so presence is checked with has() rather than truthiness.
    CROW_ROUTE(app, "/api/game").methods("POST"_method)([&dsn](const crow::request& req) {
        try {
            const auto x = crow::json::load(req.body);
            if (!x || !x.has("rsvp_id") || !x.has("game") || !x.has("trial") || !x.has("score"))
                return crow::response{400, std::string{"Unable to parse request body. Requires (rsvp_id, game, trial, score)"}};

            std::optional<std::string> details;
            if (x.has("details") && x["details"].t() == crow::json::type::Object) {
                details = crow::json::wvalue(x["details"]).dump();
            };

            const int rsvp = static_cast<int>(x["rsvp_id"].i());
            const std::string game = std::string(x["game"].s());
            const int trial = static_cast<int>(x["trial"].i());
            const int score = static_cast<int>(x["score"].i());

            pqxx::connection conn{dsn};
            pqxx::work tx{conn};
            tx.exec_params("INSERT INTO game_scores "
                           "(rsvp, game, trial, score, details) "
                           "VALUES ($1, $2, $3, $4, $5) "
                           "ON CONFLICT (rsvp, game, trial) DO UPDATE "
                           "SET score = EXCLUDED.score, details = EXCLUDED.details;",
                           rsvp, game, trial, score, details);
            tx.commit();

            crow::json::wvalue j;
            j["status"] = "ok";
            return crow::response{200, j};
        } catch (std::exception& e) {
            return crow::response{500, std::string{"db error: "} + e.what()};
        }
    });

    // POST /api/scores — read the trigger-maintained standing for one player and
    // return their seed/rank within the field. The per-game scores were already
    // persisted via /api/game (which updates standings), so this just ranks.
    CROW_ROUTE(app, "/api/scores").methods("POST"_method)([&dsn](const crow::request& req) {
        try {
            const auto x = crow::json::load(req.body);
            if (!x || !x.has("rsvp_id"))
                return crow::response{400, std::string{"rsvp_id is required"}};
            const int rsvp = static_cast<int>(x["rsvp_id"].i());

            pqxx::connection conn{dsn};
            pqxx::work tx{conn};
            pqxx::result rows = tx.exec_params(
                "WITH ranked AS ("
                "  SELECT rsvp, total_score, "
                "         ROW_NUMBER() OVER (ORDER BY total_score DESC) AS rank, "
                "         COUNT(*) OVER () AS total_players "
                "  FROM standings) "
                "SELECT rsvp, total_score, rank, total_players FROM ranked WHERE rsvp = $1;",
                rsvp);
            tx.commit();

            if (rows.empty()) return crow::response{404, "no standing for that rsvp"};
            const auto& row = rows[0];
            const int rank = row["rank"].as<int>();
            crow::json::wvalue j;
            j["rsvp_id"]          = row["rsvp"].as<int>();
            j["cumulative_score"] = row["total_score"].as<int>();
            j["seed"]             = rank;
            j["rank"]             = rank;
            j["total_players"]    = row["total_players"].as<int>();
            return crow::response{200, j};
        } catch (const std::exception& e) {
            return crow::response{500, std::string{"db error: "} + e.what()};
        }
    });

    // POST /api/unrsvp — withdraw an RSVP located by phone, logging the reason in
    // the decommits table. Deleting the RSVP cascades to its game_scores and
    // standings. A player may re-RSVP later; their decommit rows persist.
    CROW_ROUTE(app, "/api/unrsvp").methods("POST"_method)([&dsn](const crow::request& req) {
        const auto in = crow::json::load(req.body);
        if (!in || !in.has("phone") || !in.has("reason"))
            return crow::response{400, "phone and reason are required"};
        if (in["phone"].t() != crow::json::type::String ||
            in["reason"].t() != crow::json::type::String)
            return crow::response{400, "phone and reason must be strings"};

        const std::string phone  = std::string(in["phone"].s());
        const std::string reason = std::string(in["reason"].s());
        if (reason.size() < 20)
            return crow::response{400, "please tell us a bit more about why"};

        try {
            pqxx::connection conn{dsn};
            pqxx::work tx{conn};
            pqxx::result found =
                tx.exec_params("SELECT id FROM rsvps WHERE phone = $1", phone);
            if (found.empty()) {
                tx.commit();
                return crow::response{404, "No RSVP found for that phone"};
            }
            tx.exec_params("INSERT INTO decommits (phone, reason) VALUES ($1, $2)",
                           phone, reason);
            tx.exec_params("DELETE FROM rsvps WHERE phone = $1", phone);
            tx.commit();

            crow::json::wvalue j;
            j["status"] = "ok";
            return crow::response{200, j};
        } catch (const std::exception& e) {
            return crow::response{500, std::string{"db error: "} + e.what()};
        }
    });

    // GET /api/standings — leaderboard with each player's per-game breakdown.
    // LEFT JOIN from rsvps so spectators (who never submit games and thus have no
    // standings row) still appear; the frontend lists them separately with no
    // score. rsvp_type/vibes live on rsvps, not standings.
    CROW_ROUTE(app, "/api/standings").methods("GET"_method)([&dsn]() {
        try {
            pqxx::connection conn{dsn};
            pqxx::work tx{conn};
            pqxx::result r = tx.exec(
                "SELECT r.id AS rsvp_id, r.name, r.rsvp_type, r.vibes, "
                "       COALESCE(s.total_score, 0) AS cumulative_score, "
                "       ROW_NUMBER() OVER (ORDER BY COALESCE(s.total_score, 0) DESC) AS rank, "
                "       COALESCE((SELECT json_agg(json_build_object("
                "           'game', g.game, 'trial', g.trial, "
                "           'score', g.score, 'details', g.details) ORDER BY g.game) "
                "         FROM game_scores g WHERE g.rsvp = r.id), '[]') AS games "
                "FROM rsvps r LEFT JOIN standings s ON s.rsvp = r.id "
                "ORDER BY cumulative_score DESC;");
            tx.commit();

            std::vector<crow::json::wvalue> items;
            for (const auto& row : r) items.push_back(db::standing_to_json(pqxx::row{row}));
            return crow::response{crow::json::wvalue(items)};
        } catch (const std::exception& e) {
            return crow::response{500, std::string{"db error: "} + e.what()};
        }
    });

    const auto port = static_cast<std::uint16_t>(std::stoi(db::env_or("PORT", "8080")));
    CROW_LOG_INFO << "RSVP server listening on port " << port;
    unsigned int concurrency{4};
    app.port(port).concurrency(concurrency).run();
    return 0;
}
