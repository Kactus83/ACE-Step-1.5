/**
 * @module analysis-codes-reuse-e2e
 * @remarks End-to-end transfer from real analysis result to code-controlled generation.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("does not start a new task when semantic codes are staged in Create", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection", exact: true }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Analyze" }).click();
  await page.getByLabel("Source audio file").setInputFiles({
    name: "voice.wav", mimeType: "audio/wav", buffer: Buffer.from("RIFFfakeWAVE")
  });
  await page.getByRole("button", { name: "Submit analysis" }).click();
  await expect(page.getByRole("heading", { name: "Extracted semantic audio codes" }))
    .toBeVisible({ timeout: 15_000 });

  const beforeResponse = await page.request.get("http://127.0.0.1:18081/__mock__/last_submission");
  const before = (await beforeResponse.json()).data;
  await page.getByRole("button", { name: "Use semantic codes in Create" }).click();
  await expect(page.getByRole("heading", { name: "Create something new." })).toBeVisible();
  const advanced = page.getByText("Advanced controls", { exact: false });
  await advanced.click();
  const codes = page.getByLabel("Semantic audio codes");
  await expect(codes).toHaveValue("<|audio_semantic|>FAKE_CODES_FOR_TEST_ONLY");

  const afterStagingResponse = await page.request.get("http://127.0.0.1:18081/__mock__/last_submission");
  expect((await afterStagingResponse.json()).data).toEqual(before);

  await page.getByLabel("Music description").fill("Use analyzed semantic structure");
  await page.getByRole("button", { name: "Generate music" }).click();
  await expect(page.getByRole("heading", { name: "Queue & results." })).toBeVisible();

  const afterSubmitResponse = await page.request.get("http://127.0.0.1:18081/__mock__/last_submission");
  const submitted = (await afterSubmitResponse.json()).data;
  expect(submitted.audio_code_string).toBe("<|audio_semantic|>FAKE_CODES_FOR_TEST_ONLY");
  expect(submitted.thinking).toBe(false);
});

test("applying a saved preset clears previously entered audio codes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Music description").fill("Pulsing techno");
  await page.getByLabel("New preset name").fill("Without codes");
  await page.getByRole("button", { name: "Save settings" }).click();

  await page.getByText("Advanced controls", { exact: false }).click();
  const codes = page.getByLabel("Semantic audio codes");
  await codes.fill("USER_PRIVATE_CODES");
  await page.getByRole("button", { name: "Load preset" }).click();
  await expect(codes).toHaveValue("");
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain("USER_PRIVATE_CODES");
});

