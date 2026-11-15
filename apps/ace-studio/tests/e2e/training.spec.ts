/** @module training-e2e @remarks Explicit LoRA mock flow, without model/GPU execution. */
import { test, expect } from "@playwright/test";

test("validate tensors and explicitly confirm LoRA training", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Training" }).click();
  await expect(page.getByText("Idle", { exact: true })).toBeVisible();
  await page.getByLabel("Preprocessed tensor directory").fill("/mock/tensors");
  await page.getByRole("button", { name: "Validate tensors" }).click();
  await expect(page.getByText(/3 preprocessed tensors/)).toBeVisible();
  await page.getByRole("button", { name: "Review training impact" }).click();
  await expect(page.getByRole("button", { name: "Confirm start LORA training" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm start LORA training" }).click();
  await expect(page.getByText("Training started")).toBeVisible();
  await expect(page.getByRole("button", { name: "Request training stop" })).toBeVisible();
  await page.getByRole("button", { name: "Request training stop" }).click();
  await page.getByRole("button", { name: "Confirm graceful stop" }).click();
  await expect(page.getByText("Stopping training...")).toBeVisible();
});
