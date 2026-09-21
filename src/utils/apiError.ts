import { ApiError } from "@/src/lib/api/client";

export interface FriendlyError {
  title: string;
  description: string;
}

/**
 * Central map of backend error codes → clear, actionable user-facing copy.
 * Add entries here as the backend surfaces new codes so messaging stays
 * consistent across the app instead of leaking raw server strings.
 */
const CODE_MESSAGES: Record<string, FriendlyError> = {
  "assessor.not_approved": {
    title: "Accreditation Not Approved Yet",
    description:
      "Your assessor accreditation is still under review. You can request to join a centre once the platform has approved your accreditation.",
  },
  "auth.out_of_scope": {
    title: "Action Not Allowed",
    description:
      "You don't have permission to perform this action with your current role.",
  },
};

/**
 * Turn any thrown error into clear title + description copy for a toast.
 *
 * Resolution order:
 *  1. Caller-provided `overrides` keyed by ApiError.code
 *  2. Shared CODE_MESSAGES keyed by ApiError.code
 *  3. Message-text heuristics (for backends that don't set a specific code)
 *  4. The caller's `fallback` title with the raw backend message as description
 *  5. A generic network error for non-API failures
 */
export function resolveApiError(
  error: unknown,
  fallback: FriendlyError,
  overrides?: Record<string, FriendlyError>,
): FriendlyError {
  if (error instanceof ApiError) {
    const byCode = overrides?.[error.code] ?? CODE_MESSAGES[error.code];
    if (byCode) return byCode;

    const msg = (error.message || "").toLowerCase();
    if (msg.includes("not approved") || msg.includes("not_approved")) {
      return CODE_MESSAGES["assessor.not_approved"];
    }
    if (error.statusCode === 403) {
      return CODE_MESSAGES["auth.out_of_scope"];
    }

    return {
      title: fallback.title,
      description: error.message || fallback.description,
    };
  }

  return {
    title: "Network Error",
    description:
      "Unable to reach the server. Please check your connection and try again.",
  };
}
