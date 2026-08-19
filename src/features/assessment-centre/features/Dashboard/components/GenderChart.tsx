"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGetCentreDashboard } from "@/src/features/shared/centre/hooks";

export const GenderChart: React.FC = () => {
  const { data: dashboardData } = useGetCentreDashboard();

  const genderList = dashboardData?.genderDistribution || [];
  let male = 0;
  let female = 0;
  let others = 0;

  genderList.forEach((item) => {
    if (item.gender === "male") male += item.count || 0;
    else if (item.gender === "female") female += item.count || 0;
    else others += item.count || 0;
  });

  const total = male + female + others;

  const data = [
    { name: "Male", value: male, color: "#a31d38" },
    { name: "Female", value: female, color: "#2b2b2b" },
    { name: "Others", value: others, color: "#9ca3af" },
  ];

  // If total is 0, provide placeholder segment for aesthetic ring rendering
  const chartData =
    total > 0
      ? data.filter((d) => d.value > 0)
      : [{ name: "No Data", value: 1, color: "#E5E7EB" }];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col justify-between h-full min-h-95 select-none">
      <h3 className="text-lg font-medium text-black tracking-tight mb-2">
        Gender Distribution
      </h3>

      <div className="relative w-full h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={88}
              paddingAngle={total > 0 ? 2 : 0}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            {total > 0 && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  borderRadius: "8px",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                formatter={(val: any, name: any) => [
                  `${Number(val).toLocaleString()} candidate${Number(val) === 1 ? "" : "s"}`,
                  name,
                ]}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-extrabold text-neutral-primary tracking-tight">
            {total.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">Total</span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-neutral-secondary flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a31d38]" />
          <span>Male ({male})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2b2b2b]" />
          <span>Female ({female})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]" />
          <span>Others ({others})</span>
        </div>
      </div>
    </div>
  );
};
