"use client";

import { TrendingUp, BarChart3, Activity, Gauge } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

const FAKE_SPARKLINE = [
  { t: 0, p: 49.2 }, { t: 1, p: 50.1 }, { t: 2, p: 48.8 }, { t: 3, p: 49.5 },
  { t: 4, p: 51.3 }, { t: 5, p: 52.8 }, { t: 6, p: 51.9 }, { t: 7, p: 50.4 },
  { t: 8, p: 49.1 }, { t: 9, p: 48.2 }, { t: 10, p: 49.7 }, { t: 11, p: 51.5 },
  { t: 12, p: 53.2 }, { t: 13, p: 54.1 }, { t: 14, p: 52.6 }, { t: 15, p: 51.0 },
  { t: 16, p: 50.3 }, { t: 17, p: 51.8 }, { t: 18, p: 53.4 }, { t: 19, p: 52.0 },
  { t: 20, p: 50.8 }, { t: 21, p: 51.6 }, { t: 22, p: 53.1 }, { t: 23, p: 52.4 },
];

const FUTURES = [
  { label: "1-Month", price: 54.10, change: +1.8 },
  { label: "3-Month", price: 58.75, change: +3.2 },
  { label: "6-Month", price: 61.20, change: +2.1 },
  { label: "12-Month", price: 55.90, change: -0.4 },
];

export default function MarketPreview() {
  const gridLoad = 18420;
  const gridMax = 25000;
  const gridPct = (gridLoad / gridMax) * 100;

  return (
    <div className="glass-panel glow-top-green animate-fade-in" style={{ padding: 0, marginBottom: 60, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid var(--card-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={16} color="var(--positive)" /> Market Preview
          </h3>
          <span className="badge tag-ok" style={{ fontSize: 9 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span className="live-indicator" /> LIVE DATA</span>
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 0 }}>
        {/* Left: Spot Price + Sentiment */}
        <div style={{ padding: 24, borderRight: "1px solid var(--card-border)" }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Spot Price</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "monospace" }}>$52.40</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--positive)", display: "flex", alignItems: "center", gap: 3 }}>
                <TrendingUp size={12} /> +2.3%
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>per MWh</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Sentiment</span>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <Gauge size={16} color="var(--positive)" />
              <span style={{ fontWeight: 700, color: "var(--positive)", fontSize: "0.95rem" }}>Bullish</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>24h Volume</span>
            <div style={{ marginTop: 6, fontWeight: 700, fontSize: "1.1rem", fontFamily: "monospace" }}>142,380<span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400 }}> MWh</span></div>
          </div>
        </div>

        {/* Center: Sparkline + Futures */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>24h Price Movement</span>
            <div style={{ height: 100, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FAKE_SPARKLINE}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
                  <Area type="monotone" dataKey="p" stroke="#00d4aa" fill="url(#sparkGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 10, display: "block" }}>Futures Strip</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {FUTURES.map((f) => (
                <div key={f.label} style={{ border: "1px solid var(--card-border)", padding: "10px 12px" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{f.label}</span>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", fontFamily: "monospace", marginTop: 4 }}>${f.price.toFixed(2)}</div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: f.change >= 0 ? "var(--positive)" : "var(--negative)" }}>
                    {f.change >= 0 ? "+" : ""}{f.change.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Grid Load */}
        <div style={{ padding: 24, borderLeft: "1px solid var(--card-border)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Grid Load</span>
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "monospace" }}>{gridLoad.toLocaleString()}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: 4 }}>/ {gridMax.toLocaleString()} MW</span>
          </div>
          <div style={{ width: "100%", height: 8, background: "#222", marginBottom: 6, position: "relative" }}>
            <div style={{ width: `${gridPct}%`, height: "100%", background: gridPct > 80 ? "var(--negative)" : gridPct > 60 ? "var(--warning)" : "var(--positive)", transition: "width 0.5s ease" }} />
          </div>
          <span style={{ fontSize: "0.75rem", color: gridPct > 80 ? "var(--negative)" : "var(--positive)", fontWeight: 600 }}>
            {gridPct.toFixed(0)}% Utilization
          </span>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--card-border)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Network Status</span>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Activity size={14} color="var(--positive)" />
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--positive)" }}>Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
