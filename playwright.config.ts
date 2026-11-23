import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Tests never reach real backends: the app is pointed at fake hosts and every
// request to them is answered by e2e/support/mockApi.ts.
export const MOCK_CAP_URL = "http://cap.e2e.test/v1/cap";
export const MOCK_ORCHESTRATOR_URL = "http://orchestrator.e2e.test/v1/ol";

// Run against a production build both locally and in CI so tests never hit
// slow cold-route dev compilations. Set E2E_SKIP_BUILD=1 to reuse the last
// e2e build when iterating on test files only.
const skipBuild = Boolean(process.env.CI || process.env.E2E_SKIP_BUILD);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: skipBuild
      ? `npx next start -p ${PORT}`
      : `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 360_000,
    env: {
      NEXT_PUBLIC_CAP_URL: MOCK_CAP_URL,
      NEXT_PUBLIC_ORCHESTRATOR_URL: MOCK_ORCHESTRATOR_URL,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "e2e-google-client-id",
    },
  },
});
