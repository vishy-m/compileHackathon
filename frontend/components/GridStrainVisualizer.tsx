"use client";

import { Activity } from "lucide-react";

export default function GridStrainVisualizer({ loadMw, isStabilizing }: { loadMw: number, isStabilizing: boolean }) {
    const MAX_CAPACITY = 25000;
    const percentage = Math.min(100, Math.max(0, (loadMw / MAX_CAPACITY) * 100));

    const isHighStrain = percentage > 80 && !isStabilizing;

    const barColor = isStabilizing ? "var(--positive)" : isHighStrain ? "var(--negative)" : percentage > 60 ? "var(--warning)" : "var(--positive)";
    const statusText = isStabilizing ? "Actively Stabilizing" : isHighStrain ? "Critical Strain" : "Optimal Output";
    const statusTag = isStabilizing ? "tag-ok" : isHighStrain ? "tag-warn" : "tag-neutral";

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: 24, position: "relative", overflow: "hidden" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>Grid Stabilization Visualizer</h3>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Live Network Capacity</p>
                </div>
                <div className={`badge ${statusTag}`}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {isStabilizing ? <Activity size={14} className="live-indicator" /> : null}
                        {statusText}
                    </span>
                </div>
            </div>

            <div style={{ border: "1px solid #333", height: 24, width: "100%", position: "relative", overflow: "hidden", background: "#000" }}>
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: `${percentage}%`,
                        backgroundColor: barColor,
                        transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s ease",
                    }}
                />
                {isStabilizing && (
                    <div
                        style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            backgroundImage: "linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)",
                            backgroundSize: "20px 20px",
                            animation: "progressStripes 1s linear infinite"
                        }}
                    />
                )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.5px" }}>
                <span>0 MW</span>
                <span style={{ color: isHighStrain ? "var(--negative)" : "var(--muted)" }}>{loadMw.toFixed(0)} MW / {MAX_CAPACITY} MW Capacity</span>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes progressStripes {
          from { background-position: 20px 0; }
          to { background-position: 0 0; }
        }
      `}} />
        </div>
    );
}
