# Grid Arbitrage Simulator

Realtime demo that replays CSV data (weather, grid load, traffic) and streams arbitrage/prediction signals over WebSockets to a modern dashboard.

## Stack
- Backend: FastAPI + Uvicorn, WebSocket stream at `/ws/stream`
- Frontend: Next.js 14 + React + Recharts
- Data: sample CSVs in `backend/data` that you can swap or extend

## Quickstart (local)
1) Backend
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
2) Frontend (new terminal)
```
cd frontend
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```
3) Open http://localhost:3000 — the dashboard will auto-connect to `ws://localhost:8000/ws/stream`.

## Docker
```
docker compose up --build
```
Frontend on :3000, backend on :8000.

## How it works
- Backend loads CSVs at startup and for each WebSocket client spawns a session that walks rows, forecasts short-horizon price using load/traffic/temp, and applies a simple threshold strategy (buy/sell/hold). It emits ticks with PnL, inventory, and signals.
- Frontend opens a WebSocket, plots spot vs forecast, tracks PnL/inventory, and shows a rolling table of ticks.

## Customizing
- Swap data: replace files in `backend/data/*.csv` (keep headers consistent and aligned row counts).
- Strategy: edit `backend/app/simulation.py` `_forecast_price` and `_decide`.
- Frontend endpoint: set `NEXT_PUBLIC_WS_URL` env var (compose already wires this).

## Endpoints
- `GET /api/health`
- `GET /api/metadata`
- `GET /api/preview`
- `WS /ws/stream`
