from __future__ import annotations

import asyncio
import csv
import os
from collections import deque
from datetime import datetime
from pathlib import Path
from typing import Any, AsyncIterator, Deque, Dict, List, Optional

import httpx


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

        # Dynamical model parameters (dimensionless) for the ideal purchase trajectory q(t) in [0, 1].
        self.dt_minutes = 5.0  # each CSV row represents a 5-minute step in the simulation timeline
        self.alpha = 0.35  # demand forcing weight
        self.beta = 0.50  # price slope sensitivity
        self.gamma = 0.12  # damping to avoid runaway inventory
        self.delta = 0.15  # risk term weight
        self.capacity_mwh = 50.0  # virtual plant capacity used for targeting
        self.state_q = 0.20  # initial desired fraction of capacity

        # Hedging split: rho is physical share, (1 - rho) is contracts share of exposure.
        self.base_contract_hedge = 0.5  # baseline fraction of exposure to keep in contracts
        self.physical_bias = 0.15  # max tilt toward physical when scarcity risk is high

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

            event = self._step(
                timestamp=grid["timestamp"],
                spot_price=spot_price,
                grid_load=grid_load,
                traffic_idx=traffic_idx,
                temp_c=temp_c,
                forward_price=None,
            )

            yield event
            await asyncio.sleep(self.tick_seconds)

    def _step(
        self,
        *,
        timestamp: str,
        spot_price: float,
        grid_load: float,
        traffic_idx: float,
        temp_c: float,
        forward_price: Optional[float],
    ) -> Dict[str, Any]:
        target_inventory = self._integrate_target_inventory(
            spot_price=spot_price,
            grid_load=grid_load,
            traffic_idx=traffic_idx,
            temp_c=temp_c,
        )

        rho_physical = self._physical_share(
            grid_load=grid_load,
            traffic_idx=traffic_idx,
            temp_c=temp_c,
        )
        target_physical = rho_physical * target_inventory
        target_contracts = max(0.0, target_inventory - target_physical)

        forecast_price = self._forecast_price(
            spot_price=spot_price,
            grid_load=grid_load,
            traffic_idx=traffic_idx,
            temp_c=temp_c,
            target_inventory=target_inventory,
            forward_price=forward_price,
        )
        signal = self._decide(spot_price, forecast_price, target_physical)

        equity = self.cash + self.inventory_mwh * spot_price
        pnl = equity - self.starting_equity

        return {
            "timestamp": timestamp,
            "spot_price": round(spot_price, 2),
            "forecast_price": round(forecast_price, 2),
            "signal": signal,
            "inventory_mwh": round(self.inventory_mwh, 3),
            "cash": round(self.cash, 2),
            "pnl": round(pnl, 2),
            "grid_load_mw": round(grid_load, 2),
            "traffic_index": round(traffic_idx, 2),
            "temp_c": round(temp_c, 2),
            "target_inventory_mwh": round(target_inventory, 3),
            "target_physical_mwh": round(target_physical, 3),
            "target_contract_mwh": round(target_contracts, 3),
            "physical_share": round(rho_physical, 3),
            "forward_price": round(forward_price, 3) if forward_price is not None else None,
        }

    def _integrate_target_inventory(
        self,
        *,
        spot_price: float,
        grid_load: float,
        traffic_idx: float,
        temp_c: float,
    ) -> float:
        """Euler-integrate a simple ODE for desired inventory fraction q(t) in [0, 1]."""

        prev_price = self.prices[-1] if self.prices else spot_price
        price_slope = (spot_price - prev_price) / max(spot_price, 1e-3)

        demand_forcing = 0.5 * (grid_load - 700.0) / 300.0 + 0.5 * (traffic_idx - 50.0) / 50.0
        weather_forcing = 0.3 * max(0.0, 18.0 - temp_c) / 10.0

        # Risk term: slow accumulation if already long vs capacity.
        risk_term = -self.state_q

        total_forcing = demand_forcing + weather_forcing

        dq_dt = self.alpha * total_forcing + self.beta * price_slope + self.delta * risk_term - self.gamma * self.state_q
        dt_scale = self.dt_minutes / 5.0  # CSV cadence is 5 minutes per row
        self.state_q += dt_scale * dq_dt
        self.state_q = max(0.0, min(1.0, self.state_q))

        return self.capacity_mwh * self.state_q

    def _forecast_price(
        self,
        *,
        spot_price: float,
        grid_load: float,
        traffic_idx: float,
        temp_c: float,
        target_inventory: float,
        forward_price: Optional[float],
    ) -> float:
        # Reactive component: demand (traffic, grid load) and cooler temps lift price.
        demand_lift = 0.003 * (traffic_idx - 50) / 50 + 0.002 * (grid_load - 700) / 300
        weather_lift = 0.002 * max(0.0, 18 - temp_c) / 10

        term_structure_lift = 0.0
        if forward_price is not None:
            term_structure_lift = 0.002 * (forward_price - spot_price) / max(spot_price, 1e-3)

        # Deterministic control component: if desired inventory is above current, expect tightening.
        inv_gap = target_inventory - self.inventory_mwh
        control_lift = 0.0008 * inv_gap

        baseline = spot_price
        return baseline * (1 + demand_lift + weather_lift + term_structure_lift) + control_lift

    def _decide(self, spot_price: float, forecast_price: float, target_inventory: float) -> str:
        self.prices.append(spot_price)
        moving_avg = sum(self.prices) / len(self.prices)

        # Drive toward the ODE-derived target inventory using small discrete trades.
        position_size = 1.0  # MWh per tick
        gap = target_inventory - self.inventory_mwh

        # Keep a small guardband to avoid churn.
        if abs(gap) < 0.25:
            return "hold"

        # Blend deterministic target with short-term price deviation.
        bullish = forecast_price > moving_avg * 1.002
        bearish = forecast_price < moving_avg * 0.998

        if gap > 0 and bullish:
            trade = min(position_size, gap)
            self.inventory_mwh += trade
            self.cash -= spot_price * trade
            return "buy"
        if gap < 0 and bearish and self.inventory_mwh > 0:
            trade = min(position_size, min(-gap, self.inventory_mwh))
            self.inventory_mwh -= trade
            self.cash += spot_price * trade
            return "sell"
        return "hold"

    def _physical_share(self, *, grid_load: float, traffic_idx: float, temp_c: float) -> float:
        """Compute rho(t): fraction of exposure allocated to physical inventory.

        - Start with (1 - base_contract_hedge) physical; contracts hedge the rest.
        - Tilt toward physical when demand/traffic and cold weather imply scarcity.
        - Clip to [0, 1].
        """

        base_physical = 1.0 - self.base_contract_hedge

        demand_pressure = 0.5 * (grid_load - 700.0) / 300.0 + 0.5 * (traffic_idx - 50.0) / 50.0
        weather_pressure = max(0.0, 18.0 - temp_c) / 10.0

        tilt = self.physical_bias * max(0.0, 0.5 * demand_pressure + 0.5 * weather_pressure)

        rho = base_physical + tilt
        return max(0.0, min(1.0, rho))


