import { ReactNode } from "react";

type Props = {
  title: string;
  value: ReactNode;
  sub?: string;
  accent?: "positive" | "negative" | "neutral";
};

export default function MetricCard({ title, value, sub, accent = "neutral" }: Props) {
  const colorMap: Record<string, string> = {
    positive: "var(--positive)",
    negative: "var(--negative)",
    neutral: "var(--accent-2)",
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
        {title}
      </div>
      <div>
        <div style={{ fontSize: "32px", fontWeight: 800, color: colorMap[accent], marginBottom: sub ? "8px" : "0", letterSpacing: "-0.02em" }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: "12px", color: "var(--muted)", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.5px" }}>{sub}</div>}
      </div>
    </div>
  );
}
