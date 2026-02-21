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

function formatTime(value: string | number) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: "12px", border: "1px solid #666", background: "#000" }}>
        <p style={{ color: "var(--muted)", fontSize: 10, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>{formatTime(label)}</p>
        <p style={{ color: "var(--positive)", fontWeight: 700, fontSize: 14 }}>Spot: ${payload[0].value.toFixed(2)}</p>
        <p style={{ color: "var(--info)", fontWeight: 600, fontSize: 13, marginTop: 4 }}>Forecast: ${payload[1].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function PriceChart({ data }: { data: StreamEvent[] }) {
  return (
    <div style={{ width: "100%", height: 320 }} className="chart-container glass-panel">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="forecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ea8de" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4ea8de" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="1 4" stroke="#333" vertical={false} />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, textTransform: "uppercase", letterSpacing: "1px" }} />
          <Area type="monotone" dataKey="spot_price" name="Spot" stroke="#00d4aa" fill="url(#spot)" strokeWidth={2} activeDot={{ r: 4, fill: "#00d4aa", stroke: "#000", strokeWidth: 2 }} />
          <Area type="step" dataKey="forecast_price" name="Forecast" stroke="#4ea8de" strokeDasharray="4 4" fill="url(#forecast)" strokeWidth={2} activeDot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
