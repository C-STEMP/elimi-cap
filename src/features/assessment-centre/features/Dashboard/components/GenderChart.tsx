"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { MOCK_GENDER_DISTRIBUTION } from "@/features/assessment-centre/utils/constants";

export const GenderChart: React.FC = () => {
  const { male, female, others, total } = MOCK_GENDER_DISTRIBUTION;

  const data = [
    { name: "Male", value: male, color: "#a31d38" },
    { name: "Female", value: female, color: "#2b2b2b" },
    { name: "Others", value: others, color: "#9ca3af" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col justify-between h-full min-h-95 select-none">
      <h3 className="text-lg font-medium text-black tracking-tight mb-2">
        Gender Distribution
      </h3>

      <div className="relative w-full h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                borderRadius: "8px",
                border: "none",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              formatter={(val: any) => [Number(val).toLocaleString(), "Count"]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-extrabold text-neutral-primary tracking-tight">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-neutral-secondary flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a31d38]" />
          <span>Male</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2b2b2b]" />
          <span>Female</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]" />
          <span>Others</span>
        </div>
      </div>
    </div>
  );
};
