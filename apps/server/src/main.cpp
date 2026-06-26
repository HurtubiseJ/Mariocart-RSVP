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
        .origin("*")
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
                "favorite_character, message, created_at "
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
                "SELECT id, name, email, phone, attending, guests, "
                "favorite_character, message, created_at "
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

        const std::string name  = std::string(in["name"].s());
        const std::string email = std::string(in["email"].s());
        const std::string phone = std::string(in["phone"].s());
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
                "(name, email, phone, attending, guests, favorite_character, message) "
                "VALUES ($1, $2, $3, $4, $5, $6, $7) "
                "RETURNING id, name, email, phone, attending, guests, "
                "favorite_character, message, created_at",
                name, email, phone, attending, guests, favorite_character, message);
            tx.commit();

            crow::response res{db::row_to_json(row)};
            res.code = 201;
            return res;
        } catch (const pqxx::unique_violation&) {
            return crow::response{409, "an RSVP with that email already exists"};
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

    const auto port = static_cast<std::uint16_t>(std::stoi(db::env_or("PORT", "8080")));
    CROW_LOG_INFO << "RSVP server listening on port " << port;
    app.port(port).multithreaded().run();
    return 0;
u}
