# Deploy — server + Postgres (Docker), fronted by the host's existing Caddy

The frontend goes on Vercel; this directory runs the C++ API and its Postgres
database in Docker, and hands TLS off to the Caddy you already run on this host.

```
Vercel (Next.js) ─HTTPS─> Proxmox host: Caddy ─LAN─> VM 192.168.0.104:8080 ─> server (container)
  (public IP, :443)        (TLS terminates here)                                    │
                                                                                    ▼
                                                                             db (Postgres container)
```

Caddy runs on the Proxmox host and reverse-proxies over the LAN to this VM. The
public HTTPS name is a free **sslip.io** hostname embedding the *host's public
IP*; the proxy target is this *VM's private IP* (`192.168.0.104:8080`).

## First deploy

```sh
cd deploy
cp .env.example .env            # set POSTGRES_PASSWORD (openssl rand -base64 32)
docker compose up -d --build    # first build is slow: vcpkg compiles the deps
```

The server is now on `192.168.0.104:8080` (LAN only — the VM has no public IP;
the Proxmox-host Caddy proxies to it). `BIND_HOST` in `.env` controls the bind.

## Database migrations

Migrations are an explicit, one-shot step (they are *not* run on boot):

```sh
docker compose --profile tools run --rm migrate
```

> ⚠️ `db/migrations/0004_game_score_unique.sql` is currently broken (it is
> marked "MIGRATION NOT YET RUN", references `games_scores`, and adds an
> `rsvp` column with no type). The runner stops on the first error, so it will
> halt at `0004` until that file is fixed. `0001`–`0003` apply fine.

## Wire up Caddy (on the Proxmox host)

Add the block in [`Caddyfile`](./Caddyfile) to the **host's** existing Caddy
config and `systemctl reload caddy`. Two IPs, don't mix them up:

- **Hostname** embeds the **Proxmox host's public IP** (dashed), e.g.
  `mk.203-0-113-7.sslip.io` for public IP `203.0.113.7`. This is what resolves
  publicly and what Let's Encrypt validates — Caddy gets the cert automatically.
- **`reverse_proxy` target** is this **VM's private IP**, `192.168.0.104:8080`.

For the host→VM hop to work, the stack must publish `8080` on the VM's LAN
interface — that's the default here (`BIND_HOST=192.168.0.104`). Requires the
host's public IP to accept inbound `:80`/`:443` (already true, since it serves
your other sites).

## Point the frontend at it

In Vercel project settings set:

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Then tighten CORS (code change, do before going public)

`apps/server/src/main.cpp` currently allows `origin("*")`. Once the domain is
live, restrict it to your Vercel origin so only your site can call the API.

## Operating it

```sh
docker compose logs -f server      # tail logs
docker compose up -d --build       # redeploy after a code change
docker compose down                # stop (keeps the pgdata volume)
```

Backups (the one thing managed Postgres would give you for free):

```sh
docker compose exec db pg_dump -U mariokart mariokart_rsvp > backup_$(date +%F).sql
```

Run that from a cron job on the host and copy the dump off-box.
