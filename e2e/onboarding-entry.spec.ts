import { expect, test } from "@playwright/test";
import { mockApi, signIn, TEST_USER } from "./support/mockApi";

// Guards the start of onboarding: new users must see Welcome and pick a role
// before any persona-specific form. (Regressed once in c874fcd, which sent
// verified users straight to the candidate form.)

test("verifying email lands on Welcome, then Role Selection", async ({ page }) => {
  const api = await mockApi(page);
  api.on("POST", "/auth/verify-account", () => ({
    accessToken: "e2e-access-token",
    refreshToken: "e2e-refresh-token",
    user: TEST_USER,
  }));

  await page.goto(`/verify?email=${encodeURIComponent(TEST_USER.email)}`);
  const digits = page.locator('input[inputmode="numeric"]');
  await expect(digits).toHaveCount(4);
  for (let i = 0; i < 4; i++) await digits.nth(i).fill(String(i + 1));
  await page.getByRole("button", { name: "Verify Email" }).click();

  await expect(page).toHaveURL(/\/onboarding\/welcome$/);
  await expect(page.getByRole("heading", { name: "Welcome to ELIMI" })).toBeVisible();

  // No role may be chosen for the user during verification.
  expect(await page.evaluate(() => localStorage.getItem("elimi_persona"))).toBeFalsy();

  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/onboarding\/role-selection$/);
  await expect(page.getByRole("heading", { name: "Select Your Role" })).toBeVisible();
});

const ROLES = [
  {
    card: "Candidate/Learner",
    persona: "candidate",
    url: /\/onboarding\/personal-info$/,
    heading: "Personal Information",
  },
  {
    card: "Quality Assurance",
    persona: "assessor",
    url: /\/onboarding\/assessor\/personal-info$/,
    heading: "Personal Information",
  },
  {
    card: "Assessment Centre",
    persona: "centre",
    url: /\/onboarding\/assessment-centre\/center-info$/,
    heading: "Center Information",
  },
];

for (const role of ROLES) {
  test(`choosing "${role.card}" starts ${role.persona} onboarding`, async ({
    page,
    context,
  }) => {
    await signIn(context);
    const api = await mockApi(page);
    api.on("POST", "/onboarding/start", () => ({
      onboardingId: "onb-1",
      persona: role.persona,
      status: "draft",
      createdAt: "2026-09-01T00:00:00.000Z",
    }));

    await page.goto("/onboarding/role-selection");
    await page.getByRole("button", { name: new RegExp(role.card) }).click();

    await expect(page).toHaveURL(role.url);
    await expect(page.getByRole("heading", { name: role.heading })).toBeVisible();

    const start = api.calls.find(
      (c) => c.method === "POST" && c.path === "/onboarding/start",
    );
    expect(start?.body).toEqual({ persona: role.persona });
  });
}

test("a signed-in user with no role is sent to Welcome, not a persona form", async ({
  page,
  context,
}) => {
  await signIn(context);
  await mockApi(page);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/onboarding\/welcome$/);
  await expect(page.getByRole("heading", { name: "Welcome to ELIMI" })).toBeVisible();
});
