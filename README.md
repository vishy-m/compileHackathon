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
- Modes: `/ws/stream?mode=sim` (default) replays bundled CSVs. `/ws/stream?mode=live` polls external prices for power/contract URLs (`LIVE_POWER_URL`, `LIVE_CONTRACT_URL`) while still using weather/traffic/load context from CSV to shape decisions.
- Retrospective: `GET /api/retro` runs a fast backtest on the current CSVs, returning strategy PnL vs two baselines (cash-only, simple buy-and-hold) plus per-tick traces.

### Dynamical control (deterministic ODE + physical/contract split)
The backend embeds an ideal exposure controller modeled as a first-order ODE over the desired exposure fraction $q(t) \in [0,1]$:

$$\frac{dq}{dt} = \alpha D(t) + \beta S(t) + \delta R(t) - \gamma q(t)$$

- $D(t)$: demand forcing from grid load, traffic congestion, and weather-driven load.
- $S(t)$: price slope (recent $\Delta$spot / spot).
- $R(t)$: risk term (penalizes being overexposed; simple form $R(t) = -q(t)$ in code).
- $(\alpha, \beta, \gamma, \delta)$: tunable weights; $\gamma$ damps runaway accumulation.

Each tick (5-minute simulated step) uses Euler integration to update $q$, then maps to a target exposure $I^* = C q$ where $C$ is virtual capacity (MWh-equivalent). Exposure is split into physical vs contracts using a physical share $\rho(t)$:

$$I^*_{phys} = \rho(t)\,I^*, \quad I^*_{ctr} = (1-\rho(t))\,I^*$$

$\rho(t)$ starts from a base hedge (contracts-heavy) and tilts toward physical when demand/traffic and cold weather imply scarcity risk. Trades drive actual physical inventory toward $I^*_{phys}$ with a guardband to avoid churn; contracts notionally cover the remainder. Forecasted price blends exogenous lift with a control term proportional to the inventory gap $(I^* - I)$.

Tune this in `backend/app/simulation.py` via `alpha`, `beta`, `gamma`, `delta`, `capacity_mwh`, `base_contract_hedge`, and `physical_bias`.

## Customizing
- Swap data: replace files in `backend/data/*.csv` (keep headers consistent and aligned row counts).
- Strategy: edit `backend/app/simulation.py` `_forecast_price` and `_decide`.
- Frontend endpoint: set `NEXT_PUBLIC_WS_URL` env var (compose already wires this). For REST calls like `/api/retro`, set `NEXT_PUBLIC_API_BASE` (default `http://localhost:8000`).
- Live prices: set `LIVE_POWER_URL` and optionally `LIVE_CONTRACT_URL` in the backend environment; then connect frontend with `?mode=live` (or switch in the UI).
- Live price sources: provide any JSON endpoint that returns a numeric field (keys searched: `price`, `spot`, `value`, `last`, `c`, `p`). For quick wiring tests you can point to a harmless numeric JSON you control (e.g., a tiny mock server returning `{ "price": 52.3 }`). Public crypto feeds like Coindesk are not power prices; use them only to verify that “live” mode plumbs through. For real data, point to your own proxy that emits the latest ISO/RTO price or forward.

## Endpoints
- `GET /api/health`
- `GET /api/metadata`
- `GET /api/preview`
- `GET /api/retro`
- `WS /ws/stream`
