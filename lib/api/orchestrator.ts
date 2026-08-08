/**
 * lib/api/orchestrator.ts
 * Axios instance for the Orchestrator service (auth, storage, notifications, address).
 * Base URL: NEXT_PUBLIC_ORCHESTRATOR_URL
 */

import { createApiInstance, unwrap, SuccessEnvelope } from "@/lib/api/client";

const BASE = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? "";

const orchestrator = createApiInstance(BASE);

export function orchestratorFetch<T>(
  path: string,
  options: { method?: string; data?: unknown; [key: string]: unknown } = {},
): Promise<T> {
  const { method = "GET", data, ...rest } = options;
  return unwrap<T>(
    orchestrator.request<SuccessEnvelope<T>>({ url: path, method, data, ...rest }),
  );
}
