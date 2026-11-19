/**
 * @module dataset-e2e
 * @remarks Browser-to-mock workflows; no GPU or real filesystem is touched.
 * @internal
 */
import { test, expect } from "@playwright/test";

test("scan, edit, label and preprocess a backend-owned dataset", async ({ page }) => {
  await page.request.post("http://127.0.0.1:18081/v1/init", {
    data: { init_llm: true, lm_model_path: "acestep-5Hz-lm-0.6B" }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Datasets" }).click();
  await page.getByLabel("Backend audio directory").fill("/mock/audio");
  await page.getByRole("button", { name: "Review scan / replace" }).click();
  await page.getByRole("button", { name: "Confirm scan and replace" }).click();
  await expect(page.getByText(/0 \/ 3 samples labeled/)).toBeVisible();
  await page.getByRole("button", { name: /1\. mock-0\.wav/ }).click();
  await page.getByLabel("Caption / musical description").fill("Organic glitch texture");
  await page.getByRole("button", { name: "Save sample metadata" }).click();
  await expect(page.getByText(/1 \/ 3 samples labeled/)).toBeVisible();
  await page.getByRole("button", { name: "Review automatic labeling" }).click();
  await page.getByRole("button", { name: "Confirm GPU labeling" }).click();
  await expect(page.getByText("Labeling: completed")).toBeVisible({ timeout: 15_000 });
  await page.getByText("Preprocess labeled audio into tensors", { exact: true }).click();
  await page.getByLabel("Output directory on the backend").fill("/mock/tensors");
  await page.getByRole("button", { name: "Review preprocessing" }).click();
  await page.getByRole("button", { name: "Confirm tensor preprocessing" }).click();
  await expect(page.getByText("Preprocessing: completed")).toBeVisible({ timeout: 15_000 });
});

test("requires an active dataset before starting preprocessing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Datasets" }).click();
  await page.getByText("Preprocess labeled audio into tensors", { exact: true }).click();
  await page.getByLabel("Output directory on the backend").fill("/mock/nowhere");
  await page.getByRole("button", { name: "Review preprocessing" }).click();
  await expect(page.getByText("At least one labeled dataset sample is required.")).toBeVisible();
});


