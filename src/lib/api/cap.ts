import { createApiInstance, unwrap } from "./client";

export const capClient = createApiInstance(
  process.env.NEXT_PUBLIC_CAP_URL ||
    "https://www.staging-api.elimi-ecosystem.e-limi.africa/v1/cap",
  { isCap: true },
);

export interface CapFetchOptions {
  method: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export async function capFetch<T>(
  url: string,
  config: CapFetchOptions,
): Promise<T> {
  return unwrap<T>(
    capClient.request({
      url,
      method: config.method,
      data: config.data,
      params: config.params,
      headers: config.headers,
    }),
  );
}
