cmake_minimum_required(VERSION 3.21)
project(mariokart_rsvp_server LANGUAGES CXX)

# Modern C++ — libpqxx 7 requires C++17, Crow is happy with it too.
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Dependencies are installed by vcpkg (see vcpkg.json). The toolchain file is
# supplied by the CMake preset, which wires vcpkg in automatically.
find_package(Crow CONFIG REQUIRED)
find_package(libpqxx CONFIG REQUIRED)
find_package(Threads REQUIRED)

add_executable(server
    src/main.cpp
)

# So `#include "db.hpp"` resolves.
target_include_directories(server PRIVATE src)

target_link_libraries(server PRIVATE
    Crow::Crow
    libpqxx::pqxx
    Threads::Threads
)
