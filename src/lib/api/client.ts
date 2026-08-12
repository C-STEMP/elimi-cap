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
} from "@/src/lib/auth-storage";

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
export function createApiInstance(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
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
