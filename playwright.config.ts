import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Tests never reach real backends: the app is pointed at fake hosts and every
// request to them is answered by e2e/support/mockApi.ts.
export const MOCK_CAP_URL = "http://cap.e2e.test/v1/cap";
export const MOCK_ORCHESTRATOR_URL = "http://orchestrator.e2e.test/v1/ol";

export default defineConfig({
  testDir: "./e2e",
  // Locally the dev server compiles each page on first visit (can take ~50s for
  // large onboarding pages); CI runs against a production build, so it's fast.
  timeout: process.env.CI ? 60_000 : 120_000,
  expect: { timeout: process.env.CI ? 15_000 : 60_000 },
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
    command: process.env.CI
      ? `npx next start -p ${PORT}`
      : `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_CAP_URL: MOCK_CAP_URL,
      NEXT_PUBLIC_ORCHESTRATOR_URL: MOCK_ORCHESTRATOR_URL,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "e2e-google-client-id",
    },
  },
});
