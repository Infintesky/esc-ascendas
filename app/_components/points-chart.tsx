"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export type PointsHistoryItem = {
  delta: number;
  balanceAfter: number;
  reason: string;
  createdAt: string | Date;
};

export function toChartSeries(history: PointsHistoryItem[]) {
  return [...history]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((h) => ({
      date: new Date(h.createdAt).toLocaleDateString(),
      balance: h.balanceAfter,
    }));
}

export function PointsChart({ history }: { history: PointsHistoryItem[] }) {
  const data = toChartSeries(history);
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="balance" stroke="#059669" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
