"use client";

import {
  Factory,
  Wallet,
  Zap,
  TrendingUp,
  ShieldAlert,
  Activity,
  ArrowRight,
  Shield,
} from "lucide-react";
import MarketPreview from "./MarketPreview";

type Props = {
  onEnter: (persona: "industry" | "consumer") => void;
};

export default function LandingHero({ onEnter }: Props) {
  return (
    <main style={{ padding: "40px 28px", maxWidth: 1320, margin: "0 auto" }}>
      {/* Header bar */}
      <header
        className="glass-panel animate-slide-up"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Zap size={20} color="var(--positive)" />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1, textTransform: "uppercase" }}>
            Grid Arbitrage System
          </span>
        </div>
        <span className="badge tag-ok" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="live-indicator" />
          LIVE SIMULATION
        </span>
      </header>

      {/* Hero title */}
      <section className="animate-slide-up delay-100" style={{ textAlign: "center", marginBottom: 48 }}>
        <h1
          className="text-glow-static-white"
          style={{ fontSize: 48, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}
        >
          COMMAND CENTER
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 640, margin: "0 auto", fontSize: 16, lineHeight: 1.7 }}>
          Real-time energy arbitrage platform. Forecast spreads, optimize grid stability,
          and manage physical + futures exposure across volatile power markets.
        </p>
      </section>

      {/* CTA buttons */}
      <section className="animate-slide-up delay-200" style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 48 }}>
        <button className="btn-primary" onClick={() => onEnter("industry")} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Factory size={16} /> Industry Access
        </button>
        <button className="btn-outline" onClick={() => onEnter("consumer")} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Wallet size={16} /> Consumer Access
        </button>
      </section>

      {/* Market Preview */}
      <section className="animate-slide-up delay-300" style={{ marginBottom: 48 }}>
        <MarketPreview />
      </section>

      {/* Value props grid */}
      <section
        className="animate-slide-up delay-400"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 48 }}
      >
        <div className="glass-panel glass-panel-hover-green" style={{ padding: 24 }}>
          <TrendingUp size={24} color="var(--positive)" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8, fontSize: 18 }}>Profit & Protect</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
            Capture spreads between spot and forecast prices while hedging downside risk through futures contracts.
          </p>
        </div>
        <div className="glass-panel glass-panel-hover-blue" style={{ padding: 24 }}>
          <ShieldAlert size={24} color="var(--info)" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8, fontSize: 18 }}>Drive Competition</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
            Market-driven signals ensure fair pricing and prevent monopolistic grid behavior.
          </p>
        </div>
        <div className="glass-panel glass-panel-hover-green" style={{ padding: 24 }}>
          <Activity size={24} color="var(--positive)" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8, fontSize: 18 }}>Reduce Strain</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
            Absorb peak demand and redistribute capacity to stabilize grid infrastructure.
          </p>
        </div>
      </section>

      {/* Industry infographic section */}
      <section className="glass-panel glow-left-green animate-slide-up delay-500" style={{ padding: 32, marginBottom: 32 }}>
        <h2 style={{ marginBottom: 24, fontSize: 22, display: "flex", alignItems: "center", gap: 8 }}>
          <Factory size={20} color="var(--positive)" /> Industry Operators
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div className="stat-card" style={{ borderColor: "rgba(0,212,170,0.2)" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>ROI</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--positive)" }} className="text-glow-static-green">+34.2%</div>
          </div>
          <div className="stat-card" style={{ borderColor: "rgba(0,212,170,0.2)" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Stabilizations</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--positive)" }}>1,247</div>
          </div>
          <div className="stat-card" style={{ borderColor: "rgba(0,212,170,0.2)" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Contracts</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--positive)" }}>$48.3M</div>
          </div>
        </div>
        <div className="step-flow" style={{ marginBottom: 24 }}>
          <div className="step-flow-item">
            <div style={{ color: "var(--positive)", fontWeight: 700, marginBottom: 4 }}>01</div>
            <div style={{ fontSize: 13 }}>Monitor grid load & forecast spreads</div>
          </div>
          <div className="step-flow-item">
            <div style={{ color: "var(--positive)", fontWeight: 700, marginBottom: 4 }}>02</div>
            <div style={{ fontSize: 13 }}>AI engine signals buy/sell/hold</div>
          </div>
          <div className="step-flow-item">
            <div style={{ color: "var(--positive)", fontWeight: 700, marginBottom: 4 }}>03</div>
            <div style={{ fontSize: 13 }}>Execute + stabilize network</div>
          </div>
        </div>
        <div className="callout-box shimmer">
          <p style={{ color: "var(--accent-2)", fontSize: 14, lineHeight: 1.7, margin: 0, paddingLeft: 24 }}>
            Industrial operators gain direct access to arbitrage opportunities while contributing to network
            stability — a self-reinforcing flywheel of profit and public good.
          </p>
        </div>
      </section>

      {/* Consumer infographic section */}
      <section className="glass-panel glow-left-blue animate-slide-up delay-600" style={{ padding: 32, marginBottom: 32 }}>
        <h2 style={{ marginBottom: 24, fontSize: 22, display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={20} color="var(--info)" /> Consumer Protection
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div className="stat-card" style={{ borderColor: "rgba(78,168,222,0.2)" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Savings</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--info)" }} className="text-glow-static-blue">$127</div>
          </div>
          <div className="stat-card" style={{ borderColor: "rgba(78,168,222,0.2)" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Protection</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--info)" }}>99.8%</div>
          </div>
          <div className="stat-card" style={{ borderColor: "rgba(78,168,222,0.2)" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Returns</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--info)" }}>+12.4%</div>
          </div>
        </div>
        <div className="step-flow" style={{ marginBottom: 24 }}>
          <div className="step-flow-item">
            <div style={{ color: "var(--info)", fontWeight: 700, marginBottom: 4 }}>01</div>
            <div style={{ fontSize: 13 }}>Platform monitors your energy costs</div>
          </div>
          <div className="step-flow-item">
            <div style={{ color: "var(--info)", fontWeight: 700, marginBottom: 4 }}>02</div>
            <div style={{ fontSize: 13 }}>Auto-hedges against price spikes</div>
          </div>
          <div className="step-flow-item">
            <div style={{ color: "var(--info)", fontWeight: 700, marginBottom: 4 }}>03</div>
            <div style={{ fontSize: 13 }}>Returns savings to your account</div>
          </div>
        </div>
        <div className="callout-box shimmer">
          <p style={{ color: "var(--accent-2)", fontSize: 14, lineHeight: 1.7, margin: 0, paddingLeft: 24 }}>
            Consumers gain access to institutional-grade energy hedging without complexity — the platform
            automatically protects against price volatility and returns real savings.
          </p>
        </div>
      </section>
    </main>
  );
}
