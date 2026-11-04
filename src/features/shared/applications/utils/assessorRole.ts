import type { ApplicationDetail } from "../api/types";

export interface AssessorRoleContext {
  /** True if the application's unitAssessor (QAA) and internalVerifier (IQA) are the same person */
  samePerson: boolean;
  /** True if the current logged-in user matches the assigned QAA */
  isCurrentQaa: boolean;
  /** True if the current logged-in user matches the assigned IQA */
  isCurrentIqa: boolean;
  /** True if the user holds both QAA and IQA roles on this application */
  isDualRole: boolean;
  /** True if the user is authorized to perform IQA functions (fill/submit IQAM forms, mark competent) */
  canPerformIqa: boolean;
  /** True if the user is authorized to perform QAA functions (review unit evidence, sign off units) */
  canPerformQaa: boolean;
  /** True if the current logged-in user matches the assigned EV */
  isCurrentEv?: boolean;
  /** True if the user is authorized to perform EV functions (external verification review) */
  canPerformEv?: boolean;
  /** Display label describing user's role on this application */
  roleLabel: string;
  /** Name of the assigned QAA assessor */
  unitAssessorName?: string;
  /** Name of the assigned IQA verifier */
  internalVerifierName?: string;
  /** Name of the assigned EV verifier */
  externalVerifierName?: string;
}

export function isSameAssessor(
  a?: { id?: string; assessorId?: string; name?: string } | null,
  b?: { id?: string; assessorId?: string; name?: string } | null,
): boolean {
  if (!a || !b) return false;
  const aId = (a.assessorId || a.id || "").trim();
  const bId = (b.assessorId || b.id || "").trim();
  if (aId && bId && aId.toLowerCase() === bId.toLowerCase()) return true;

  const aName = (a.name || "").trim().toLowerCase();
  const bName = (b.name || "").trim().toLowerCase();
  if (aName && bName && aName.length > 2 && aName === bName) return true;

  return false;
}

