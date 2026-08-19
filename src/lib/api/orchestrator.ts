import { createApiInstance, unwrap } from "./client";

export const orchestratorClient = createApiInstance(
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
    "https://www.staging-api.elimi-ecosystem.e-limi.africa/v1/ol",
);

export interface OrchestratorFetchOptions {
  method: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export async function orchestratorFetch<T>(
  url: string,
  config: OrchestratorFetchOptions,
): Promise<T> {
  return unwrap<T>(
    orchestratorClient.request({
      url,
      method: config.method,
      data: config.data,
      params: config.params,
      headers: config.headers,
    }),
  );
}
