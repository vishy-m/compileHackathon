"use client";

import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { StreamEvent } from "./Dashboard";

function formatTime(value: string | number) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isPnlPositive = payload[0].value >= 0;
    return (
      <div className="glass-panel" style={{ padding: "12px", border: "1px solid #666", background: "#000" }}>
        <p style={{ color: "var(--muted)", fontSize: 10, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>{formatTime(label)}</p>
        <p style={{ color: isPnlPositive ? "var(--positive)" : "var(--negative)", fontWeight: 700, fontSize: 14 }}>
          PnL: {isPnlPositive ? "+" : ""}${payload[0].value.toFixed(2)}
        </p>
        <p style={{ color: "var(--info)", fontWeight: 600, fontSize: 13, marginTop: 4 }}>
          Inventory: {payload[1].value.toFixed(2)} MWh
        </p>
      </div>
    );
  }
  return null;
};

export default function PnlChart({ data }: { data: StreamEvent[] }) {
  return (
    <div style={{ width: "100%", height: 320 }} className="chart-container glass-panel">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="timestamp" stroke="var(--muted)" tickFormatter={formatTime} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted)" yAxisId="left" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(val) => `$${val}`} />
          <YAxis stroke="var(--muted)" yAxisId="right" orientation="right" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, textTransform: "uppercase", letterSpacing: "1px" }} />
          <ReferenceLine y={0} yAxisId="left" stroke="#555" strokeDasharray="3 3" />
          <Line yAxisId="left" type="step" dataKey="pnl" name="PnL" stroke="#00d4aa" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#00d4aa", stroke: "#000", strokeWidth: 2 }} />
          <Line yAxisId="right" type="monotone" dataKey="inventory_mwh" name="Inventory" stroke="#4ea8de" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#4ea8de", stroke: "#000", strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
