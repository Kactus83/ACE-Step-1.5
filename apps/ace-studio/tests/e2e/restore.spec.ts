/**
 * @module creation-restore-e2e
 * @remarks Settings retrieval is an editor operation, never a second GPU submission.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("use actual variant seed to restore settings without another queued task", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Music description").fill("Low-band analog synth textures");
  await page.getByRole("button", { name: "Generate music" }).click();
  await expect(page.getByText("succeeded", { exact: true })).toBeVisible({ timeout: 15_000 });
  const before = await page.request.get("http://127.0.0.1:18081/__mock__/last_submission");
  const submitted = await before.json();

  await page.getByRole("button", { name: /Use settings.*seed/ }).click();
  await expect(page.getByLabel("Music description")).toHaveValue("Low-band analog synth textures");
  await page.getByText("Advanced controls", { exact: false }).click();
  await expect(page.getByLabel("Seed")).toHaveValue("42");
  await expect(page.getByLabel("Random seed")).not.toBeChecked();

  const after = await page.request.get("http://127.0.0.1:18081/__mock__/last_submission");
  expect((await after.json()).data).toEqual(submitted.data);
});

