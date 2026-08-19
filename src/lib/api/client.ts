/**
 * lib/api/client.ts
 * Shared axios factory, envelope types, and ApiError used by both clients.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  getPersona,
  savePersona,
  getCentreId,
} from "@/src/lib/auth-storage";

/**
 * Synchronously resolve and store the correct persona based on current URL path.
 * Called at module load so that all subsequent API calls in the same render
 * cycle already have the right persona in localStorage.
 */
function syncPersonaFromRoute(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (
    path.startsWith("/dashboard") ||
    path.startsWith("/applications") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/rpl")
  ) {
    savePersona("candidate");
  } else if (path.startsWith("/assessment-centre")) {
    savePersona("centre");
  } else if (path.startsWith("/assessor") || path.startsWith("/quality-assurance")) {
    savePersona("assessor");
  } else if (path.startsWith("/awarding-body")) {
    savePersona("awarding_body");
  }
}

syncPersonaFromRoute();


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

// ─── Retry flag ───────────────────────────────────────────────────────────────
interface RetryableRequest extends InternalAxiosRequestConfig {
  _isRetryRequest?: boolean;
}

// ─── Refresh State & Queue ───────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

function handleSessionExpired() {
  clearTokens();
  if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
    window.location.href = "/signin";
  }
}

function toApiError(
  error: AxiosError<SuccessEnvelope | ErrorEnvelope>,
): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data as ErrorEnvelope | undefined;
  if (body && body.success === false) {
    return new ApiError(
      status,
      body.error?.code ?? "UNKNOWN",
      body.error?.message ?? "An unexpected error occurred.",
      body.error?.details,
    );
  }
  return new ApiError(status, "NETWORK_ERROR", error.message);
}

// ─── Factory ──────────────────────────────────────────────────────────────────
export function createApiInstance(
  baseURL: string,
  options?: { isCap?: boolean },
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;

    if (options?.isCap) {
      const url = config.url || "";
      const urlPath = url.split("?")[0];

      // Catalogue & public endpoints do not require acting persona
      const isPublicCatalogue =
        urlPath === "/sectors" ||
        urlPath.startsWith("/sectors/") ||
        urlPath === "/centres" ||
        urlPath.startsWith("/centres/") ||
        urlPath.startsWith("/trades/") ||
        urlPath.startsWith("/admin/") ||
        urlPath.startsWith("/onboarding/") ||
        urlPath === "/me";

      // ── Resolve persona ────────────────────────────────────────────────────
      // Priority: (1) already set on this call, (2) current page route, (3) stored
      let persona = config.headers["X-CAP-PERSONA"] as string | undefined;

      if (!persona && !isPublicCatalogue && typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path.startsWith("/assessment-centre")) {
          persona = "centre";
        } else if (
          path.startsWith("/assessor") ||
          path.startsWith("/quality-assurance")
        ) {
          persona = "assessor";
        } else if (path.startsWith("/awarding-body")) {
          persona = "awarding_body";
        } else if (
          path.startsWith("/dashboard") ||
          path.startsWith("/onboarding") ||
          path.startsWith("/applications") ||
          path.startsWith("/rpl")
        ) {
          persona = "candidate";
        }
      }

      // Fall back to stored persona, but guard against cross-workspace bleed
      if (!persona && !isPublicCatalogue) {
        const stored = getPersona();
        if (stored && typeof window !== "undefined") {
          const path = window.location.pathname;
          const isCentreRoute = path.startsWith("/assessment-centre");
          const isAssessorRoute =
            path.startsWith("/assessor") ||
            path.startsWith("/quality-assurance");
          const isAwardingBodyRoute = path.startsWith("/awarding-body");
          const isCandidateRoute =
            path.startsWith("/dashboard") ||
            path.startsWith("/onboarding") ||
            path.startsWith("/applications") ||
            path.startsWith("/rpl");

          // Only use stored persona if it matches the active workspace
          if (
            (stored === "centre" && isCentreRoute) ||
            (stored === "assessor" && isAssessorRoute) ||
            (stored === "awarding_body" && isAwardingBodyRoute) ||
            (stored === "candidate" && isCandidateRoute) ||
            // For routes not yet mapped (e.g. auth pages), trust the store
            (!isCentreRoute && !isAssessorRoute && !isAwardingBodyRoute && !isCandidateRoute)
          ) {
            persona = stored;
          }
        } else if (stored) {
          persona = stored;
        }
      }

      // ── Attach headers ─────────────────────────────────────────────────────
      if (persona && !isPublicCatalogue) {
        config.headers["X-CAP-PERSONA"] = persona;

        // X-CAP-CENTRE-ID is required whenever operating as a centre
        if (persona === "centre") {
          const centreId = getCentreId();
          if (centreId && !config.headers["X-CAP-CENTRE-ID"]) {
            config.headers["X-CAP-CENTRE-ID"] = centreId;
          }
        }
      }
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<SuccessEnvelope | ErrorEnvelope>) => {
      const req = error.config as RetryableRequest | undefined;

      if (
        error.response?.status === 401 &&
        req &&
        !req._isRetryRequest &&
        !req.url?.includes("/auth/refresh") &&
        !req.url?.includes("/auth/login")
      ) {
        req._isRetryRequest = true;

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          handleSessionExpired();
          return Promise.reject(
            new ApiError(
              401,
              "UNAUTHORIZED",
              "Session expired. Please sign in again.",
            ),
          );
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                req.headers["Authorization"] = `Bearer ${token}`;
                resolve(instance(req));
              },
              reject: (err: unknown) => {
                reject(err);
              },
            });
          });
        }

        isRefreshing = true;
        const orchestratorUrl =
          process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
          "https://www.staging-api.elimi-ecosystem.e-limi.africa/v1/ol";

        try {
          const { data } = await axios.post<
            SuccessEnvelope<{ accessToken: string; refreshToken: string }>
          >(`${orchestratorUrl}/auth/refresh`, { refreshToken });

          const newAccessToken = data.data.accessToken;
          const newRefreshToken = data.data.refreshToken;

          saveTokens(newAccessToken, newRefreshToken);
          processQueue(null, newAccessToken);

          req.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return instance(req);
        } catch (refreshError) {
          processQueue(refreshError, null);
          handleSessionExpired();
          return Promise.reject(
            new ApiError(
              401,
              "UNAUTHORIZED",
              "Session expired. Please sign in again.",
            ),
          );
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(toApiError(error));
    },
  );

  return instance;
}

// ─── Unwrap SuccessEnvelope ───────────────────────────────────────────────────
export async function unwrap<T>(
  promise: Promise<{ data: SuccessEnvelope<T> | ErrorEnvelope }>,
): Promise<T> {
  const { data: envelope } = await promise;
  if (!envelope.success) {
    const err = envelope as ErrorEnvelope;
    throw new ApiError(
      0,
      err.error?.code ?? "UNKNOWN",
      err.error?.message ?? "An unexpected error occurred.",
      err.error?.details,
    );
  }
  return (envelope as SuccessEnvelope<T>).data;
}
