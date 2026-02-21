"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LogOut, Zap, Briefcase, User, ShieldAlert, Cpu, TrendingUp, TrendingDown, BarChart3, Factory, Wallet, Shield, Users } from "lucide-react";
import MetricCard from "./MetricCard";
import PriceChart from "./PriceChart";
import PnlChart from "./PnlChart";
import GridStrainVisualizer from "./GridStrainVisualizer";

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
  target_inventory_mwh?: number;
  target_physical_mwh?: number;
  target_contract_mwh?: number;
  physical_share?: number;
  forward_price?: number | null;
  baseline_spot?: number;
  mode?: string;
};

type DashboardProps = {
  persona: "industry" | "consumer";
  onLogout: () => void;
};

const DEFAULT_WS = "ws://localhost:8000/ws/stream";
const DEFAULT_API = "http://localhost:8000";

const FAKE_FUTURES = [
  { label: "1-Month", price: 54.10, change: +1.8 },
  { label: "3-Month", price: 58.75, change: +3.2 },
  { label: "6-Month", price: 61.20, change: +2.1 },
  { label: "12-Month", price: 55.90, change: -0.4 },
];
const physicalRatio = 60;
const futuresRatio = 40;

export default function Dashboard({ persona, onLogout }: DashboardProps) {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? DEFAULT_WS;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API;
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "disconnected">("connecting");
  const [mode, setMode] = useState<"sim" | "live">("sim");
  const [retroSummary, setRetroSummary] = useState<{ strategy_pnl: number; baseline_buyhold_pnl: number; delta_vs_buyhold: number } | null>(null);
  const [retroLoading, setRetroLoading] = useState(false);
  const [stabilizing, setStabilizing] = useState(false);
  const [ownedContracts, setOwnedContracts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = `${wsUrl}?mode=${mode}`;
    const ws = new WebSocket(url);
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
  }, [wsUrl, mode]);

  const latest = events[events.length - 1];

  const displayGridLoadMw = useMemo(() => {
    if (!latest) return 0;
    return stabilizing ? latest.grid_load_mw * 0.85 : latest.grid_load_mw;
  }, [latest, stabilizing]);

  const signalBadge = useMemo(() => {
    if (!latest) return { text: "No data", className: "badge tag-warn" };
    const map: Record<string, { text: string; className: string }> = {
      buy: { text: "Buy", className: "badge tag-ok" },
      sell: { text: "Sell", className: "badge tag-warn" },
      hold: { text: "Hold", className: "badge tag-info" },
    };
    return map[latest.signal] ?? { text: latest.signal, className: "badge" };
  }, [latest]);

  const handlePurchaseContract = () => {
    setOwnedContracts((c) => c + 1);
    setStabilizing(true);
    setTimeout(() => setStabilizing(false), 5000);
  };

  const handleBailout = () => {
    setStabilizing((s) => !s);
  };

  // Temperature color
  const tempColor = latest
    ? latest.temp_c > 35 ? "var(--negative)" : latest.temp_c > 25 ? "var(--warning)" : "var(--positive)"
    : "var(--muted)";

  return (
    <main style={{ padding: "28px", maxWidth: 1320, margin: "0 auto" }}>
      {/* ── Header ── */}
      <header
        className="glass-panel scan-line ambient-glow-green animate-slide-up"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Zap size={20} color="var(--positive)" />
          <h1 className="text-glow-static-white" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
            COMM PLATFORM
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className={`badge ${persona === "industry" ? "tag-ok" : "tag-info"}`}>
            {persona === "industry" ? <><Factory size={12} /> Industry</> : <><User size={12} /> Consumer</>}
          </span>
          <span className={signalBadge.className}>
            <Cpu size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
            {signalBadge.text}
          </span>
          <span className={`badge ${status === "live" ? "tag-ok" : "tag-warn"}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {status === "live" && <span className="live-indicator" />}
            {status === "live" ? "Connected" : status === "connecting" ? "Connecting" : "Disconnected"}
          </span>
          <select
            value={mode}
            onChange={(e) => {
              setEvents([]);
              setMode(e.target.value as "sim" | "live");
            }}
            style={{
              background: "var(--card)",
              color: "var(--text)",
              padding: "6px 10px",
              border: "1px solid var(--card-border)",
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            <option value="sim">Sim (CSV)</option>
            <option value="live">Live</option>
          </select>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px" }}>
            <LogOut size={14} /> EXIT
          </button>
        </div>
      </header>

      {/* ── Primary Metrics ── */}
      <section className="dashboard-grid animate-slide-up delay-100" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 16 }}>
        <MetricCard title="Spot Price" value={latest ? `$${latest.spot_price.toFixed(2)}` : "--"} sub="per MWh" />
        <MetricCard title="AI Forecast" value={latest ? `$${latest.forecast_price.toFixed(2)}` : "--"} sub="short horizon" />
        <MetricCard
          title="Running PnL"
          value={latest ? `$${latest.pnl.toFixed(2)}` : "--"}
          sub="mark-to-market"
          accent={latest && latest.pnl >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          title="Owned Capacity"
          value={
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span>{ownedContracts}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>contracts</span>
            </div>
          }
          sub="purchased this session"
          accent="neutral"
        />
      </section>

      {/* ── Persona-specific Panel ── */}
      {persona === "industry" ? (
        <section className="glass-panel glow-top-green ambient-glow-green animate-slide-up delay-200" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12, fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--positive)" }}>
            <Factory size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Industry Impact
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <div className="stat-card" style={{ borderColor: "rgba(0,212,170,0.2)" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Infra Saved</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--positive)" }}>$2.4M</div>
            </div>
            <div className="stat-card" style={{ borderColor: "rgba(0,212,170,0.2)" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Blackouts Prevented</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--positive)" }}>17</div>
            </div>
            <div className="stat-card" style={{ borderColor: "rgba(0,212,170,0.2)" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Communities</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--positive)" }}>340K</div>
            </div>
            <div className="stat-card" style={{ borderColor: "rgba(0,212,170,0.2)" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Demand Absorbed</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--positive)" }}>72%</div>
            </div>
          </div>
        </section>
      ) : (
        <section className="glass-panel glow-top-blue ambient-glow-blue animate-slide-up delay-200" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12, fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--info)" }}>
            <Shield size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Consumer Benefits
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <div className="stat-card" style={{ borderColor: "rgba(78,168,222,0.2)" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Monthly Savings</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--info)" }}>$127</div>
            </div>
            <div className="stat-card" style={{ borderColor: "rgba(78,168,222,0.2)" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Portfolio Value</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--info)" }}>$8,420</div>
            </div>
            <div className="stat-card" style={{ borderColor: "rgba(78,168,222,0.2)" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Protection Events</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--info)" }}>3</div>
            </div>
            <div className="stat-card" style={{ borderColor: "rgba(78,168,222,0.2)" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Market Rate vs Yours</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--info)" }}>
                -35%
              </div>
              <div style={{ height: 4, background: "var(--card-border)", marginTop: 8, position: "relative" }}>
                <div style={{ height: "100%", width: "65%", background: "var(--info)" }} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Two-column Layout ── */}
      <section className="dashboard-columns animate-slide-up delay-300">
        {/* Left Column - Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GridStrainVisualizer loadMw={displayGridLoadMw} isStabilizing={stabilizing} />

          <div className="glass-panel glass-panel-hover-green">
            <h3 style={{ marginBottom: 12, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Price vs Forecast</h3>
            <PriceChart data={events} />
          </div>

          <div className="glass-panel glass-panel-hover-blue">
            <h3 style={{ marginBottom: 12, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>PnL & Signals</h3>
            <PnlChart data={events} />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Market Overview */}
          <div className="glass-panel glow-top-green ambient-glow-green shimmer">
            <h3 style={{ marginBottom: 12, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>
              <BarChart3 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Market Overview
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontSize: 11, color: "var(--muted)", padding: "4px 0", textTransform: "uppercase" }}>Contract</th>
                  <th style={{ textAlign: "right", fontSize: 11, color: "var(--muted)", padding: "4px 0", textTransform: "uppercase" }}>Price</th>
                  <th style={{ textAlign: "right", fontSize: 11, color: "var(--muted)", padding: "4px 0", textTransform: "uppercase" }}>Chg</th>
                </tr>
              </thead>
              <tbody>
                {FAKE_FUTURES.map((f) => (
                  <tr key={f.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "6px 0", fontSize: 13 }}>{f.label}</td>
                    <td style={{ padding: "6px 0", fontSize: 13, textAlign: "right" }}>${f.price.toFixed(2)}</td>
                    <td style={{ padding: "6px 0", fontSize: 13, textAlign: "right", color: f.change >= 0 ? "var(--positive)" : "var(--negative)" }}>
                      {f.change >= 0 ? "+" : ""}{f.change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Market Depth */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Market Depth</div>
              <div style={{ display: "flex", height: 8, gap: 2 }}>
                <div style={{ width: "62%", background: "var(--positive)", transition: "width 0.5s ease" }} />
                <div style={{ width: "38%", background: "var(--negative)", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11 }}>
                <span style={{ color: "var(--positive)" }}>62% Buy</span>
                <span style={{ color: "var(--negative)" }}>38% Sell</span>
              </div>
            </div>

            {/* Contract Ratio */}
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Contract Ratio</div>
              <div style={{ display: "flex", height: 8, gap: 2 }}>
                <div style={{ width: `${physicalRatio}%`, background: "var(--positive)" }} />
                <div style={{ width: `${futuresRatio}%`, background: "var(--info)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11 }}>
                <span style={{ color: "var(--positive)" }}>{physicalRatio}% Physical</span>
                <span style={{ color: "var(--info)" }}>{futuresRatio}% Futures</span>
              </div>
            </div>
          </div>

          {/* Market Actions */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: 12, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Market Actions</h3>
            <button
              className="btn-primary"
              onClick={handlePurchaseContract}
              style={{ width: "100%", marginBottom: 10 }}
            >
              Buy Capacity Contract
            </button>
            {persona === "industry" && (
              <button
                onClick={handleBailout}
                style={{
                  width: "100%",
                  borderColor: stabilizing ? "var(--warning)" : "var(--card-border)",
                  color: stabilizing ? "var(--warning)" : "var(--text)",
                  boxShadow: stabilizing ? "0 0 12px rgba(245,158,11,0.2)" : "none",
                }}
              >
                {stabilizing ? "⚡ Grid Bailout Active" : "Grid Bailout"}
              </button>
            )}
          </div>

          {/* Environmental Factors */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: 12, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Environmental</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Temperature</span>
                <span style={{ fontSize: 12, color: tempColor }}>{latest ? `${latest.temp_c.toFixed(1)}°C` : "--"}</span>
              </div>
              <div style={{ height: 6, background: "var(--card-border)" }}>
                <div
                  style={{
                    height: "100%",
                    width: latest ? `${Math.min((latest.temp_c / 50) * 100, 100)}%` : "0%",
                    background: tempColor,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Traffic Index</span>
                <span style={{ fontSize: 12, color: "var(--info)" }}>{latest ? `${latest.traffic_index.toFixed(0)} / 100` : "--"}</span>
              </div>
              <div style={{ height: 6, background: "var(--card-border)" }}>
                <div
                  style={{
                    height: "100%",
                    width: latest ? `${latest.traffic_index}%` : "0%",
                    background: "var(--info)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Retrospective backtest */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: 8, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Backtest</h3>
            <p style={{ color: "var(--muted)", fontSize: 12, margin: "0 0 10px" }}>Strategy vs buy-and-hold on CSVs.</p>
            {retroSummary && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Δ vs buy-and-hold</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: retroSummary.delta_vs_buyhold >= 0 ? "var(--positive)" : "var(--negative)" }}>
                  ${retroSummary.delta_vs_buyhold.toFixed(2)}
                </div>
              </div>
            )}
            <button
              onClick={async () => {
                setRetroLoading(true);
                try {
                  const res = await fetch(`${apiBase}/api/retro`);
                  const data = await res.json();
                  setRetroSummary({
                    strategy_pnl: data.summary.strategy_pnl,
                    baseline_buyhold_pnl: data.summary.baseline_buyhold_pnl,
                    delta_vs_buyhold: data.summary.delta_vs_buyhold,
                  });
                } catch (err) {
                  console.error("Retro fetch failed", err);
                } finally {
                  setRetroLoading(false);
                }
              }}
              disabled={retroLoading}
              style={{ width: "100%" }}
            >
              {retroLoading ? "Running..." : "Run Retro"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Order Engine / Recent Ticks ── */}
      <section className="glass-panel animate-slide-up delay-400" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Order Engine</h3>
          <small style={{ color: "var(--muted)" }}>Showing latest {Math.min(events.length, 50)} / 180</small>
        </div>
        <div style={{ maxHeight: 300, overflow: "auto", border: "1px solid var(--card-border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "rgba(255,255,255,0.03)" }}>
              <tr>
                {["Time", "Spot", "Forecast", "Signal", "PnL", "Inv", "Load", "Temp"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...events].reverse().slice(0, 50).map((row, idx) => {
                const signalColor =
                  row.signal === "buy" ? "var(--positive)" : row.signal === "sell" ? "var(--negative)" : "var(--info)";
                const pnlColor = row.pnl >= 0 ? "var(--positive)" : "var(--negative)";
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      borderLeft: `2px solid transparent`,
                      transition: "border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = signalColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = "transparent")}
                  >
                    <td style={{ padding: "6px 10px", fontSize: 12, color: "var(--muted)" }}>{new Date(row.timestamp).toLocaleTimeString()}</td>
                    <td style={{ padding: "6px 10px", fontSize: 12 }}>${row.spot_price.toFixed(2)}</td>
                    <td style={{ padding: "6px 10px", fontSize: 12 }}>${row.forecast_price.toFixed(2)}</td>
                    <td style={{ padding: "6px 10px", fontSize: 12, color: signalColor, fontWeight: 600 }}>{row.signal}</td>
                    <td style={{ padding: "6px 10px", fontSize: 12, color: pnlColor }}>${row.pnl.toFixed(2)}</td>
                    <td style={{ padding: "6px 10px", fontSize: 12 }}>{row.inventory_mwh.toFixed(2)}</td>
                    <td style={{ padding: "6px 10px", fontSize: 12 }}>{row.grid_load_mw.toFixed(0)} MW</td>
                    <td style={{ padding: "6px 10px", fontSize: 12 }}>{row.temp_c.toFixed(1)}°C</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
