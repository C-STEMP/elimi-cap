/**
 * Resolve a human-readable rejection reason from an API object, tolerating
 * whatever field name the backend uses. Returns null when none is present.
 *
 * Kept field-name agnostic on purpose: the backend field carrying the
 * assessor/retained-request rejection reason is being confirmed, so we read
 * the common candidates and render whichever one is populated.
 */
export function getRejectionReason(source: unknown): string | null {
  if (!source || typeof source !== "object") return null;
  const s = source as Record<string, unknown>;
  const candidate =
    s.rejectionReason ??
    s.reviewComment ??
    s.reason ??
    s.message ??
    s.comment ??
    s.respondedComment ??
    s.statusReason;
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : null;
}
