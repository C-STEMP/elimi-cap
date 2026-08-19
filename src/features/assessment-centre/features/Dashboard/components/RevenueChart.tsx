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
import { Select } from "@/src/components/ui/select";
import { useGetCentreDashboard } from "@/src/features/shared/centre/hooks";

const MONTH_LABELS: Record<number, string> = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

export const RevenueChart: React.FC = () => {
  const currentYearStr = String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(currentYearStr);

  const { data: dashboardData } = useGetCentreDashboard({
    year: Number(selectedYear),
  });

  const monthlyRevenueMap: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) {
    monthlyRevenueMap[m] = 0;
  }

  (dashboardData?.revenueByMonth || []).forEach((item) => {
    if (item.month && item.amount?.amountMinorUnits) {
      monthlyRevenueMap[item.month] =
        Number(item.amount.amountMinorUnits) / 100;
    }
  });

  const chartData = Object.entries(monthlyRevenueMap).map(([mStr, revenue]) => {
    const mNum = Number(mStr);
    return {
      month: MONTH_LABELS[mNum] || `M${mNum}`,
      revenue,
    };
  });

  const rawMax = Math.max(...chartData.map((d) => d.revenue), 0);
  const maxRevenue = rawMax > 0 ? Math.ceil(rawMax * 1.2) : 1000;
  const yTicks = [
    0,
    Math.round(maxRevenue * 0.2),
    Math.round(maxRevenue * 0.4),
    Math.round(maxRevenue * 0.6),
    Math.round(maxRevenue * 0.8),
    Math.round(maxRevenue),
  ];

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
            data={chartData}
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
              ticks={yTicks}
              domain={[0, maxRevenue]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickFormatter={(val) =>
                `₦${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
              }
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
