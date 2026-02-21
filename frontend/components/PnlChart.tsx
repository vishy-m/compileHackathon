"use client";

import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StreamEvent } from "./Dashboard";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString();
}

export default function PnlChart({ data }: { data: StreamEvent[] }) {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="timestamp" stroke="var(--muted)" tickFormatter={formatTime} />
          <YAxis stroke="var(--muted)" domain={["auto", "auto"]} />
          <Tooltip
            labelFormatter={(v) => formatTime(v as string)}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 0,
            }}
            formatter={(value: number, name: string) => {
              if (name === "PnL") {
                const color = value >= 0 ? "var(--positive)" : "var(--negative)";
                return [<span key={name} style={{ color }}>${value.toFixed(2)}</span>, name];
              }
              return [value, name];
            }}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
          <Line type="step" dataKey="pnl" name="PnL" stroke="#00d4aa" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="inventory_mwh" name="Inventory" stroke="#4ea8de" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="target_physical_mwh" name="Target Physical" stroke="#ffcf5d" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
