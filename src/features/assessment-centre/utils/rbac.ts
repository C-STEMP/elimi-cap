import { AssessmentCentreTab } from "../types";

export type RoleType = "centre" | "admin" | "staff";

export function normalizeRole(roleStr?: string | null): RoleType {
  if (!roleStr) return "centre";
  const lower = roleStr.toLowerCase();
  if (lower === "staff" || lower.includes("staff")) return "staff";
  if (
    lower === "regular_admin" ||
    lower === "admin" ||
    (lower.includes("admin") && !lower.includes("super"))
  ) {
    return "admin";
  }
  return "centre";
}

export function getPermittedTabs(roleStr?: string | null): AssessmentCentreTab[] {
  const role = normalizeRole(roleStr);

  if (role === "admin") {
    // Regular Admin: Overview, Staff, Applications, Job Listing, Assessor Request, Assessors, Settings
    return [
      "overview",
      "staff",
      "applications",
      "job-listing",
      "assessor-request",
      "assessors",
      "settings",
    ];
  }

  if (role === "staff") {
    // Regular Staff: Overview, Staff, Applications, Assessors, Settings
    return ["overview", "staff", "applications", "assessors", "settings"];
  }

  // Centre / Super Admin: All tabs
  return [
    "overview",
    "staff",
    "applications",
    "job-listing",
    "assessor-request",
    "assessors",
    "payments",
    "settings",
  ];
}

export function canSendBroadcast(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) !== "staff";
}

export function canViewStaffDetails(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) !== "staff";
}

export function canDeactivateAssessor(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) !== "staff";
}

export function canAddStaff(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) === "centre";
}

export function canDeactivateStaff(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) === "centre";
}

export function canViewPayments(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) === "centre";
}

export function canPostJob(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) !== "staff";
}

export function canApproveRetained(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) !== "staff";
}

export function canEditCentreProfile(roleStr?: string | null): boolean {
  return normalizeRole(roleStr) === "centre";
}
