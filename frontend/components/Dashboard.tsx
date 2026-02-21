"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MetricCard from "./MetricCard";
import PriceChart from "./PriceChart";
import PnlChart from "./PnlChart";

export type StreamEvent = {
  timestamp: string;
  spot_price: number;
  forecast_price: number;
  signal: string;
  inventory_mwh: number;
  cash: number;
  pnl: number;
  grid_load_mw: number;
  traffic_index: number;
  temp_c: number;
};

const DEFAULT_WS = "ws://localhost:8000/ws/stream";

export default function Dashboard() {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? DEFAULT_WS;
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "disconnected">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setStatus("live");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as StreamEvent;
        setEvents((prev) => {
          const next = [...prev, data];
          return next.slice(-180);
        });
      } catch (err) {
        console.error("Bad payload", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  const latest = events[events.length - 1];

  const signalBadge = useMemo(() => {
    if (!latest) return { text: "No data", className: "badge tag-warn" };
    const map: Record<string, { text: string; className: string }> = {
      buy: { text: "Buy", className: "badge tag-ok" },
      sell: { text: "Sell", className: "badge tag-warn" },
      hold: { text: "Hold", className: "badge" },
    };
    return map[latest.signal] ?? { text: latest.signal, className: "badge" };
  }, [latest]);

  return (
    <main style={{ padding: "28px", maxWidth: 1320, margin: "0 auto" }}>
      <section style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            Realtime arbitrage + grid stability sim
          </p>
          <h1 style={{ fontSize: 34, marginBottom: 8 }}>Grid Arbitrage Command</h1>
          <p style={{ color: "var(--muted)", maxWidth: 640 }}>
            Streams CSV-based weather, load, and traffic data into an execution loop. The backend forecasts spreads and
            pushes signals over WebSockets. You can swap the CSVs or tweak the backend strategy for new scenarios.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className={`badge ${status === "live" ? "tag-ok" : "tag-warn"}`}>
            {status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Disconnected"}
          </span>
          <span className={signalBadge.className}>{signalBadge.text}</span>
        </div>
      </section>

      <section className="metrics-row">
        <MetricCard title="Spot Price" value={latest ? `$${latest.spot_price.toFixed(2)}` : "--"} sub="per MWh" />
        <MetricCard title="Forecast" value={latest ? `$${latest.forecast_price.toFixed(2)}` : "--"} sub="short horizon" />
        <MetricCard title="Inventory" value={latest ? `${latest.inventory_mwh.toFixed(2)} MWh` : "--"} sub="virtual plant" />
        <MetricCard title="Cash" value={latest ? `$${latest.cash.toFixed(0)}` : "--"} sub="running balance" />
        <MetricCard title="PnL" value={latest ? `$${latest.pnl.toFixed(2)}` : "--"} sub="mark-to-market" accent={latest && latest.pnl >= 0 ? "positive" : "negative"} />
        <MetricCard title="Grid Load" value={latest ? `${latest.grid_load_mw.toFixed(0)} MW` : "--"} sub="demand" />
        <MetricCard title="Traffic" value={latest ? `${latest.traffic_index.toFixed(0)} / 100` : "--"} sub="demand proxy" />
        <MetricCard title="Temp" value={latest ? `${latest.temp_c.toFixed(1)} °C` : "--"} sub="weather" />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Price vs Forecast</h3>
          <PriceChart data={events} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>PnL & Signals</h3>
          <PnlChart data={events} />
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3>Recent Ticks</h3>
          <small style={{ color: "var(--muted)" }}>Showing latest {events.length} / 180</small>
        </div>
        <div style={{ maxHeight: 300, overflow: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "rgba(255,255,255,0.03)" }}>
              <tr>
                {[
                  "Time",
                  "Spot",
                  "Forecast",
                  "Signal",
                  "PnL",
                  "Inv",
                  "Load",
                  "Traffic",
                  "Temp",
                ].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "var(--muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...events].reverse().map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 10px", fontSize: 12, color: "var(--muted)" }}>{new Date(row.timestamp).toLocaleTimeString()}</td>
                  <td style={{ padding: "8px 10px" }}>${row.spot_price.toFixed(2)}</td>
                  <td style={{ padding: "8px 10px" }}>${row.forecast_price.toFixed(2)}</td>
                  <td style={{ padding: "8px 10px", color: row.signal === "buy" ? "var(--accent-2)" : row.signal === "sell" ? "var(--danger)" : "var(--text)" }}>
                    {row.signal}
                  </td>
                  <td style={{ padding: "8px 10px", color: row.pnl >= 0 ? "var(--accent-2)" : "var(--danger)" }}>
                    ${row.pnl.toFixed(2)}
                  </td>
                  <td style={{ padding: "8px 10px" }}>{row.inventory_mwh.toFixed(2)}</td>
                  <td style={{ padding: "8px 10px" }}>{row.grid_load_mw.toFixed(0)} MW</td>
                  <td style={{ padding: "8px 10px" }}>{row.traffic_index.toFixed(0)}</td>
                  <td style={{ padding: "8px 10px" }}>{row.temp_c.toFixed(1)} °C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
