/**
 * Central registry of all routes accessible to Candidate users.
 * Grouped by feature domain (Dashboard, RPL Flow, Onboarding, Authentication)
 * and mapped to entry points in the Next.js App Router.
 */
export const CANDIDATE_ROUTES = {
  /**
   * Main Candidate Dashboard App Router Routes
   */
  app: {
    dashboard: "/dashboard",
    applications: "/dashboard/applications",
    notifications: "/dashboard/notifications",
    settings: "/dashboard/settings",
    ninVerification: "/dashboard/settings/nin-verification",
    applicationDetail: (id: string) => `/dashboard/applications/${id}`,
    evidenceVault: (id: string) => `/dashboard/applications/${id}/evidence-vault`,
    selfAssessment: (id: string) => `/dashboard/applications/${id}/self-assessment`,
  },

  /**
   * RPL (Recognition of Prior Learning) Flow Routes
   */
  rpl: {
    personalInfo: "/rpl/personal-info",
    experienceTrade: "/rpl/experience-trade",
    verifyIdentity: "/rpl/verify-identity",
    reviewSubmit: "/rpl/review-submit",
  },

  /**
   * Onboarding Flow Routes for Candidates
   */
  onboarding: {
    welcome: "/onboarding/welcome",
    roleSelection: "/onboarding/role-selection",
    personalInfo: "/onboarding/personal-info",
    verifyIdentity: "/onboarding/verify-identity",
    assessmentType: "/onboarding/assessment-type",
    startApplication: "/onboarding/start-application",
    success: "/onboarding/success?role=candidate",
  },

  /**
   * Authentication Routes for Candidate Access
   */
  auth: {
    login: "/login",
    register: "/register",
    signin: "/login",
    signup: "/register",
    completeSignup: "/complete-signup",
    verifyEmail: "/verify",
    enterOtp: "/enter-otp",
    forgotPassword: "/forgot-password",
    changePassword: "/change-password",
  },
} as const;

/**
 * Full metadata mapping of Candidate features to their App Router locations and descriptions.
 */
export interface CandidateRouteMeta {
  id: string;
  feature: string;
  routePath: string;
  appRouterFile: string;
  description: string;
  category: "Dashboard" | "RPL Flow" | "Onboarding" | "Auth";
}

