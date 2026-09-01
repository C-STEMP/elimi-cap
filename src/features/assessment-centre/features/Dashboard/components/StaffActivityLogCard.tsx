"use client";

import React from "react";
import {
  useGetCentreDashboard,
  useGetCentreStaff,
} from "@/src/features/shared/centre/hooks";
import { useAppSelector } from "@/src/store/hooks";

function isIdLike(val: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  // ULID (26 uppercase alphanumeric characters)
  if (/^[0-9A-Z]{26}$/i.test(trimmed)) return true;
  // UUID (with hyphens)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return true;
  // Generic opaque hex or Base32 IDs without spaces
  if (!trimmed.includes(" ") && !trimmed.includes("@") && trimmed.length >= 18) return true;
  return false;
}

function formatActionText(action: string): string {
  if (!action) return "Activity logged";
  const actionMap: Record<string, string> = {
    "retained_request.decided": "Decided on assessor request",
    "retained_request.approved": "Approved assessor request",
    "retained_request.rejected": "Rejected assessor request",
    "retained_request.submitted": "Submitted request to join centre",
    "retained_request.created": "Created assessor request",
    "application.reviewed": "Reviewed candidate application",
    "application.approved": "Approved candidate application",
    "application.accepted": "Accepted candidate application",
    "application.rejected": "Rejected candidate application",
    "application.submitted": "Submitted application",
    "staff.invited": "Invited staff member",
    "staff.added": "Added staff member",
    "staff.role_updated": "Updated staff role",
    "staff.deactivated": "Deactivated staff member",
    "job_posting.created": "Created job posting",
    "job_posting.closed": "Closed job posting",
  };

  if (actionMap[action.toLowerCase()]) {
    return actionMap[action.toLowerCase()];
  }

  return action
    .replace(/[._]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: dashboardData } = useGetCentreDashboard();
  const { data: staffList = [] } = useGetCentreStaff();
  const logs = dashboardData?.staffActivity || [];

  const resolveActorName = (log: any): string => {
    // 1. If explicit human actor name is provided
    if (log.actorName && !isIdLike(log.actorName)) {
      return log.actorName;
    }

    // 2. Check metadata
    const metaName =
      log.metadata?.actorName ||
      log.metadata?.staffName ||
      log.metadata?.userName ||
      log.metadata?.name;
    if (metaName && !isIdLike(metaName)) {
      return metaName;
    }

    const rawId = log.staffId || log.actorId || log.actorName || log.userId;

    // 3. Look up in centre staffList
    if (rawId) {
      const staffMatch = staffList.find(
        (s) =>
          s.id === rawId ||
          s.email === rawId ||
          (s as any).userId === rawId ||
          (s as any).actorId === rawId ||
          (s as any).user?.id === rawId,
      );
      if (staffMatch?.name && !isIdLike(staffMatch.name)) {
        return staffMatch.name;
      }
      if (staffMatch?.email) {
        return staffMatch.email.split("@")[0];
      }
    }

    // 4. Check logged in user
    if (
      authUser &&
      (rawId === authUser.id ||
        (authUser as any).sub === rawId ||
        !rawId ||
        log.role === "super_admin")
    ) {
      const currentUserName =
        authUser.fullName ||
        (authUser as any).name ||
        authUser.email?.split("@")[0];
      if (currentUserName && !isIdLike(currentUserName)) {
        return currentUserName;
      }
    }

    // 5. Friendly role fallback
    if (log.role === "super_admin") return "Centre Admin";
    if (log.role === "regular_admin") return "Admin";
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
                  {formatActionText(log.action)}
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
