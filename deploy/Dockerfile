# syntax=docker/dockerfile:1

# Build stage — compile the Crow + libpqxx server with vcpkg.
#
# This is the slow part: vcpkg builds Crow, asio, OpenSSL and libpq (from
# PostgreSQL source) from scratch. Thanks to layer caching that only happens
# when apps/server/vcpkg.json changes — editing C++ source recompiles just the
# server, not the dependency tree.
FROM debian:bookworm AS build

# Tools vcpkg needs to bootstrap and to build the ports above (bison/flex/perl
# are for the PostgreSQL/OpenSSL builds).
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential cmake ninja-build git curl zip unzip tar \
        pkg-config bison flex perl python3 \
        autoconf automake libtool m4 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# vcpkg, cloned fresh — the repo's vendored copy is gitignored and host-specific.
# For fully reproducible builds, pin a release tag (e.g. --branch 2025.12.13)
# and add a "builtin-baseline" to apps/server/vcpkg.json.
ENV VCPKG_ROOT=/opt/vcpkg
RUN git clone --depth 1 https://github.com/microsoft/vcpkg "$VCPKG_ROOT" \
    && "$VCPKG_ROOT/bootstrap-vcpkg.sh" -disableMetrics

WORKDIR /src

# 1) Resolve C++ dependencies first so they stay cached across source edits.
COPY apps/server/vcpkg.json apps/server/vcpkg.json
RUN cd apps/server && "$VCPKG_ROOT/vcpkg" install --triplet x64-linux

# 2) Build the server itself in Release (the checked-in preset is Debug).
COPY apps/server apps/server
RUN cmake -S apps/server -B apps/server/build -G Ninja \
        -DCMAKE_TOOLCHAIN_FILE="$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake" \
        -DCMAKE_BUILD_TYPE=Release \
    && cmake --build apps/server/build

# Runtime stage — just the binary and the few shared libs it still needs.
FROM debian:bookworm-slim AS runtime

# vcpkg static-links most things; these cover the remaining dynamic deps plus
# CA certs (TLS to the DB) and curl (container healthcheck).
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates libstdc++6 libssl3 zlib1g curl \
    && rm -rf /var/lib/apt/lists/*

# Run unprivileged.
RUN useradd --system --uid 10001 --no-create-home appuser
COPY --from=build /src/apps/server/build/server /usr/local/bin/server

ENV PORT=8080
EXPOSE 8080
USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["server"]
