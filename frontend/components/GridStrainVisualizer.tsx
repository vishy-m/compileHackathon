"use client";

type Props = {
  loadMw: number;
  isStabilizing: boolean;
};

export default function GridStrainVisualizer({ loadMw, isStabilizing }: Props) {
  const percentage = Math.min((loadMw / 25000) * 100, 100);

  const isCritical = percentage > 80 && !isStabilizing;
  const isModerate = percentage > 60 && percentage <= 80 && !isStabilizing;
  const isOptimal = percentage <= 60 && !isStabilizing;

  let barColor = "var(--positive)";
  let statusText = "Optimal";
  let statusBadge = "badge tag-neutral";
  let panelClass = "glass-panel";

  if (isStabilizing) {
    barColor = "var(--positive)";
    statusText = "Stabilizing";
    statusBadge = "badge tag-ok";
    panelClass = "glass-panel glow-pulse-green";
  } else if (isCritical) {
    barColor = "var(--negative)";
    statusText = "Critical";
    statusBadge = "badge tag-warn";
    panelClass = "glass-panel glow-pulse-red";
  } else if (isModerate) {
    barColor = "var(--warning)";
    statusText = "Moderate";
    statusBadge = "badge tag-neutral";
  }

  return (
    <div className={panelClass} style={{ padding: 20, position: "relative", overflow: "hidden" }}>
      {/* Radial glow overlay for critical / stabilizing */}
      {(isCritical || isStabilizing) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isCritical
              ? "radial-gradient(ellipse at center, rgba(255,92,92,0.06) 0%, transparent 70%)"
              : "radial-gradient(ellipse at center, rgba(0,212,170,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Grid Strain</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{loadMw.toLocaleString()} / 25,000 MW</span>
          <span className={statusBadge}>{statusText}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, background: "var(--card-border)", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: barColor,
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: isCritical ? `0 0 12px ${barColor}` : "none",
            position: "relative",
          }}
        >
          {/* Animated stripes for stabilizing */}
          {isStabilizing && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)",
                backgroundSize: "20px 20px",
                animation: "progressStripes 1s infinite linear",
              }}
            />
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>0 MW</span>
        <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>{percentage.toFixed(1)}%</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>25,000 MW</span>
      </div>
    </div>
  );
}
