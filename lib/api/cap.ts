/**
 * lib/api/cap.ts
 * Axios instance for the CAP service (onboarding, applications, assessments).
 * Base URL: NEXT_PUBLIC_CAP_URL
 */

import { createApiInstance, unwrap, SuccessEnvelope } from "@/lib/api/client";

const BASE = process.env.NEXT_PUBLIC_CAP_URL ?? "";

const cap = createApiInstance(BASE);

export function capFetch<T>(
  path: string,
  options: { method?: string; data?: unknown; [key: string]: unknown } = {},
): Promise<T> {
  const { method = "GET", data, ...rest } = options;
  return unwrap<T>(
    cap.request<SuccessEnvelope<T>>({ url: path, method, data, ...rest }),
  );
}
