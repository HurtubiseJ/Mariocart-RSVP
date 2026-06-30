#pragma once

// Small database helpers kept out of main.cpp so the route code stays readable.
// Header-only on purpose — this is a learning project, not a library.

#include <crow/json.h>
#include <pqxx/pqxx>

#include <cstdlib>
#include <string>

namespace db {

// Read an environment variable, falling back to a default when it is unset.
inline std::string env_or(const char* key, const std::string& fallback) {
    const char* value = std::getenv(key);
    return value ? std::string(value) : fallback;
}

// libpq connection string. Override with DATABASE_URL (see .env).
inline std::string connection_string() {
    return env_or("DATABASE_URL", "postgresql://localhost:5432/mariokart_rsvp");
}

// Convert one row of the rsvps table into a JSON object for the API response.
inline crow::json::wvalue row_to_json(const pqxx::row& row) {
    crow::json::wvalue j;
    j["id"]        = row["id"].as<int>();
    j["name"]      = row["name"].as<std::string>();
    j["email"]     = row["email"].is_null()
        ? crow::json::wvalue()
        : crow::json::wvalue(row["email"].as<std::string>());
    j["phone"]     = row["phone"].as<std::string>();
    j["attending"] = row["attending"].as<bool>();
    j["guests"]    = row["guests"].as<int>();

    // Nullable columns become JSON null when the field is NULL.
    j["favorite_character"] = row["favorite_character"].is_null()
        ? crow::json::wvalue()
        : crow::json::wvalue(row["favorite_character"].as<std::string>());
    j["message"] = row["message"].is_null()
        ? crow::json::wvalue()
        : crow::json::wvalue(row["message"].as<std::string>());

    j["vibes"] = row["vibes"].is_null() 
        ? crow::json::wvalue()
        : crow::json::wvalue(row["vibes"].as<int>());

    j["rsvp_type"] = row["rsvp_type"].is_null()
        ? crow::json::wvalue()
        : crow::json::wvalue(row["rsvp_type"].as<std::string>());

    j["rated_skill"] = row["rated_skill"].as<int>();
    j["num_breaths"] = row["num_breaths"].as<int>();

    j["created_at"] = row["created_at"].as<std::string>();
    return j;
}

// Convert one leaderboard row (standings joined to rsvps, with a json-aggregated
// per-game breakdown) into the JSON the frontend expects. The seed equals the
// rank: highest cumulative score is seed #1.
inline crow::json::wvalue standing_to_json(const pqxx::row& row) {
    crow::json::wvalue j;
    const int rank = row["rank"].as<int>();
    j["rsvp_id"]          = row["rsvp_id"].as<int>();
    j["rsvp_type"]        = row["rsvp_type"].is_null()
        ? crow::json::wvalue(std::string("player"))
        : crow::json::wvalue(row["rsvp_type"].as<std::string>());
    j["name"]             = row["name"].as<std::string>();
    j["cumulative_score"] = row["cumulative_score"].as<int>();
    // vibes is only meaningful for spectators; players (and legacy rows) are null.
    j["vibes"]            = row["vibes"].is_null()
        ? crow::json::wvalue()
        : crow::json::wvalue(row["vibes"].as<int>());
    j["rank"]             = rank;
    j["seed"]             = rank;

    // games arrives as a JSON text column (json_agg); re-parse so it nests as a
    // real array rather than an escaped string.
    const std::string games =
        row["games"].is_null() ? std::string("[]") : row["games"].as<std::string>();
    j["games"] = crow::json::load(games);
    return j;
}

}  // namespace db
