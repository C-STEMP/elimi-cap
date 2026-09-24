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
  /** Display label describing user's role on this application */
  roleLabel: string;
  /** Name of the assigned QAA assessor */
  unitAssessorName?: string;
  /** Name of the assigned IQA verifier */
  internalVerifierName?: string;
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
  if (aName && bName && aName === bName) return true;

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
    application?.unitAssessor || (application as any)?.facilitator;
  const internalVerifier = application?.internalVerifier;

  const samePerson = isSameAssessor(unitAssessor, internalVerifier);

  // Compile all known identifiers and aliases for the logged-in user
  const currentIds = [
    user?.id,
    user?.userId,
    (user as any)?._id,
    assessorProfile?.id,
    assessorProfile?.assessorId,
  ]
    .filter(Boolean)
    .map(String)
    .map((s) => s.toLowerCase().trim());

  const currentEmails = [
    user?.email,
    meProfile?.contactInformation?.emailAddress,
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

  const matchesAssessor = (target?: {
    assessorId?: string;
    id?: string;
    name?: string;
    email?: string;
  } | null): boolean => {
    if (!target) return false;
    const targetId = (target.assessorId || target.id || "")
      .toString()
      .toLowerCase()
      .trim();
    const targetEmail = (target.email || "").toString().toLowerCase().trim();
    const targetName = (target.name || "").toString().toLowerCase().trim();

    if (targetId && currentIds.includes(targetId)) return true;
    if (targetEmail && currentEmails.includes(targetEmail)) return true;
    if (
      targetName &&
      currentNames.some(
        (n) =>
          n === targetName ||
          n.includes(targetName) ||
          targetName.includes(n),
      )
    ) {
      return true;
    }
    return false;
  };

  const directMatchQaa = matchesAssessor(unitAssessor);
  const directMatchIqa = matchesAssessor(internalVerifier);

  // Check user system roles
  const userRoleStr = (user?.role || "").toLowerCase();
  const userRolesList = Array.isArray((user as any)?.roles)
    ? (user as any).roles.map((r: string) => r.toLowerCase())
    : [];

  const systemHasIqaRole =
    userRoleStr.includes("iv") ||
    userRoleStr.includes("verifier") ||
    userRoleStr.includes("iqa") ||
    userRolesList.includes("iv") ||
    userRolesList.includes("iqa") ||
    userRolesList.includes("internal_verifier");

  const systemHasQaaRole =
    userRoleStr.includes("assessor") ||
    userRoleStr.includes("qaa") ||
    userRolesList.includes("unit_assessor") ||
    userRolesList.includes("qaa");

  // If QAA and IQA are the same person and the user matches either, they match both!
  const isCurrentQaa = samePerson
    ? directMatchQaa || directMatchIqa
    : directMatchQaa;
  const isCurrentIqa = samePerson
    ? directMatchQaa || directMatchIqa
    : directMatchIqa;

  const isDualRole =
    (samePerson && (directMatchQaa || directMatchIqa)) ||
    (directMatchQaa && directMatchIqa) ||
    (isCurrentQaa && systemHasIqaRole) ||
    (isCurrentIqa && systemHasQaaRole);

  // Authorization to perform actions:
  // Irrespective of whether they are the same person or different people,
  // anyone assigned as IQA (or in dual role) CAN perform IQA functions!
  const canPerformIqa = Boolean(
    isCurrentIqa ||
      isDualRole ||
      (samePerson && isCurrentQaa) ||
      (!internalVerifier && systemHasIqaRole),
  );

  const canPerformQaa = Boolean(
    isCurrentQaa ||
      isDualRole ||
      (samePerson && isCurrentIqa) ||
      (!unitAssessor && systemHasQaaRole),
  );

  let roleLabel = "Assessor";
  if (isDualRole) {
    roleLabel = "QAA & Internal Verifier";
  } else if (isCurrentIqa || (!isCurrentQaa && canPerformIqa)) {
    roleLabel = "Internal Verifier";
  } else if (isCurrentQaa) {
    roleLabel = "QAA Assessor";
  }

  return {
    samePerson,
    isCurrentQaa,
    isCurrentIqa,
    isDualRole,
    canPerformIqa,
    canPerformQaa,
    roleLabel,
    unitAssessorName: unitAssessor?.name,
    internalVerifierName: internalVerifier?.name,
  };
}
