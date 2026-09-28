import type { BrowserContext, Page, Request, Route } from "@playwright/test";

const MOCK_HOSTS = /^http:\/\/(cap|orchestrator)\.e2e\.test\//;

export type MockHandler = (
  request: Request,
) => { status?: number; body: unknown } | unknown;

export interface ApiMock {
  /** Register a handler for `METHOD /path` (path relative to the service base, e.g. "/onboarding/mine"). */
  on(method: string, path: string, handler: MockHandler): void;
  /** Every request the app made to a mocked backend, in order. */
  calls: { method: string; path: string; body: unknown }[];
}

function toPath(url: string): string {
  return new URL(url)
    .pathname.replace(/^\/v1\/(cap|ol)/, "")
    .replace(/\/$/, "");
}

function parseBody(request: Request): unknown {
  const raw = request.postData();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/**
 * Intercepts all calls to the fake CAP / Orchestrator hosts. Unregistered
 * endpoints answer `{ success: true, data: null }` so pages that fire extra
 * background requests don't crash; register explicit handlers for anything a
 * test depends on.
 */
export async function mockApi(page: Page): Promise<ApiMock> {
  const handlers = new Map<string, MockHandler>();
  const calls: ApiMock["calls"] = [];

  // Sensible defaults for a signed-in user who hasn't onboarded yet.
  handlers.set("GET /onboarding/mine", () => ({ onboardings: [] }));
  handlers.set("GET /me", () => ({ identityVerified: false, centres: [] }));
  handlers.set("GET /me/profile", () => ({ identityVerified: false }));

  await page.route(MOCK_HOSTS, async (route: Route) => {
    const request = route.request();
    const method = request.method();
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders() });
      return;
    }

    const path = toPath(request.url());
    calls.push({ method, path, body: parseBody(request) });

    const handler = handlers.get(`${method} ${path}`);
    const result = handler ? handler(request) : null;
    const { status, body } =
      result && typeof result === "object" && "body" in result
        ? (result as { status?: number; body: unknown })
        : { status: 200, body: { success: true, data: result } };

    await route.fulfill({
      status: status ?? 200,
      contentType: "application/json",
      headers: corsHeaders(),
      body: JSON.stringify(body),
    });
  });

  return {
    on(method, path, handler) {
      handlers.set(`${method.toUpperCase()} ${path}`, handler);
    },
    calls,
  };
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  };
}

export const TEST_USER = {
  userId: "user-e2e-1",
  email: "new.user@e2e.test",
  status: "active" as const,
  intents: [],
  createdAt: "2026-09-01T00:00:00.000Z",
};

/**
 * Starts the browser already signed in, the same way the app stores a session
 * (localStorage + cookies read by middleware.ts).
 */
export async function signIn(
  context: BrowserContext,
  opts: { onboarded?: boolean; persona?: string } = {},
): Promise<void> {
  const { onboarded = false, persona = "" } = opts;
  const cookies = [
    { name: "elimi_access_token", value: "e2e-access-token" },
    { name: "elimi_refresh_token", value: "e2e-refresh-token" },
    { name: "elimi_onboarded", value: String(onboarded) },
    ...(persona && onboarded ? [{ name: "elimi_persona", value: persona }] : []),
  ];
  await context.addCookies(
    cookies.map((c) => ({ ...c, domain: "localhost", path: "/" })),
  );
  await context.addInitScript(
    ({ user, onboarded, persona }) => {
      // Only seed once so the app's own writes during the test aren't reset on navigation.
      if (localStorage.getItem("elimi_e2e_seeded")) return;
      localStorage.setItem("elimi_e2e_seeded", "1");
      localStorage.setItem("elimi_access_token", "e2e-access-token");
      localStorage.setItem("elimi_refresh_token", "e2e-refresh-token");
      localStorage.setItem("elimi_user", JSON.stringify(user));
      localStorage.setItem("elimi_onboarded", String(onboarded));
      if (persona) localStorage.setItem("elimi_persona", persona);
    },
    { user: TEST_USER, onboarded, persona },
  );
}
