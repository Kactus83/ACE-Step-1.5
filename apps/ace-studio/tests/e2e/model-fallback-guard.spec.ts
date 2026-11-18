/**
 * @module model-fallback-guard-e2e
 * @remarks Do not submit GPU work when the requested model is unloaded/incompatible.
 * @internal
 */
import { expect, test } from "@playwright/test";

const server = "http://127.0.0.1:18081";

async function countSubmissions(page: import("@playwright/test").Page): Promise<number> {
  const response = await page.request.get(server + "/__mock__/submission_count");
  return (await response.json()).data.count as number;
}

test("an available but unloaded model cannot silently fall back to the loaded primary", async ({ page }) => {
  const before = await countSubmissions(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(server);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Model", { exact: true }).selectOption("acestep-v15-base");
  await page.getByLabel("Music description").fill("Do not silently change the model");
  await expect(page.getByText(/model is available but not loaded/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Generate music/ })).toBeDisabled();
  expect(await countSubmissions(page)).toBe(before);

  await page.getByRole("button", { name: "Connection" }).click();
  await expect(page.getByRole("button", { name: "Review DiT load" })).toBeVisible();
});

test("changing from base to turbo never submits a stale unsupported Extract request", async ({ page }) => {
  const before = await countSubmissions(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(server);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Model", { exact: true }).selectOption("acestep-v15-base");
  await page.getByLabel("Creation mode").selectOption("extract");
  await page.getByLabel("Model", { exact: true }).selectOption("acestep-v15-turbo");
  await expect(page.getByText(/selected model does not advertise this mode/))
    .toBeVisible();
  await expect(page.getByRole("button", { name: /Generate music/ })).toBeDisabled();
  expect(await countSubmissions(page)).toBe(before);
});
