# Line Follower PID Simulator

Browser-based PID learning and simulation tool for fast line follower robots.
Phase 1: core simulator. See `linefollower-sim-spec.md` for the full spec.

## Architecture

The real-time physics/PID loop runs **client-side** (browser, ~100 Hz) for
smooth animation and cheap scaling. The Python backend is **stateless** and owns
the platform library, track definitions, calibration helpers, and (Phase 3) code
generation.

```
Browser (React + Bootstrap)  ──/api──►  FastAPI (uvicorn)
        served by nginx  ◄── static ──  built SPA (frontend/dist)
```

## Prerequisites

- Python 3.11+
- Node 18+

## Run locally (dev)

Backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend (separate terminal):

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173  (proxies /api -> :8000)
```

Verify: open http://localhost:5173 — the top-right badge should read **API: ok**.

## Production (nginx on Linux)

Deploy path on the server: **`/opt/robot/pidsim`** (app root). nginx serves the
built SPA from `/opt/robot/pidsim/frontend/dist`.

```bash
cd frontend && npm run build           # outputs frontend/dist
# run the backend (systemd or similar):
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Use `deploy/nginx.conf` as the site config. Server-specific conventions (service
user, systemd unit, TLS/subdomain, backend port) are being aligned with the
existing MatamoeBookings deployment on the same host.

## Layout

```
backend/    FastAPI app, platform/track data, codegen (Phase 3)
frontend/   React + Bootstrap SPA; src/sim/ holds the client-side engine
deploy/     nginx config
```

## Milestones (Phase 1)

- [x] **M0** Scaffold + nginx deploy path
- [ ] **M1** Sim engine (physics, PID, sensors) — pure JS, unit-tested
- [ ] **M2** Canvas rendering + telemetry graphs
- [ ] **M3** Controls + platform library API
- [ ] **M4** Calibration wizard
- [ ] **M5** Guided teaching mode
- [ ] **M6** Auto-save + polish
```
