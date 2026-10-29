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
import { FiBarChart2, FiLayers } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useGetCentreDashboard } from "@/src/features/shared/centre/hooks";

const TRADE_COLORS = [
  "#fbab2a", // Amber / Gold
  "#8A1538", // Deep Burgundy
  "#2563EB", // Royal Blue
  "#059669", // Emerald Green
  "#7C3AED", // Violet
  "#EA580C", // Orange
  "#0891B2", // Cyan
  "#475569", // Slate
];

interface CustomYAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

const CustomYAxisTick: React.FC<CustomYAxisTickProps> = ({
  x = 0,
  y = 0,
  payload,
}) => {
  const fullName = payload?.value || "";
  const maxLen = 16;
  const displayName =
    fullName.length > maxLen ? `${fullName.slice(0, maxLen - 1)}…` : fullName;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={4}
        textAnchor="end"
        fill="#374151"
        fontSize={11}
        fontWeight={600}
        className="cursor-default select-none"
      >
        <title>{fullName}</title>
        {displayName}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="bg-[#111827] text-white rounded-xl px-3.5 py-2.5 shadow-xl border border-gray-800 text-xs max-w-xs z-50 pointer-events-none">
      <p className="font-bold text-white leading-snug mb-1">
        {item.trade}
      </p>
      <div className="flex items-center justify-between gap-3 text-gray-300 text-[11px]">
        <span>Applications:</span>
        <span className="font-bold text-[#FBAB2A]">
          {item.count} ({item.percentage}%)
        </span>
      </div>
    </div>
  );
};

export const TradeChart: React.FC = () => {
  const currentYearStr = String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [viewMode, setViewMode] = useState<"bars" | "stacked">("bars");

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
      : [];

  const hasData = chartData.length > 0 && totalCount > 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col justify-between h-full min-h-95 select-none">
      {/* Chart Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-medium text-black tracking-tight">
          Application By Trades
        </h3>

        <div className="flex items-center gap-2">
          {hasData && (
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode("bars")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "bars"
                    ? "bg-white text-neutral-primary shadow-2xs"
                    : "text-neutral-secondary hover:text-neutral-primary"
                }`}
                title="Bar view"
                aria-label="Bar view"
              >
                <FiBarChart2 className="w-3.5 h-3.5 rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("stacked")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "stacked"
                    ? "bg-white text-neutral-primary shadow-2xs"
                    : "text-neutral-secondary hover:text-neutral-primary"
                }`}
                title="Stacked distribution view"
                aria-label="Stacked distribution view"
              >
                <FiLayers className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Select
            size="sm"
            showPlaceholderOption={false}
            containerClassName="w-24!"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={["2026", "2025", "2024"]}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {!hasData ? (
        <div className="w-full h-64 flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#fbab2a] flex items-center justify-center mb-2">
            <FiBarChart2 className="w-6 h-6 rotate-90" />
          </div>
          <p className="text-sm font-bold text-neutral-primary">
            No Applications Recorded
          </p>
          <p className="text-xs text-neutral-secondary mt-0.5">
            No trade applications found for {selectedYear}.
          </p>
        </div>
      ) : viewMode === "bars" ? (
        /* 1. Enhanced Horizontal Bar Chart View */
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 8, right: 35, left: 10, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#F3F4F6"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                orientation="top"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="trade"
                tickLine={false}
                axisLine={false}
                tick={<CustomYAxisTick />}
                width={110}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="percentage"
                fill="#fbab2a"
                radius={[0, 6, 6, 0]}
                barSize={16}
                background={{ fill: "#F3F4F6", radius: 6 }}
              >
                <LabelList
                  dataKey="percentage"
                  position="right"
                  formatter={(v: any) => `${v}%`}
                  style={{ fontSize: 11, fontWeight: 700, fill: "#374151" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* 2. 100% Stacked Bar & Breakdown List View */
        <div className="w-full h-64 flex flex-col justify-between py-2">
          {/* Top 100% Segmented Stacked Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-secondary">
              <span className="font-semibold">Trade Share Distribution</span>
              <span className="font-bold text-neutral-primary">100%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-xl h-6 flex overflow-hidden shadow-2xs border border-gray-100">
              {chartData.map((item, idx) => {
                const color = TRADE_COLORS[idx % TRADE_COLORS.length];
                return (
                  <div
                    key={item.trade}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: color,
                    }}
                    className="h-full transition-all duration-300 relative group cursor-pointer first:rounded-l-xl last:rounded-r-xl"
                    title={`${item.trade}: ${item.percentage}% (${item.count} applications)`}
                  >
                    {item.percentage >= 15 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-xs">
                        {item.percentage}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade Legend Breakdown List */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-44 pr-1 mt-3">
            {chartData.map((item, idx) => {
              const color = TRADE_COLORS[idx % TRADE_COLORS.length];
              return (
                <div
                  key={item.trade}
                  className="flex items-center justify-between text-xs py-1 px-1 rounded-lg hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="font-medium text-neutral-primary truncate"
                      title={item.trade}
                    >
                      {item.trade}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-400 font-medium">
                      {item.count} app{item.count === 1 ? "" : "s"}
                    </span>
                    <span className="font-bold text-neutral-primary w-11 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-neutral-secondary">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#fbab2a] rounded-xs shrink-0" />
          <span>{selectedYear} Trade Applications</span>
        </div>
        <span className="text-neutral-primary font-bold">
          Total: {totalCount}
        </span>
      </div>
    </div>
  );
};
