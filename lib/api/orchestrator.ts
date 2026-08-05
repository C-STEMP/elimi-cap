import { createApiInstance, unwrap } from "./client";

const orchestratorClient = createApiInstance(
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || ""
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
