import { AssessmentCentreTab } from "../types";

/**
 * Central registry of all routes accessible to the Assessment Centre module.
 * Grouped by feature domain and entry points in the Next.js App Router.
 */
export const ASSESSMENT_CENTRE_ROUTES = {
  /**
   * Main App Router Page Routes for Assessment Centre
   */
  app: {
    root: "/assessment-centre",
    dashboard: "/assessment-centre/dashboard",
  },

  /**
   * Onboarding Flow Routes for Assessment Centre
   */
  onboarding: {
    centerInfo: "/onboarding/assessment-centre/center-info",
    personalInfo: "/onboarding/assessment-centre/personal-info",
    verifyIdentity: "/onboarding/assessment-centre/verify-identity",
    success: "/onboarding/success?role=assessment-centre",
  },

  /**
   * Dashboard Feature Tabs / Sub-views
   */
  tabs: {
    overview: "overview",
    staff: "staff",
    applications: "applications",
    jobListing: "job-listing",
    assessorRequest: "assessor-request",
    assessors: "assessors",
    payments: "payments",
    settings: "settings",
    messages: "messages",
  } as Record<string, AssessmentCentreTab>,
} as const;

/**
 * Full metadata mapping of Assessment Centre features to their App Router locations and descriptions.
 */
export interface AssessmentCentreRouteMeta {
  id: string;
  feature: string;
  routePath: string;
  appRouterFile: string;
  description: string;
  category: "Dashboard" | "Onboarding";
}

export const ASSESSMENT_CENTRE_ROUTE_LIST: AssessmentCentreRouteMeta[] = [
  {
    id: "app-root",
    feature: "Assessment Centre Entry / Dashboard",
    routePath: ASSESSMENT_CENTRE_ROUTES.app.root,
    appRouterFile: "src/app/assessment-centre/page.tsx",
    description: "Main root page for Assessment Centre dashboard.",
    category: "Dashboard",
  },
  {
    id: "app-dashboard",
    feature: "Assessment Centre Dashboard (Explicit Link)",
    routePath: ASSESSMENT_CENTRE_ROUTES.app.dashboard,
    appRouterFile: "src/app/assessment-centre/dashboard/page.tsx",
    description: "Direct entry route for Assessment Centre dashboard.",
    category: "Dashboard",
  },
  {
    id: "onboarding-center-info",
    feature: "Onboarding Step 1: Center Information",
    routePath: ASSESSMENT_CENTRE_ROUTES.onboarding.centerInfo,
    appRouterFile: "src/app/onboarding/assessment-centre/center-info/page.tsx",
    description: "Captures Assessment Centre credentials, accreditation, and facility information.",
    category: "Onboarding",
  },
  {
    id: "onboarding-personal-info",
    feature: "Onboarding Step 2: Personal & Contact Information",
    routePath: ASSESSMENT_CENTRE_ROUTES.onboarding.personalInfo,
    appRouterFile: "src/app/onboarding/assessment-centre/personal-info/page.tsx",
    description: "Captures designated center manager/representative details.",
    category: "Onboarding",
  },
  {
    id: "onboarding-verify-identity",
    feature: "Onboarding Step 3: Identity & Business Verification",
    routePath: ASSESSMENT_CENTRE_ROUTES.onboarding.verifyIdentity,
    appRouterFile: "src/app/onboarding/assessment-centre/verify-identity/page.tsx",
    description: "Uploads verification documents and conducts NIN / CAC checks.",
    category: "Onboarding",
  },
  {
    id: "onboarding-success",
    feature: "Onboarding Completion",
    routePath: ASSESSMENT_CENTRE_ROUTES.onboarding.success,
    appRouterFile: "src/app/onboarding/success/page.tsx",
    description: "Confirmation page after completing Assessment Centre onboarding.",
    category: "Onboarding",
  },
];

/**
 * List of feature tabs available within the Assessment Centre Dashboard view
 */
export const ASSESSMENT_CENTRE_TABS_LIST: { id: AssessmentCentreTab; label: string; description: string }[] = [
  { id: "overview", label: "Overview", description: "Dashboard metrics, revenue charts, trade distribution, staff activity, and quick stats." },
  { id: "staff", label: "Staff", description: "Manage Assessment Centre personnel, roles, permissions, and staff activity." },
  { id: "applications", label: "Applications", description: "Manage pending applications, candidate evidence vault, forms, and assessment progress." },
  { id: "job-listing", label: "Job Listing", description: "Post job vacancies, view candidate applications, and assign positions." },
  { id: "assessor-request", label: "Assessor Request", description: "Review and process incoming requests from assessors." },
  { id: "assessors", label: "Assessors", description: "View registered assessors, profiles, certifications, and active assignments." },
  { id: "payments", label: "Payments", description: "Financial metrics, transaction history, payouts, and withdrawal operations." },
  { id: "settings", label: "Settings", description: "Center profile settings, security, notifications, and preferences." },
  { id: "messages", label: "Messages", description: "Internal chat, staff messaging, and broad notification dispatch." },
];

/**
 * Utility to check if a tab string is a valid Assessment Centre tab
 */
export function isValidAssessmentCentreTab(tab: string): tab is AssessmentCentreTab {
  return ASSESSMENT_CENTRE_TABS_LIST.some((t) => t.id === tab);
}