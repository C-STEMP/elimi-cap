import { createApiInstance, unwrap } from "./client";

const capClient = createApiInstance(
  process.env.NEXT_PUBLIC_CAP_URL ||
    "https://www.staging-api.elimi-ecosystem.e-limi.africa/v1/cap",
);

export async function capFetch<T>(
  url: string,
  config: { method: string; data?: unknown }
): Promise<T> {
  return unwrap<T>(
    capClient.request({
      url,
      method: config.method,
      data: config.data,
    })
  );
}
