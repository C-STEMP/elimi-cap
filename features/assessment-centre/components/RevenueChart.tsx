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
} from "recharts";
import { MOCK_REVENUE_DATA } from "../utils/constants";
import { Select } from "@/components/ui/select";

export const RevenueChart: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState("2026");

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col justify-between h-full min-h-95 select-none">
      {/* Chart Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-medium text-black tracking-tight">
          Total Revenue
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
            data={MOCK_REVENUE_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F3F4F6"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
            />
            <YAxis
              ticks={[0, 1500, 3000, 4500, 6000, 7500, 8000]}
              domain={[0, 8000]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
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
              formatter={(value: any) => [
                `₦${Number(value).toLocaleString()}`,
                "Revenue",
              ]}
            />
            <Bar
              dataKey="revenue"
              fill="#a31d38"
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-neutral-secondary">
        <span className="w-3 h-3 bg-[#a31d38] rounded-xs" />
        <span>{selectedYear}</span>
      </div>
    </div>
  );
};
