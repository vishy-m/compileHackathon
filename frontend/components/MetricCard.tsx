import { ReactNode } from "react";

type Props = {
  title: string;
  value: ReactNode;
  sub?: string;
  accent?: "positive" | "negative" | "neutral";
};

export default function MetricCard({ title, value, sub, accent }: Props) {
  const color =
    accent === "positive"
      ? "var(--positive)"
      : accent === "negative"
        ? "var(--negative)"
        : accent === "neutral"
          ? "var(--accent-2)"
          : "var(--text)";

  const hoverClass = accent === "positive" ? " glass-panel-hover-green" : "";
  const glowClass = accent === "positive" ? " text-glow-static-green" : "";

  return (
    <div className={`glass-panel glass-panel-hover-lift${hoverClass}`}>
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
        {title}
      </div>
      <div className={glowClass} style={{ fontSize: 26, fontWeight: 700, color }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
