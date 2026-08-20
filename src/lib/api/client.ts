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
  } else if (
    path.startsWith("/assessor") ||
    path.startsWith("/quality-assurance")
  ) {
    savePersona("assessor");
  } else if (path.startsWith("/awarding-body")) {
    savePersona("awarding_body");
  }
}

syncPersonaFromRoute();

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

interface RetryableRequest extends InternalAxiosRequestConfig {
  _isRetryRequest?: boolean;
}

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

      const isExempt =
        urlPath === "/identity-verification" ||
        urlPath.startsWith("/identity-verification/") ||
        urlPath === "/onboarding" ||
        urlPath.startsWith("/onboarding/") ||
        urlPath === "/me" ||
        urlPath.startsWith("/me/") ||
        urlPath === "/sectors" ||
        urlPath.startsWith("/sectors/") ||
        urlPath === "/trades" ||
        urlPath.startsWith("/trades/") ||
        urlPath === "/centres" ||
        urlPath.startsWith("/centres/") ||
        urlPath === "/evidence/third-party-report-template" ||
        urlPath === "/admin/terms" ||
        urlPath === "/admin/awarding-bodies";

      if (!isExempt) {
        let persona = config.headers["X-CAP-PERSONA"] as string | undefined;

        if (!persona) {
          if (urlPath.startsWith("/centre/") || urlPath === "/directory") {
            persona = "centre";
          } else if (urlPath.startsWith("/candidate/")) {
            persona = "candidate";
          } else if (urlPath.startsWith("/assessor/")) {
            persona = "assessor";
          } else if (urlPath.startsWith("/awarding-body/")) {
            persona = "awarding_body";
          }
        }

        if (!persona && typeof window !== "undefined") {
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

        if (!persona) {
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

            if (
              (stored === "centre" && isCentreRoute) ||
              (stored === "assessor" && isAssessorRoute) ||
              (stored === "awarding_body" && isAwardingBodyRoute) ||
              (stored === "candidate" && isCandidateRoute) ||
              (!isCentreRoute &&
                !isAssessorRoute &&
                !isAwardingBodyRoute &&
                !isCandidateRoute)
            ) {
              persona = stored;
            }
          } else if (stored) {
            persona = stored;
          }
        }

        if (persona) {
          config.headers["X-CAP-PERSONA"] = persona;

          if (persona === "centre") {
            const centreId = getCentreId();
            if (centreId && !config.headers["X-CAP-CENTRE-ID"]) {
              config.headers["X-CAP-CENTRE-ID"] = centreId;
            }
          } else {
            delete config.headers["X-CAP-CENTRE-ID"];
          }
        }
      } else {
        delete config.headers["X-CAP-PERSONA"];
        delete config.headers["X-CAP-CENTRE-ID"];
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