export const CANDIDATE_ROUTE_LIST: CandidateRouteMeta[] = [
  // Dashboard & Main Features
  {
    id: "candidate-dashboard",
    feature: "Candidate Dashboard Overview",
    routePath: CANDIDATE_ROUTES.app.dashboard,
    appRouterFile: "src/app/dashboard/page.tsx",
    description: "Main candidate dashboard overview with application status, progress summary, and quick links.",
    category: "Dashboard",
  },
  {
    id: "candidate-applications-list",
    feature: "My Applications List",
    routePath: CANDIDATE_ROUTES.app.applications,
    appRouterFile: "src/app/dashboard/applications/page.tsx",
    description: "Comprehensive view of all candidate submitted and in-progress applications.",
    category: "Dashboard",
  },
  {
    id: "candidate-application-detail",
    feature: "Application Detail View",
    routePath: "/dashboard/applications/[id]",
    appRouterFile: "src/app/dashboard/applications/[id]/page.tsx",
    description: "Detailed view of a specific application including timeline, status, and required actions.",
    category: "Dashboard",
  },
  {
    id: "candidate-evidence-vault",
    feature: "Evidence Vault Management",
    routePath: "/dashboard/applications/[id]/evidence-vault",
    appRouterFile: "src/app/dashboard/applications/[id]/evidence-vault/page.tsx",
    description: "Upload and manage work evidence, portfolio media, and supporting documentation.",
    category: "Dashboard",
  },
  {
    id: "candidate-self-assessment",
    feature: "Self-Assessment Tool",
    routePath: "/dashboard/applications/[id]/self-assessment",
    appRouterFile: "src/app/dashboard/applications/[id]/self-assessment/page.tsx",
    description: "Multi-step self-assessment questionnaire to evaluate competencies and trade readiness.",
    category: "Dashboard",
  },
  {
    id: "candidate-notifications",
    feature: "Notifications Center",
    routePath: CANDIDATE_ROUTES.app.notifications,
    appRouterFile: "src/app/dashboard/notifications/page.tsx",
    description: "Candidate notification inbox for application updates, assessor messages, and system alerts.",
    category: "Dashboard",
  },
  {
    id: "candidate-settings",
    feature: "Account & Profile Settings",
    routePath: CANDIDATE_ROUTES.app.settings,
    appRouterFile: "src/app/dashboard/settings/page.tsx",
    description: "Candidate profile management, password updates, and account preferences.",
    category: "Dashboard",
  },
  {
    id: "candidate-nin-verification",
    feature: "NIN Verification Page",
    routePath: CANDIDATE_ROUTES.app.ninVerification,
    appRouterFile: "src/app/dashboard/settings/nin-verification/page.tsx",
    description: "Identity verification step using National Identity Number (NIN).",
    category: "Dashboard",
  },

  // RPL Flow
  {
    id: "rpl-personal-info",
    feature: "RPL Step 1: Personal Information",
    routePath: CANDIDATE_ROUTES.rpl.personalInfo,
    appRouterFile: "src/app/rpl/personal-info/page.tsx",
    description: "Captures candidate profile and contact details for RPL registration.",
    category: "RPL Flow",
  },
  {
    id: "rpl-experience-trade",
    feature: "RPL Step 2: Trade & Work Experience",
    routePath: CANDIDATE_ROUTES.rpl.experienceTrade,
    appRouterFile: "src/app/rpl/experience-trade/page.tsx",
    description: "Select trade sector, years of experience, and prior learning competencies.",
    category: "RPL Flow",
  },
  {
    id: "rpl-verify-identity",
    feature: "RPL Step 3: Identity Verification",
    routePath: CANDIDATE_ROUTES.rpl.verifyIdentity,
    appRouterFile: "src/app/rpl/verify-identity/page.tsx",
    description: "Verification of candidate identity documents for RPL application.",
    category: "RPL Flow",
  },
  {
    id: "rpl-review-submit",
    feature: "RPL Step 4: Review & Final Submission",
    routePath: CANDIDATE_ROUTES.rpl.reviewSubmit,
    appRouterFile: "src/app/rpl/review-submit/page.tsx",
    description: "Final review of RPL application data before submission to assessment centre.",
    category: "RPL Flow",
  },

  // Onboarding
  {
    id: "onboarding-welcome",
    feature: "Onboarding: Welcome Screen",
    routePath: CANDIDATE_ROUTES.onboarding.welcome,
    appRouterFile: "src/app/onboarding/welcome/page.tsx",
    description: "Welcome introduction to the ELIMI RPL platform.",
    category: "Onboarding",
  },
  {
    id: "onboarding-role-selection",
    feature: "Onboarding: Role Selection",
    routePath: CANDIDATE_ROUTES.onboarding.roleSelection,
    appRouterFile: "src/app/onboarding/role-selection/page.tsx",
    description: "Choose account path between Candidate and Assessment Centre.",
    category: "Onboarding",
  },
  {
    id: "onboarding-assessment-type",
    feature: "Onboarding: Assessment Pathway Selection",
    routePath: CANDIDATE_ROUTES.onboarding.assessmentType,
    appRouterFile: "src/app/dashboard/assessment-type/page.tsx",
    description: "Select type of assessment or certification pathway.",
    category: "Onboarding",
  },
  {
    id: "onboarding-start-application",
    feature: "Onboarding: Start Assessment",
    routePath: CANDIDATE_ROUTES.onboarding.startApplication,
    appRouterFile: "src/app/rpl/personal-info/page.tsx",
    description: "Initial application launch pad for candidate onboarding.",
    category: "Onboarding",
  },
  {
    id: "onboarding-candidate-personal-info",
    feature: "Onboarding: Candidate Personal Details",
    routePath: CANDIDATE_ROUTES.onboarding.personalInfo,
    appRouterFile: "src/app/onboarding/personal-info/page.tsx",
    description: "Fill candidate personal information during onboarding.",
    category: "Onboarding",
  },
  {
    id: "onboarding-candidate-success",
    feature: "Onboarding: Completion Success",
    routePath: CANDIDATE_ROUTES.onboarding.success,
    appRouterFile: "src/app/onboarding/success/page.tsx",
    description: "Onboarding completion confirmation page.",
    category: "Onboarding",
  },

  // Authentication
  {
    id: "auth-signin",
    feature: "Sign In",
    routePath: CANDIDATE_ROUTES.auth.signin,
    appRouterFile: "src/app/(auth)/signin/page.tsx",
    description: "Candidate account authentication.",
    category: "Auth",
  },
  {
    id: "auth-signup",
    feature: "Sign Up",
    routePath: CANDIDATE_ROUTES.auth.signup,
    appRouterFile: "src/app/(auth)/signup/page.tsx",
    description: "Candidate new user registration.",
    category: "Auth",
  },
  {
    id: "auth-complete-signup",
    feature: "Complete Sign Up",
    routePath: CANDIDATE_ROUTES.auth.completeSignup,
    appRouterFile: "src/app/(auth)/complete-signup/page.tsx",
    description: "Complete candidate profile setup post-registration.",
    category: "Auth",
  },
  {
    id: "auth-verify-email",
    feature: "Verify Email",
    routePath: CANDIDATE_ROUTES.auth.verifyEmail,
    appRouterFile: "src/app/(auth)/verify/page.tsx",
    description: "Email address verification step.",
    category: "Auth",
  },
];

/**
 * Top-level Candidate Dashboard Navigation Links
 */
export const CANDIDATE_NAV_LINKS = [
  { label: "Overview", href: CANDIDATE_ROUTES.app.dashboard },
  { label: "My Application", href: CANDIDATE_ROUTES.app.applications },
  { label: "Settings", href: CANDIDATE_ROUTES.app.settings },
] as const;

/**
 * Export alias for candidateRoutes to maintain naming flexibility
 */
export const candidateRoutes = CANDIDATE_ROUTES;