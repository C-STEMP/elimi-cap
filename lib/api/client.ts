/**
 * lib/api/client.ts
 * Base API client for the Orchestrator and CAP services.
 *
 * - Orchestrator base: /v1/ol (auth, storage, notifications, address)
 * - CAP base: /v1 on port 4001 (onboarding, applications, assessments)
 *
 * All responses follow SuccessEnvelope / ErrorEnvelope (§19).
 * On 401, automatically attempts one token refresh then retries.
 */

import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "@/lib/auth-storage";

// ─── Base URLs ────────────────────────────────────────────────────────────────
const ORCHESTRATOR_BASE =
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://api.elimi-ecosystem.e-limi.africa/v1/ol"
    : process.env.NODE_ENV === "test"
      ? "https://www.staging-api.elimi-ecosystem.e-limi.africa/v1/ol"
      : "http://localhost:4000/v1");

const CAP_BASE =
  process.env.NEXT_PUBLIC_CAP_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://cap.internal.yourorg.com/v1"
    : "http://localhost:4001/v1");

// ─── Envelope types ───────────────────────────────────────────────────────────
export interface SuccessEnvelope<T = unknown> {
  success: true;
  data: T;
  meta?: unknown;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field?: string; issue: string }[];
  };
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: { field?: string; issue: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Internal fetch helper ────────────────────────────────────────────────────
let isRefreshing = false;

async function _fetch<T>(
  url: string,
  options: RequestInit,
  isRetry = false,
): Promise<T> {
  const accessToken = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  // ── Auto-refresh on 401 ──────────────────────────────────────────────────
  if (response.status === 401 && !isRetry && !isRefreshing) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${ORCHESTRATOR_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const refreshData = (await refreshRes.json()) as SuccessEnvelope<{
            accessToken: string;
            refreshToken: string;
          }>;
          saveTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
          isRefreshing = false;
          // Retry original request once with new token
          return _fetch<T>(url, options, true);
        }
      } catch {
        // refresh failed
      } finally {
        isRefreshing = false;
      }
    }
    // Refresh failed or no refresh token — clear session
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new ApiError(401, "UNAUTHORIZED", "Session expired. Please sign in again.");
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  const text = await response.text();
  let json: SuccessEnvelope<T> | ErrorEnvelope;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(response.status, "PARSE_ERROR", `Server returned non-JSON: ${text.slice(0, 200)}`);
  }

  if (!response.ok || !json.success) {
    const err = json as ErrorEnvelope;
    throw new ApiError(
      response.status,
      err.error?.code ?? "UNKNOWN",
      err.error?.message ?? "An unexpected error occurred.",
      err.error?.details,
    );
  }

  return (json as SuccessEnvelope<T>).data;
}

// ─── Public API factories ─────────────────────────────────────────────────────
export function orchestratorFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return _fetch<T>(`${ORCHESTRATOR_BASE}${path}`, options);
}

export function capFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return _fetch<T>(`${CAP_BASE}${path}`, options);
}
