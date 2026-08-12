import { createApiInstance, unwrap } from "./client";

const orchestratorClient = createApiInstance(
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
    "https://www.staging-api.elimi-ecosystem.e-limi.africa/v1/ol",
);

export async function orchestratorFetch<T>(
  url: string,
  config: { method: string; data?: unknown }
): Promise<T> {
  return unwrap<T>(
    orchestratorClient.request({
      url,
      method: config.method,
      data: config.data,
    })
  );
}
