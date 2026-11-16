/**
 * @module analysis-e2e
 * @remarks Run all three verified non-audio job variants against disposable mock API.
 * @internal
 */
import { expect, test } from "@playwright/test";

async function connect(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection", exact: true }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Analyze" }).click();
}

test("audio code extraction queues a non-audio result and exports text", async ({ page }) => {
  await connect(page);
  await page.getByLabel("Source audio file").setInputFiles({
    name: "voice.wav", mimeType: "audio/wav", buffer: Buffer.from("RIFFfakeWAVE")
  });
  await page.getByRole("button", { name: "Submit analysis" }).click();
  await expect(page.getByRole("heading", { name: "Extracted semantic audio codes" }))
    .toBeVisible({ timeout: 15_000 });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download audio codes as TXT" }).click();
  expect((await download).suggestedFilename()).toMatch(/^ace-audio-codes-mock-\d+\.txt$/);
  await expect(page.getByText("Code file export requested.")).toBeVisible();
});

test("metadata-only job uses initialized LM and renders no fake audio", async ({ page }) => {
  await page.request.post("http://127.0.0.1:18081/v1/init", {
    data: { model: "acestep-v15-turbo", init_llm: true,
      lm_model_path: "acestep-5Hz-lm-0.6B" }
  });
  await connect(page);
  await page.getByLabel("Analysis operation")
    .selectOption("metadata");
  await page.getByLabel("Music description").fill("Desert percussion and brass");
  await page.getByRole("button", { name: "Submit analysis" }).click();
  await expect(page.getByRole("heading", { name: "Musical metadata analysis" }))
    .toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("87", { exact: true })).toBeVisible();
  await expect(page.locator("audio")).toHaveCount(0);
});

test("deep analysis includes backend-measured scalar fields", async ({ page }) => {
  await page.request.post("http://127.0.0.1:18081/v1/init", {
    data: { model: "acestep-v15-turbo", init_llm: true,
      lm_model_path: "acestep-5Hz-lm-0.6B" }
  });
  await connect(page);
  await page.getByLabel("Analysis operation").selectOption("deep");
  await page.getByLabel("Source audio file").setInputFiles({
    name: "ambient.wav", mimeType: "audio/wav", buffer: Buffer.from("RIFFfakeWAVE")
  });
  await page.getByRole("button", { name: "Submit analysis" }).click();
  await expect(page.getByRole("heading", { name: "Deep recording analysis" }))
    .toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("A minor", { exact: true })).toBeVisible();
  await expect(page.locator("audio")).toHaveCount(0);
});
