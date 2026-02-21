"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StreamEvent } from "./Dashboard";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString();
}

export default function PriceChart({ data }: { data: StreamEvent[] }) {
  return (
    <div style={{ width: "100%", height: 320 }} className="chart-container">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5dd6ff" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#5dd6ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="forecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#90f0c5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#90f0c5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="var(--muted)" />
          <YAxis stroke="var(--muted)" />
          <Tooltip labelFormatter={(v) => formatTime(v as string)} />
          <Legend />
          <Area type="monotone" dataKey="spot_price" name="Spot" stroke="#5dd6ff" fill="url(#spot)" strokeWidth={2} />
          <Area type="monotone" dataKey="forecast_price" name="Forecast" stroke="#90f0c5" fill="url(#forecast)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
