/**
 * @module training-export-e2e
 * @remarks Explicit user consent and existing /v1/training/export request contract.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("requires explicit acknowledgement and refuses legacy destructive fallback", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await page.getByRole("button", { name: "Training", exact: true }).click();
  await page.getByLabel("Training output directory on backend")
    .fill("/mock/training/lora_output");
  await page.getByLabel("New export destination directory")
    .fill("/mock/exports/adapter-01");
  await page.getByLabel("Type EXPORT to confirm the new-directory copy").fill("EXPORT");
  await page.getByRole("button", { name: "Review adapter export" }).click();
  await expect(page.getByRole("button", { name: "Confirm safe adapter export" }))
    .toBeVisible();
  await page.getByRole("button", { name: "Confirm safe adapter export" }).click();
  await expect(page.getByText("Mock adapter exported without overwrite")).toBeVisible();

  const response = await page.request.get("http://127.0.0.1:18081/__mock__/last_export");
  const body = await response.json();
  expect(body.data).toEqual({
    lora_output_dir: "/mock/training/lora_output",
    export_path: "/mock/exports/adapter-01"
  });
});


