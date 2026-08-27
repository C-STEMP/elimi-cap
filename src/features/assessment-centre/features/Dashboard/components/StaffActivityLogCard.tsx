"use client";

import React from "react";
import {
  useGetCentreDashboard,
  useGetCentreStaff,
} from "@/src/features/shared/centre/hooks";

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    return date.toLocaleDateString("en-GB");
  } catch {
    return dateStr;
  }
}

export const StaffActivityLogCard: React.FC = () => {
  const { data: dashboardData } = useGetCentreDashboard();
  const { data: staffList = [] } = useGetCentreStaff();
  const logs = dashboardData?.staffActivity || [];

  const resolveActorName = (log: any): string => {
    if (
      log.actorName &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(log.actorName) &&
      log.actorName.length < 30
    ) {
      return log.actorName;
    }
    const staffMatch = staffList.find(
      (s) =>
        s.id === log.staffId ||
        s.id === log.actorId ||
        s.id === log.actorName ||
        s.email === log.actorName,
    );
    if (staffMatch?.name) return staffMatch.name;
    if (log.actorName && !log.actorName.includes("-")) return log.actorName;
    return "Staff Member";
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4 select-none h-full">
      <h3 className="text-lg font-medium text-black tracking-tight mb-2">
        Staff Activity Log
      </h3>

      <div className="flex flex-col gap-3">
        {logs.length > 0 ? (
          logs.slice(0, 5).map((log) => {
            const roleLabel =
              log.role === "super_admin"
                ? "Super Admin"
                : log.role === "regular_admin"
                ? "Admin"
                : "Staff";
            return (
              <div
                key={log.id}
                className="bg-[#F5FAF8] hover:bg-[#F3F4F6] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors border border-gray-100/70"
              >
                <div className="flex flex-col shrink-0 min-w-25">
                  <span className="text-xs sm:text-sm font-medium text-black truncate">
                    {resolveActorName(log)}
                  </span>
                  <span className="text-[10px] text-black/60 font-normal mt-0.5">
                    {roleLabel}
                  </span>
                </div>

                <span className="text-xs lg:text-sm text-black/80 text-left flex-1 px-2 line-clamp-1">
                  {log.action}
                </span>

                <span className="text-xs lg:text-sm text-gray-500 shrink-0">
                  {formatRelativeTime(log.occurredAt)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 text-xs sm:text-sm font-normal">
              No recent staff activity logged.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
