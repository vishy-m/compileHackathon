from __future__ import annotations

import asyncio
import csv
from collections import deque
from pathlib import Path
from typing import Any, AsyncIterator, Deque, Dict, List


def load_csv(path: Path) -> List[Dict[str, Any]]:
    """Load a CSV file into a list of dict rows."""
    with path.open() as fh:
        reader = csv.DictReader(fh)
        return [row for row in reader]


class Dataset:
    def __init__(self, base_path: Path) -> None:
        self.base_path = base_path
        self.weather: List[Dict[str, Any]] = []
        self.grid: List[Dict[str, Any]] = []
        self.traffic: List[Dict[str, Any]] = []

    def load(self) -> None:
        self.weather = load_csv(self.base_path / "weather.csv")
        self.grid = load_csv(self.base_path / "grid.csv")
        self.traffic = load_csv(self.base_path / "traffic.csv")

    def min_length(self) -> int:
        return min(len(self.weather), len(self.grid), len(self.traffic))


class SimulationSession:
    def __init__(self, dataset: Dataset, tick_seconds: float = 0.6) -> None:
        self.dataset = dataset
        self.tick_seconds = tick_seconds
        self.prices: Deque[float] = deque(maxlen=14)
        self.cash = 100_000.0
        self.inventory_mwh = 0.0
        self.starting_equity = self.cash

    async def stream(self) -> AsyncIterator[Dict[str, Any]]:
        """Yield simulated ticks derived from the CSV data."""
        total = self.dataset.min_length()
        for idx in range(total):
            weather = self.dataset.weather[idx]
            grid = self.dataset.grid[idx]
            traffic = self.dataset.traffic[idx]

            spot_price = float(grid["spot_price"])  # price per MWh
            grid_load = float(grid["grid_load_mw"])
            traffic_idx = float(traffic["congestion_index"])
            temp_c = float(weather["temp_c"])

            forecast_price = self._forecast_price(spot_price, grid_load, traffic_idx, temp_c)
            signal = self._decide(spot_price, forecast_price)

            equity = self.cash + self.inventory_mwh * spot_price
            pnl = equity - self.starting_equity

            event = {
                "timestamp": grid["timestamp"],
                "spot_price": round(spot_price, 2),
                "forecast_price": round(forecast_price, 2),
                "signal": signal,
                "inventory_mwh": round(self.inventory_mwh, 3),
                "cash": round(self.cash, 2),
                "pnl": round(pnl, 2),
                "grid_load_mw": round(grid_load, 2),
                "traffic_index": round(traffic_idx, 2),
                "temp_c": round(temp_c, 2),
            }

            yield event
            await asyncio.sleep(self.tick_seconds)

    def _forecast_price(self, spot_price: float, grid_load: float, traffic_idx: float, temp_c: float) -> float:
        # Mildly reactive model: demand (traffic, grid load) lifts price, cooler temps lift heating load.
        demand_lift = 0.003 * (traffic_idx - 50) / 50 + 0.002 * (grid_load - 700) / 300
        weather_lift = 0.002 * max(0.0, 18 - temp_c) / 10
        baseline = spot_price
        return baseline * (1 + demand_lift + weather_lift)

    def _decide(self, spot_price: float, forecast_price: float) -> str:
        self.prices.append(spot_price)
        moving_avg = sum(self.prices) / len(self.prices)

        # Threshold strategy: lean into forecast spread and short-term mean reversion.
        bullish = forecast_price > moving_avg * 1.004
        bearish = forecast_price < moving_avg * 0.996

        position_size = 1.0  # MWh per tick

        if bullish:
            self.inventory_mwh += position_size
            self.cash -= spot_price * position_size
            return "buy"
        if bearish and self.inventory_mwh > 0:
            self.inventory_mwh -= position_size
            self.cash += spot_price * position_size
            return "sell"
        return "hold"
