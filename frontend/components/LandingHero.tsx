"use client";

import { Activity, Zap, TrendingUp, ShieldAlert, ArrowRight, BarChart3, Shield, Users, DollarSign, Factory, Wallet } from "lucide-react";
import MarketPreview from "./MarketPreview";

export default function LandingHero({ onEnter }: { onEnter: (persona: "industry" | "consumer") => void }) {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", padding: "40px" }}>

            <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }} className="animate-fade-in">

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--card-border)", paddingBottom: 16, marginBottom: 80 }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Grid Arbitrage System</h2>
                    <div className="badge">
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="live-indicator" /> LIVE SIMULATION
                        </span>
                    </div>
                </div>

                <h1 style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, margin: "0 0 40px 0" }}>
                    COMMAND <br />
                    CENTER
                </h1>

                <p style={{ fontSize: "1.25rem", color: "var(--muted)", maxWidth: 700, margin: "0 0 60px 0", lineHeight: 1.6, fontWeight: 400 }}>
                    Optimizing electricity commodities and futures. Stabilizing the grid during critical demand. Bailing out infrastructure before failure.
                </p>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 60 }}>
                    <button className="btn-primary" onClick={() => onEnter("industry")} style={{ padding: "16px 32px" }}>
                        <TrendingUp size={16} />
                        Industry Access
                    </button>
                    <button className="btn-outline" onClick={() => onEnter("consumer")} style={{ padding: "16px 32px" }}>
                        <ShieldAlert size={16} />
                        Consumer Access
                    </button>
                </div>

                {/* Market Preview */}
                <MarketPreview />

                {/* Value Props */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, borderTop: "1px solid var(--card-border)", paddingTop: 40, marginBottom: 80 }}>
                    <div>
                        <div style={{ borderBottom: "1px solid #333", paddingBottom: 12, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ fontSize: "1rem" }}>Profit & Protect</h3>
                            <Zap size={16} color="var(--positive)" />
                        </div>
                        <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                            Provide energy to neighborhoods at reduced rates during instability. Profit from market fluctuations while securing supply.
                        </p>
                    </div>
                    <div>
                        <div style={{ borderBottom: "1px solid #333", paddingBottom: 12, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ fontSize: "1rem" }}>Drive Competition</h3>
                            <TrendingUp size={16} color="var(--info)" />
                        </div>
                        <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                            Force providers to innovate rather than spike prices. Consumers and industries both benefit from efficient scaling.
                        </p>
                    </div>
                    <div>
                        <div style={{ borderBottom: "1px solid #333", paddingBottom: 12, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ fontSize: "1rem" }}>Reduce Strain</h3>
                            <Activity size={16} color="var(--warning)" />
                        </div>
                        <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                            Act as a limiter, absorbing demand and easing the grid&apos;s transition to prevent blackouts.
                        </p>
                    </div>
                </div>

                {/* Industry Infographic Section */}
                <section className="glow-left-green" style={{ marginBottom: 60, padding: "32px 0 32px 32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <Factory size={20} color="var(--positive)" />
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>FOR INDUSTRY</h2>
                    </div>
                    <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: "0.95rem", lineHeight: 1.6 }}>
                        Subscribe to our energy plants or connect your own infrastructure. Our AI-driven platform optimizes buy/sell strategies on electricity commodities and futures.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                        <div className="stat-card stat-card-green">
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Avg. Annual ROI</span>
                            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--positive)" }}>+34.2%</span>
                        </div>
                        <div className="stat-card stat-card-green">
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Grid Stabilizations</span>
                            <span style={{ fontSize: "2rem", fontWeight: 800 }}>1,247</span>
                        </div>
                        <div className="stat-card stat-card-green">
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Contracts Traded</span>
                            <span style={{ fontSize: "2rem", fontWeight: 800 }}>$48.3M</span>
                        </div>
                    </div>

                    <div className="step-flow" style={{ marginBottom: 32 }}>
                        <div className="step-flow-item">
                            <span style={{ fontSize: "0.7rem", color: "var(--positive)", fontWeight: 700, letterSpacing: "1px" }}>STEP 01</span>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Subscribe to energy plants or connect your own</span>
                            <ArrowRight size={14} color="var(--muted)" style={{ marginTop: "auto" }} />
                        </div>
                        <div className="step-flow-item">
                            <span style={{ fontSize: "0.7rem", color: "var(--positive)", fontWeight: 700, letterSpacing: "1px" }}>STEP 02</span>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>AI optimizes buy/sell on electricity commodities & futures</span>
                            <ArrowRight size={14} color="var(--muted)" style={{ marginTop: "auto" }} />
                        </div>
                        <div className="step-flow-item">
                            <span style={{ fontSize: "0.7rem", color: "var(--positive)", fontWeight: 700, letterSpacing: "1px" }}>STEP 03</span>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Profit during instability, supply neighborhoods at reduced rates</span>
                            <Zap size={14} color="var(--positive)" style={{ marginTop: "auto" }} />
                        </div>
                    </div>

                    <div className="callout-box" style={{ borderLeft: "3px solid var(--positive)" }}>
                        <p style={{ paddingLeft: 24 }}>Like JPMorgan bailing out the US government &mdash; we bail out critical infrastructure during grid failures. Purchase physical commodities and contracts; the ratio varies depending on current circumstances.</p>
                    </div>
                </section>

                {/* Consumer Infographic Section */}
                <section className="glow-left-blue" style={{ marginBottom: 60, padding: "32px 0 32px 32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <Wallet size={20} color="var(--info)" />
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>FOR CONSUMERS</h2>
                    </div>
                    <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: "0.95rem", lineHeight: 1.6 }}>
                        Access the same powerful service with safer investment terms. Subscribe for access to our plants, hedge against price spikes, and earn returns.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                        <div className="stat-card stat-card-blue">
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Avg. Monthly Savings</span>
                            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--info)" }}>$127</span>
                        </div>
                        <div className="stat-card stat-card-blue">
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Price Protection</span>
                            <span style={{ fontSize: "2rem", fontWeight: 800 }}>99.8%</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>uptime</span>
                        </div>
                        <div className="stat-card stat-card-blue">
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Subscriber Returns</span>
                            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--positive)" }}>+12.4%</span>
                        </div>
                    </div>

                    <div className="step-flow" style={{ marginBottom: 32 }}>
                        <div className="step-flow-item">
                            <span style={{ fontSize: "0.7rem", color: "var(--info)", fontWeight: 700, letterSpacing: "1px" }}>STEP 01</span>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Subscribe for access to physical energy plants</span>
                            <ArrowRight size={14} color="var(--muted)" style={{ marginTop: "auto" }} />
                        </div>
                        <div className="step-flow-item">
                            <span style={{ fontSize: "0.7rem", color: "var(--info)", fontWeight: 700, letterSpacing: "1px" }}>STEP 02</span>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Hedge against utility price spikes with safer investment terms</span>
                            <ArrowRight size={14} color="var(--muted)" style={{ marginTop: "auto" }} />
                        </div>
                        <div className="step-flow-item">
                            <span style={{ fontSize: "0.7rem", color: "var(--info)", fontWeight: 700, letterSpacing: "1px" }}>STEP 03</span>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Earn returns while forcing energy companies to compete</span>
                            <Shield size={14} color="var(--info)" style={{ marginTop: "auto" }} />
                        </div>
                    </div>

                    <div className="callout-box" style={{ borderLeft: "3px solid var(--info)" }}>
                        <p style={{ paddingLeft: 24 }}>Energy companies are forced to innovate rather than spike prices &mdash; driving costs down for everyone. Your subscription drives competition and protects your household.</p>
                    </div>
                </section>

            </div>
        </div>
    );
}