export function getAssessorRoleContext({
  application,
  user,
  meProfile,
  assessorProfile,
}: {
  application?: ApplicationDetail | null;
  user?: any;
  meProfile?: any;
  assessorProfile?: any;
}): AssessorRoleContext {
  const unitAssessor =
    application?.unitAssessor ||
    (application as any)?.facilitator ||
    (application as any)?.assessor ||
    (application as any)?.verification?.unitAssessor;

  const internalVerifier =
    application?.internalVerifier ||
    (application as any)?.verification?.internalVerifier ||
    (application as any)?.frozenProfile?.internalVerifier ||
    ((application as any)?.internalVerifierId
      ? {
          id: (application as any).internalVerifierId,
          assessorId: (application as any).internalVerifierId,
        }
      : null);

  const externalVerifier =
    (application as any)?.externalVerifier ||
    (application as any)?.verification?.externalVerifier ||
    ((application as any)?.externalVerifierId
      ? {
          id: (application as any).externalVerifierId,
          assessorId: (application as any).externalVerifierId,
        }
      : null);

  const samePerson = isSameAssessor(unitAssessor, internalVerifier);

  // Compile all known identifiers and aliases for the logged-in user
  const currentIds = [
    user?.id,
    user?.userId,
    (user as any)?._id,
    (user as any)?.sub,
    assessorProfile?.id,
    assessorProfile?.assessorId,
    (assessorProfile as any)?._id,
    (meProfile as any)?.id,
    (meProfile as any)?.userId,
  ]
    .filter(Boolean)
    .map(String)
    .map((s) => s.toLowerCase().trim());

  const currentEmails = [
    user?.email,
    (user as any)?.emailAddress,
    meProfile?.contactInformation?.emailAddress,
    (meProfile as any)?.email,
    assessorProfile?.email,
  ]
    .filter(Boolean)
    .map(String)
    .map((s) => s.toLowerCase().trim());

  const currentNames = [
    user?.fullName,
    (user as any)?.name,
    `${(user as any)?.firstName || ""} ${(user as any)?.lastName || ""}`.trim(),
    assessorProfile?.name,
    `${meProfile?.personalDetails?.firstName || ""} ${
      meProfile?.personalDetails?.lastName || ""
    }`.trim(),
  ]
    .filter(Boolean)
    .map(String)
    .map((s) => s.toLowerCase().trim());

  const matchesAssessor = (
    target?: {
      assessorId?: string;
      id?: string;
      name?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    } | string | null,
  ): boolean => {
    if (!target) return false;
    if (typeof target === "string") {
      const trimmed = target.toLowerCase().trim();
      return Boolean(trimmed && currentIds.includes(trimmed));
    }
    const targetId = (target.assessorId || target.id || "")
      .toString()
      .toLowerCase()
      .trim();
    const targetEmail = (target.email || "").toString().toLowerCase().trim();
    const targetFullName = (
      target.name ||
      `${target.firstName || ""} ${target.lastName || ""}`
    )
      .toString()
      .toLowerCase()
      .trim();

    if (targetId && currentIds.includes(targetId)) return true;
    if (targetEmail && currentEmails.includes(targetEmail)) return true;
    if (targetFullName && targetFullName.length > 2) {
      if (currentNames.some((n) => n === targetFullName)) {
        return true;
      }
    }
    return false;
  };

  const directMatchQaa = matchesAssessor(unitAssessor);
  const directMatchIqa = matchesAssessor(internalVerifier);
  const directMatchEv = matchesAssessor(externalVerifier);

  const appRole = ((application as any)?.role || "").toLowerCase();
  const appRoles: string[] = Array.isArray((application as any)?.roles)
    ? (application as any).roles.map((r: string) => r.toLowerCase())
    : [];

  const isAssignedAsIvOnRecord =
    appRole === "internal verifier" ||
    appRole === "internal_verifier" ||
    appRole === "iv" ||
    appRoles.includes("internal_verifier") ||
    appRoles.includes("iv");

  const isAssignedAsQaaOnRecord =
    appRole === "assessor" ||
    appRole === "unit_assessor" ||
    appRole === "facilitator" ||
    appRole === "qaa" ||
    appRoles.includes("unit_assessor") ||
    appRoles.includes("qaa") ||
    appRoles.includes("assessor");

  const isAssignedAsEvOnRecord =
    appRole === "external verifier" ||
    appRole === "external_verifier" ||
    appRole === "ev" ||
    appRole === "eqa" ||
    appRoles.includes("external_verifier") ||
    appRoles.includes("ev") ||
    appRoles.includes("eqa");

  // In NSQ, QAA and IV are strictly separate roles and steps.
  // A QAA assessor cannot approve the IV stage or sign as IV.
  const isCurrentQaa = directMatchQaa || (isAssignedAsQaaOnRecord && !directMatchIqa);
  const isCurrentIqa = directMatchIqa || (isAssignedAsIvOnRecord && !directMatchQaa);
  const isCurrentEv = Boolean(directMatchEv || isAssignedAsEvOnRecord);

  const isDualRole = Boolean(directMatchQaa && directMatchIqa);

  const canPerformIqa = isCurrentIqa;
  const canPerformQaa = isCurrentQaa;
  const canPerformEv = isCurrentEv;

  let roleLabel = "Assessor";
  if (isDualRole) {
    roleLabel = "QAA & Internal Verifier";
  } else if (isCurrentEv) {
    roleLabel = "External Verifier";
  } else if (isCurrentIqa) {
    roleLabel = "Internal Verifier";
  } else if (isCurrentQaa) {
    roleLabel = "QAA Assessor";
  } else if ((application as any)?.role) {
    roleLabel = (application as any).role;
  }

  return {
    samePerson,
    isCurrentQaa,
    isCurrentIqa,
    isCurrentEv,
    isDualRole,
    canPerformIqa,
    canPerformQaa,
    canPerformEv,
    roleLabel,
    unitAssessorName: unitAssessor?.name,
    internalVerifierName: internalVerifier?.name,
    externalVerifierName: (externalVerifier as any)?.name || (externalVerifier as any)?.assessorName,
  };
}
