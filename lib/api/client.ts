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
} from "@/lib/auth-storage";

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

function handleSessionExpired() {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/signin";
  }
}

function toApiError(error: AxiosError<SuccessEnvelope | ErrorEnvelope>): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data as ErrorEnvelope | undefined;
  if (body && body.success === false) {
    return new ApiError(status, body.error?.code ?? "UNKNOWN", body.error?.message ?? "An unexpected error occurred.", body.error?.details);
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

      if (error.response?.status === 401 && req && !req._isRetryRequest) {
        req._isRetryRequest = true;

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          handleSessionExpired();
          return Promise.reject(new ApiError(401, "UNAUTHORIZED", "Session expired. Please sign in again."));
        }

        try {
          const { data } = await axios.post<SuccessEnvelope<{ accessToken: string; refreshToken: string }>>(
            `${baseURL}/auth/refresh`,
            { refreshToken },
          );
          saveTokens(data.data.accessToken, data.data.refreshToken);
          req.headers["Authorization"] = `Bearer ${data.data.accessToken}`;
          return instance(req);
        } catch {
          handleSessionExpired();
          return Promise.reject(new ApiError(401, "UNAUTHORIZED", "Session expired. Please sign in again."));
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
    throw new ApiError(0, err.error?.code ?? "UNKNOWN", err.error?.message ?? "An unexpected error occurred.", err.error?.details);
  }
  return (envelope as SuccessEnvelope<T>).data;
}
