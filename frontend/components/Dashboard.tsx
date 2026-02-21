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
};

const DEFAULT_WS = "ws://localhost:8000/ws/stream";

const FAKE_FUTURES = [
  { label: "1-Month", price: 54.10, change: +1.8 },
  { label: "3-Month", price: 58.75, change: +3.2 },
  { label: "6-Month", price: 61.20, change: +2.1 },
  { label: "12-Month", price: 55.90, change: -0.4 },
];

type DashboardProps = {
  persona: "industry" | "consumer";
  onLogout: () => void;
};

export default function Dashboard({ persona, onLogout }: DashboardProps) {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? DEFAULT_WS;
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "disconnected">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  const [stabilizing, setStabilizing] = useState(false);
  const [ownedContracts, setOwnedContracts] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setStatus("live");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as StreamEvent;
        if (data.grid_load_mw) {
        }
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

  const displayGridLoadMw = useMemo(() => {
    if (!latest) return 0;
    return stabilizing ? latest.grid_load_mw * 0.85 : latest.grid_load_mw;
  }, [latest, stabilizing]);

  const signalBadge = useMemo(() => {
    if (!latest) return { text: "No data", className: "badge tag-warn" };
    const map: Record<string, { text: string; className: string }> = {
      buy: { text: "Long / Buy", className: "badge tag-ok" },
      sell: { text: "Short / Sell", className: "badge tag-warn" },
      hold: { text: "Hold", className: "badge tag-info" },
    };
    return map[latest.signal] ?? { text: latest.signal, className: "badge tag-neutral" };
  }, [latest]);

  const handlePurchaseContract = () => {
    setOwnedContracts(prev => prev + 1);
    setStabilizing(true);
    setTimeout(() => setStabilizing(false), 5000);
  };

  const handleBailout = () => {
    setStabilizing(!stabilizing);
  };

  const physicalRatio = 60;
  const futuresRatio = 40;

  return (
    <main style={{ padding: "40px", maxWidth: 1600, margin: "0 auto" }}>
      <header className="glass-panel" style={{ padding: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em" }}>COMM PLATFORM</h1>
            <span className={`badge ${persona === "industry" ? "tag-ok" : "tag-info"}`}>
              {persona === "industry" ? <Briefcase size={12} style={{ marginRight: 6, display: "inline" }} /> : <User size={12} style={{ marginRight: 6, display: "inline" }} />}
              {persona.toUpperCase()} PORTAL
            </span>
          </div>
          <p style={{ color: "var(--muted)", maxWidth: 640, fontSize: 14, lineHeight: 1.6 }}>
            {persona === "industry"
              ? "Optimize your buy/sell energy strategies. Provide energy at reduced rates during high instability and drive innovation."
              : "Subscribe to physical energy plants for safer investment terms. Hedge against utility price spikes."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "1px" }}>Signal Engine</p>
            <span className={signalBadge.className}>{signalBadge.text}</span>
          </div>
          <div style={{ textAlign: "right", paddingRight: 24, borderRight: "1px solid #333" }}>
            <p style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "1px" }}>Connection</p>
            <span className={`badge ${status === "live" ? "tag-ok" : "tag-warn"}`}>
              {status === "live" ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div className="live-indicator" /> ONLINE</span>
              ) : status === "connecting" ? "CONNECTING" : "OFFLINE"}
            </span>
          </div>
          <button className="btn-outline" onClick={onLogout} style={{ padding: "10px 20px" }}>
            <LogOut size={16} /> EXIT
          </button>
        </div>
      </header>

      {/* Primary Metrics */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: 24 }}>
        <MetricCard title="Spot Price" value={latest ? `$${latest.spot_price.toFixed(2)}` : "--"} sub="Energy commodity per MWh" />
        <MetricCard title="AI Forecast" value={latest ? `$${latest.forecast_price.toFixed(2)}` : "--"} sub="Short horizon prediction" accent="positive" />
        <MetricCard title="Running PnL" value={latest ? `$${latest.pnl.toFixed(2)}` : "--"} sub="Mark-to-market returns" accent={latest && latest.pnl >= 0 ? "positive" : "negative"} />
        <MetricCard
          title="Owned Capacity"
          value={
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              {latest ? `${latest.inventory_mwh.toFixed(1)}` : "--"}
              <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 400 }}>MWh</span>
            </div>
          }
          sub="Virtual plant inventory"
        />
      </section>

      {/* Persona-Specific Infographic Panel */}
      {persona === "industry" ? (
        <section className="glass-panel glow-top-green" style={{ padding: 24, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Factory size={18} color="var(--positive)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>GRID IMPACT</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Infrastructure Saved</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--positive)" }}>$2.4M</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Blackouts Prevented</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>17</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Communities Served</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>340K</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Demand Absorbed</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <div style={{ flex: 1, height: 6, background: "#222", position: "relative" }}>
                  <div style={{ width: "72%", height: "100%", background: "var(--positive)", transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>72%</span>
              </div>
              <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>contracts limiting grid strain</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="glass-panel glow-top-blue" style={{ padding: 24, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Wallet size={18} color="var(--info)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>YOUR SAVINGS</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Monthly Savings vs. Market</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--positive)" }}>$127</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Portfolio Value</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>$8,420</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Protection Events</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>3</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Market Rate vs. Your Rate</span>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 4 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ width: 32, height: 40, background: "var(--negative)", opacity: 0.6 }} />
                  <span style={{ fontSize: "0.6rem", color: "var(--muted)" }}>Market</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ width: 32, height: 26, background: "var(--positive)" }} />
                  <span style={{ fontSize: "0.6rem", color: "var(--muted)" }}>Yours</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--positive)", fontWeight: 700, marginLeft: 4 }}>-35%</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Split */}
      <div className="dashboard-grid dashboard-columns" style={{ marginBottom: 40, gap: "40px" }}>
        {/* Left Col: Charts & Visualizers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          <GridStrainVisualizer loadMw={displayGridLoadMw} isStabilizing={stabilizing} />

          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 24, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
              <Zap size={18} color="var(--positive)" /> Real-Time Energy Prices
            </h3>
            <PriceChart data={events} />
          </div>

          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 24, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
              <Briefcase size={18} color="var(--info)" /> Portfolio Performance & Inventory
            </h3>
            <PnlChart data={events} />
          </div>
        </div>

        {/* Right Col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          {/* Market Overview Panel */}
          <div className="glass-panel glow-top-green" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={16} color="var(--positive)" /> MARKET OVERVIEW
              </h3>
              <span className="badge tag-ok" style={{ fontSize: 9 }}>LIVE</span>
            </div>

            {/* Futures Contracts Table */}
            <div style={{ padding: "16px 24px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Futures Contracts</span>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
                <thead>
                  <tr>
                    {["Term", "Price", "Chg"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 0", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, borderBottom: "1px solid #222" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FAKE_FUTURES.map((f) => (
                    <tr key={f.label}>
                      <td style={{ padding: "8px 0", fontSize: 12, color: "var(--muted)" }}>{f.label}</td>
                      <td style={{ padding: "8px 0", fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>${f.price.toFixed(2)}</td>
                      <td style={{ padding: "8px 0", fontSize: 12, fontWeight: 700, color: f.change >= 0 ? "var(--positive)" : "var(--negative)" }}>
                        {f.change >= 0 ? "+" : ""}{f.change.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Market Depth */}
            <div style={{ padding: "0 24px 16px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, display: "block", marginBottom: 10 }}>Market Depth</span>
              <div style={{ display: "flex", height: 16, width: "100%", overflow: "hidden" }}>
                <div style={{ width: "62%", background: "var(--positive)", opacity: 0.7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#000" }}>BUY 62%</span>
                </div>
                <div style={{ width: "38%", background: "var(--negative)", opacity: 0.7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#000" }}>SELL 38%</span>
                </div>
              </div>
            </div>

            {/* Contract Ratio */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, display: "block", marginBottom: 10 }}>Contract Ratio (Physical / Futures)</span>
              <div style={{ display: "flex", height: 10, width: "100%", marginBottom: 8 }}>
                <div style={{ width: `${physicalRatio}%`, background: "var(--info)", transition: "width 0.5s ease" }} />
                <div style={{ width: `${futuresRatio}%`, background: "var(--warning)", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem" }}>
                <span style={{ color: "var(--info)", fontWeight: 600 }}>Physical {physicalRatio}%</span>
                <span style={{ color: "var(--warning)", fontWeight: 600 }}>Futures {futuresRatio}%</span>
              </div>
            </div>
          </div>

          {/* Action Module */}
          <div className="glass-panel" style={{ padding: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -80, right: -60, opacity: 0.03 }}>
              <Cpu size={250} />
            </div>

            <h3 style={{ marginBottom: 12, fontSize: "1.4rem", fontWeight: 800 }}>MARKET ACTIONS</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 32, lineHeight: 1.6 }}>
              {persona === "industry"
                ? "Intervene during critical strain to limit hardware damage and stabilize neighborhood grids."
                : "Purchase access to our infrastructure to secure favorable energy rates."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button className="btn-primary" onClick={handlePurchaseContract} style={{ width: "100%", justifyContent: "center", padding: "16px" }}>
                <Briefcase size={18} />
                BUY CAPACITY CONTRACT
              </button>
              {persona === "industry" && (
                <button
                  className="btn-outline"
                  onClick={handleBailout}
                  style={{
                    width: "100%", justifyContent: "center", padding: "16px",
                    borderColor: stabilizing ? "var(--warning)" : "#555",
                    color: stabilizing ? "#000" : "var(--text)",
                    background: stabilizing ? "var(--warning)" : "transparent"
                  }}
                >
                  <ShieldAlert size={18} />
                  {stabilizing ? "CEASE GRID BAILOUT" : "INITIATE GRID BAILOUT"}
                </button>
              )}
            </div>

            <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Active Contracts</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: ownedContracts > 0 ? "var(--positive)" : "var(--text)" }}>{ownedContracts}</span>
            </div>
          </div>

          {/* Environmental Factors */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 24, fontSize: "1.2rem", fontWeight: 700 }}>ENVIRONMENTAL FACTORS</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Temperature (Weather)</span>
                  <span style={{ fontWeight: 600, color: latest && latest.temp_c > 30 ? "var(--negative)" : latest && latest.temp_c > 20 ? "var(--warning)" : "var(--text)" }}>
                    {latest ? `${latest.temp_c.toFixed(1)} °C` : "--"}
                  </span>
                </div>
                <div style={{ width: "100%", height: 4, background: "#222" }}>
                  <div style={{
                    width: latest ? `${Math.min(100, (latest.temp_c / 40) * 100)}%` : "0%",
                    height: "100%",
                    background: latest && latest.temp_c > 30 ? "var(--negative)" : latest && latest.temp_c > 20 ? "var(--warning)" : "var(--info)",
                    transition: "width 0.3s ease"
                  }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Traffic Activity (Proxy)</span>
                  <span style={{ fontWeight: 600, color: latest && latest.traffic_index > 70 ? "var(--warning)" : "var(--info)" }}>
                    {latest ? `${latest.traffic_index.toFixed(0)} / 100` : "--"}
                  </span>
                </div>
                <div style={{ width: "100%", height: 4, background: "#222" }}>
                  <div style={{ width: latest ? `${latest.traffic_index}%` : "0%", height: "100%", background: "var(--info)", transition: "width 0.3s ease" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Ticks Table */}
          <div className="glass-panel" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>ORDER ENGINE</h3>
              <span className="badge tag-neutral">LATEST {Math.min(50, events.length)}</span>
            </div>
            <div style={{ flex: 1, minHeight: 250, maxHeight: 400, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--bg)", borderBottom: "1px solid #333", zIndex: 1 }}>
                  <tr>
                    {["Time", "Signal", "Spot", "PnL"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 24px", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...events].reverse().slice(0, 50).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #222", transition: "background 0.2s" }} className="hover-row">
                      <td style={{ padding: "12px 24px", fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{new Date(row.timestamp).toLocaleTimeString()}</td>
                      <td style={{
                        padding: "12px 24px", fontSize: 11, fontWeight: 700, letterSpacing: "1px",
                        color: row.signal === "buy" ? "var(--positive)" : row.signal === "sell" ? "var(--negative)" : "var(--info)"
                      }}>
                        {row.signal.toUpperCase()}
                      </td>
                      <td style={{ padding: "12px 24px", fontSize: 13, fontFamily: "monospace" }}>${row.spot_price.toFixed(2)}</td>
                      <td style={{ padding: "12px 24px", fontSize: 13, fontFamily: "monospace", color: row.pnl >= 0 ? "var(--positive)" : "var(--negative)" }}>
                        {row.pnl >= 0 ? "+" : ""}${row.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <style dangerouslySetInnerHTML={{
              __html: `
              .hover-row:hover {
                background: #111;
              }
            `}} />
          </div>

        </div>
      </div>
    </main>
  );
}
