type Props = {
  title: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative";
};

export default function MetricCard({ title, value, sub, accent }: Props) {
  const color = accent === "positive" ? "var(--accent-2)" : accent === "negative" ? "var(--danger)" : "var(--text)";
  return (
    <div className="card">
      <div className="metric-title">{title}</div>
      <div className="metric-value" style={{ color }}>
        {value}
      </div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}
