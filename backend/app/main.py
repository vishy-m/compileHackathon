from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .simulation import Dataset, SimulationSession

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

app = FastAPI(title="Grid Arbitrage Simulator", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def load_datasets() -> None:
    dataset = Dataset(DATA_DIR)
    dataset.load()
    app.state.dataset = dataset


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/api/metadata")
async def metadata() -> dict:
    dataset: Dataset = app.state.dataset
    return {
        "rows": dataset.min_length(),
        "weather_fields": list(dataset.weather[0].keys()) if dataset.weather else [],
        "grid_fields": list(dataset.grid[0].keys()) if dataset.grid else [],
        "traffic_fields": list(dataset.traffic[0].keys()) if dataset.traffic else [],
    }


@app.get("/api/preview")
async def preview() -> dict:
    dataset: Dataset = app.state.dataset
    limit = min(3, dataset.min_length())
    return {
        "weather": dataset.weather[:limit],
        "grid": dataset.grid[:limit],
        "traffic": dataset.traffic[:limit],
    }


@app.websocket("/ws/stream")
async def stream(ws: WebSocket) -> None:
    await ws.accept()
    dataset: Dataset = app.state.dataset
    session = SimulationSession(dataset)

    try:
        async for event in session.stream():
            await ws.send_json(event)
    except WebSocketDisconnect:
        return


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
