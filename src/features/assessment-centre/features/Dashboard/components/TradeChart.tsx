"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Select } from "@/src/components/ui/select";
import { useGetCentreDashboard } from "@/src/features/shared/centre/hooks";

export const TradeChart: React.FC = () => {
  const currentYearStr = String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(currentYearStr);

  const { data: dashboardData } = useGetCentreDashboard({
    year: Number(selectedYear),
  });

  const rawTrades = dashboardData?.applicationsByTrade || [];
  const totalCount = rawTrades.reduce((acc, t) => acc + (t.count || 0), 0);

  const chartData =
    rawTrades.length > 0
      ? rawTrades.map((t) => ({
          trade: t.name,
          percentage: totalCount > 0 ? Math.round((t.count / totalCount) * 100) : 0,
          count: t.count,
        }))
      : [
          { trade: "General", percentage: 0, count: 0 },
        ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col justify-between h-full min-h-95 select-none">
      {/* Chart Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-medium text-black tracking-tight">
          Application By Trades
        </h3>

        <Select
          size="sm"
          showPlaceholderOption={false}
          containerClassName="w-24!"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          options={["2026", "2025", "2024"]}
        />
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#F3F4F6"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              orientation="top"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
            />
            <YAxis
              type="category"
              dataKey="trade"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#111827", fontWeight: 600 }}
              width={75}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
              contentStyle={{
                backgroundColor: "#111827",
                borderRadius: "8px",
                border: "none",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              formatter={(val: any, _, item: any) => [
                `${val}% (${item.payload.count} applications)`,
                "Share",
              ]}
            />
            <Bar
              dataKey="percentage"
              fill="#fbab2a"
              radius={[0, 4, 4, 0]}
              barSize={16}
            >
              <LabelList
                dataKey="percentage"
                position="right"
                formatter={(v: any) => `${v}%`}
                style={{ fontSize: 10, fontWeight: 700, fill: "#374151" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-neutral-secondary">
        <span className="w-3 h-3 bg-[#fbab2a] rounded-xs" />
        <span>{selectedYear}</span>
      </div>
    </div>
  );
};
