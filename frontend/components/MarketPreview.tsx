"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

const FAKE_SPARKLINE = [
  { t: 0, p: 49.2 }, { t: 1, p: 50.1 }, { t: 2, p: 49.8 }, { t: 3, p: 51.4 },
  { t: 4, p: 52.0 }, { t: 5, p: 51.2 }, { t: 6, p: 50.5 }, { t: 7, p: 51.8 },
  { t: 8, p: 53.1 }, { t: 9, p: 52.4 }, { t: 10, p: 53.6 }, { t: 11, p: 52.9 },
  { t: 12, p: 51.7 }, { t: 13, p: 50.8 }, { t: 14, p: 51.5 }, { t: 15, p: 52.3 },
  { t: 16, p: 53.0 }, { t: 17, p: 52.1 }, { t: 18, p: 51.4 }, { t: 19, p: 52.8 },
  { t: 20, p: 53.5 }, { t: 21, p: 52.6 }, { t: 22, p: 51.9 }, { t: 23, p: 52.4 },
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
  const loadPct = (gridLoad / gridMax) * 100;

  return (
    <div className="glass-panel glow-top-green ambient-glow-green shimmer" style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
        {/* Left column - Spot & Sentiment */}
        <div>
          <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Spot Price
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 32, fontWeight: 800 }}>$52.40</span>
            <span style={{ color: "var(--positive)", fontSize: 14, fontWeight: 600 }}>+2.3%</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Sentiment</span>
            <div style={{ marginTop: 4 }}>
              <span className="badge tag-ok">Bullish</span>
            </div>
          </div>
          <div>
            <span style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>24h Volume</span>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>142,380 MWh</div>
          </div>
        </div>

        {/* Center column - Sparkline + Futures */}
        <div>
          <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            24h Price Trend
          </div>
          <div style={{ height: 100, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FAKE_SPARKLINE}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="p" stroke="#00d4aa" fill="url(#sparkGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Futures Strip
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {FUTURES.map((f) => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                <span style={{ color: "var(--muted)" }}>{f.label}</span>
                <span>
                  ${f.price.toFixed(2)}{" "}
                  <span style={{ color: f.change >= 0 ? "var(--positive)" : "var(--negative)", fontSize: 11 }}>
                    {f.change >= 0 ? "+" : ""}{f.change}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - Grid Load & Network */}
        <div>
          <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Grid Load
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>18,420</span>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>/ 25,000 MW</span>
          </div>
          <div style={{ height: 6, background: "var(--card-border)", marginBottom: 16, position: "relative" }}>
            <div
              style={{
                height: "100%",
                width: `${loadPct}%`,
                background: loadPct > 80 ? "var(--negative)" : loadPct > 60 ? "var(--warning)" : "var(--positive)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <div>
            <span style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Network Status</span>
            <div style={{ marginTop: 4 }}>
              <span className="badge tag-ok">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
