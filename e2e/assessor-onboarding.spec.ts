import { expect, test } from "@playwright/test";
import { mockApi, signIn } from "./support/mockApi";

const PDF = {
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n%e2e\n"),
};

test.describe("assessor information step", () => {
  test.beforeEach(async ({ context }) => {
    await signIn(context, { persona: "assessor" });
  });

  test("requires a QAA or IQM certificate — RPL and CV alone are not enough", async ({
    page,
  }) => {
    const api = await mockApi(page);
    let assetN = 0;
    api.on("POST", "/storage/upload", () => ({
      assetId: `asset-${++assetN}`,
      url: "http://orchestrator.e2e.test/files/x.pdf",
      provider: "e2e",
      type: "document",
    }));

    await page.goto("/onboarding/assessor/assessor-info");
    await page.getByPlaceholder("First name").fill("ASR-001");

    await uploadInto(page, "RPL Assessor Certificate", "rpl.pdf");
    await uploadInto(page, "CV / Resume", "cv.pdf");
    await page.getByRole("button", { name: "Verify Identity" }).click();

    await expect(
      page.getByText("Please upload at least one qualification certificate (QAA or IQM)", {
        exact: true,
      }),
    ).toBeVisible();
    expect(api.calls.some((c) => c.path === "/onboarding/assessor/save")).toBe(false);
  });

  test("saves QAA, RPL and CV in the shape the backend expects", async ({ page }) => {
    const api = await mockApi(page);
    const assetIds: Record<string, string> = {
      "qaa.pdf": "asset-qaa",
      "rpl.pdf": "asset-rpl",
      "cv.pdf": "asset-cv",
    };
    api.on("POST", "/storage/upload", (req) => {
      const name = Object.keys(assetIds).find((n) => req.postData()?.includes(n));
      return {
        assetId: name ? assetIds[name] : "asset-unknown",
        url: "http://orchestrator.e2e.test/files/x.pdf",
        provider: "e2e",
        type: "document",
      };
    });
    api.on("PATCH", "/onboarding/assessor/save", () => ({
      onboardingId: "onb-1",
      persona: "assessor",
      status: "draft",
      createdAt: "2026-09-01T00:00:00.000Z",
    }));

    await page.goto("/onboarding/assessor/assessor-info");
    await page.getByPlaceholder("First name").fill("ASR-001");
    await uploadInto(page, "QAA Certificate", "qaa.pdf");
    await uploadInto(page, "RPL Assessor Certificate", "rpl.pdf");
    await uploadInto(page, "CV / Resume", "cv.pdf");
    await page.getByRole("button", { name: "Verify Identity" }).click();

    await expect(page).toHaveURL(/\/onboarding\/assessor\/verify-identity$/);

    const save = api.calls.find(
      (c) => c.method === "PATCH" && c.path === "/onboarding/assessor/save",
    );
    expect(save?.body).toEqual({
      assessorDetails: {
        assessorNo: "ASR-001",
        resumeAssetId: "asset-cv",
        certifications: {
          qaa: { certificateAssetId: "asset-qaa" },
          rpl: { certificateAssetId: "asset-rpl" },
        },
      },
    });
  });
});

async function uploadInto(
  page: import("@playwright/test").Page,
  fieldLabel: string,
  fileName: string,
) {
  const escaped = fieldLabel.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const field = page
    .locator("div.mb-5")
    .filter({ has: page.locator("label", { hasText: new RegExp(`^${escaped}`) }) });
  await field.locator('input[type="file"]').setInputFiles({ name: fileName, ...PDF });
  await expect(field.getByText(fileName)).toBeVisible();
}
