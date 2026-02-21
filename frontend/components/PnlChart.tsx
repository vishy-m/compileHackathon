"use client";

import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StreamEvent } from "./Dashboard";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString();
}

export default function PnlChart({ data }: { data: StreamEvent[] }) {
  return (
    <div style={{ width: "100%", height: 320 }} className="chart-container">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="timestamp" stroke="var(--muted)" tickFormatter={formatTime} />
          <YAxis stroke="var(--muted)" domain={["auto", "auto"]} />
          <Tooltip labelFormatter={(v) => formatTime(v as string)} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
          <Line type="monotone" dataKey="pnl" name="PnL" stroke="#90f0c5" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="inventory_mwh" name="Inventory" stroke="#5dd6ff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