class LiveSession(SimulationSession):
    def __init__(
        self,
        dataset: Dataset,
        *,
        tick_seconds: float = 5.0,
        power_url: Optional[str] = None,
        contract_url: Optional[str] = None,
    ) -> None:
        super().__init__(dataset, tick_seconds=tick_seconds)
        self.power_url = power_url or os.getenv("LIVE_POWER_URL")
        self.contract_url = contract_url or os.getenv("LIVE_CONTRACT_URL")
        self._client: Optional[httpx.AsyncClient] = None

    async def _fetch_price(self, url: Optional[str], fallback: float) -> float:
        if not url:
            return fallback
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=5.0)
        try:
            resp = await self._client.get(url)
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, dict):
                for key in ("price", "spot", "value", "last", "c", "p"):
                    if key in data:
                        return float(data[key])
            if isinstance(data, list) and data:
                first = data[0]
                if isinstance(first, dict):
                    for key in ("price", "spot", "value", "last", "c", "p"):
                        if key in first:
                            return float(first[key])
            return fallback
        except Exception:
            return fallback

    async def stream(self) -> AsyncIterator[Dict[str, Any]]:
        total = max(1, self.dataset.min_length())
        idx = 0
        try:
            while True:
                row_idx = idx % total
                weather = self.dataset.weather[row_idx]
                grid = self.dataset.grid[row_idx]
                traffic = self.dataset.traffic[row_idx]

                baseline_spot = float(grid["spot_price"])
                grid_load = float(grid["grid_load_mw"])
                traffic_idx = float(traffic["congestion_index"])
                temp_c = float(weather["temp_c"])

                power_price = await self._fetch_price(self.power_url, baseline_spot)
                contract_price = await self._fetch_price(self.contract_url, power_price)

                event = self._step(
                    timestamp=datetime.utcnow().isoformat() + "Z",
                    spot_price=power_price,
                    grid_load=grid_load,
                    traffic_idx=traffic_idx,
                    temp_c=temp_c,
                    forward_price=contract_price,
                )
                event["mode"] = "live"
                event["baseline_spot"] = baseline_spot

                yield event
                idx += 1
                await asyncio.sleep(self.tick_seconds)
        finally:
            if self._client is not None:
                await self._client.aclose()


def run_backtest(dataset: Dataset) -> Dict[str, Any]:
    """Run a fast backtest comparing strategy vs simple baselines."""

    session = SimulationSession(dataset, tick_seconds=0.0)
    total = dataset.min_length()
    if total == 0:
        return {"events": [], "summary": {"strategy_pnl": 0.0, "baseline_cash_only_pnl": 0.0, "baseline_buyhold_pnl": 0.0, "delta_vs_cash": 0.0, "delta_vs_buyhold": 0.0}}

    start_price = float(dataset.grid[0]["spot_price"])
    cash_only_start = session.cash
    buyhold_inventory = cash_only_start / max(start_price, 1e-3)

    events: List[Dict[str, Any]] = []

    for idx in range(total):
        weather = dataset.weather[idx]
        grid = dataset.grid[idx]
        traffic = dataset.traffic[idx]

        spot_price = float(grid["spot_price"])
        grid_load = float(grid["grid_load_mw"])
        traffic_idx = float(traffic["congestion_index"])
        temp_c = float(weather["temp_c"])

        event = session._step(
            timestamp=grid["timestamp"],
            spot_price=spot_price,
            grid_load=grid_load,
            traffic_idx=traffic_idx,
            temp_c=temp_c,
            forward_price=None,
        )

        equity_cash_only = cash_only_start
        equity_buyhold = buyhold_inventory * spot_price

        event["baseline_cash_only_pnl"] = round(equity_cash_only - cash_only_start, 2)
        event["baseline_buyhold_pnl"] = round(equity_buyhold - cash_only_start, 2)
        events.append(event)

    strategy_pnl = events[-1]["pnl"] if events else 0.0
    baseline_buyhold_pnl = events[-1]["baseline_buyhold_pnl"] if events else 0.0

    summary = {
        "strategy_pnl": strategy_pnl,
        "baseline_cash_only_pnl": 0.0,
        "baseline_buyhold_pnl": baseline_buyhold_pnl,
        "delta_vs_cash": strategy_pnl,
        "delta_vs_buyhold": strategy_pnl - baseline_buyhold_pnl,
    }

    return {"events": events, "summary": summary}
