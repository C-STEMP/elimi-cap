export interface NormalizedFacilitator {
  id?: string;
  name: string;
  avatar?: string | null;
  photoUrl?: string | null;
  role: string;
  trade?: string;
  tags?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractFacilitatorFromApplication(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  application?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignedOverride?: any,
): NormalizedFacilitator | null {
  if (!application && !assignedOverride) return null;

  const raw =
    assignedOverride ||
    application?.assignedFacilitator ||
    application?.facilitator ||
    application?.assessor ||
    application?.unitAssessor ||
    null;

  if (!raw && !application?.facilitatorName && !application?.assessorName) {
    return null;
  }

  const rawTrade =
    raw?.trade ||
    (typeof application?.trade === "object"
      ? application?.trade?.name
      : application?.trade) ||
    application?.tradeName ||
    "";

  const resolvedName =
    raw?.name ||
    (raw?.firstName
      ? `${raw.firstName} ${raw.lastName || ""}`.trim()
      : null) ||
    application?.facilitatorName ||
    application?.assessorName ||
    "Facilitator";

  const resolvedAvatar =
    raw?.photo?.url ||
    raw?.photoUrl ||
    raw?.avatar ||
    (raw?.photoAssetId ? `/api/assets/${raw.photoAssetId}` : null) ||
    null;

  const resolvedRole =
    raw?.role ||
    ["Facilitator", rawTrade].filter(Boolean).join(" · ") ||
    "Facilitator";

  const resolvedTags =
    Array.isArray(raw?.tags) && raw.tags.length > 0
      ? raw.tags
      : [rawTrade].filter(Boolean);

  return {
    id: raw?.id || raw?.assessorId,
    name: resolvedName,
    avatar: resolvedAvatar,
    photoUrl: resolvedAvatar,
    role: resolvedRole,
    trade: rawTrade,
    tags: resolvedTags,
  };
}
