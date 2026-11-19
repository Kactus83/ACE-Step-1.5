/**
 * @module job-model-filter-e2e
 * @remarks Client filters use submitted model identity and do not trigger GPU work.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("filter session jobs by model and switch between chronological orders", async ({ page }) => {
  const server = "http://127.0.0.1:18081";
  // This scenario represents a backend with both DiT models already loaded.
  // It must not rely on the real server's unsafe silent fallback to primary.
  await page.route(server + "/v1/model_inventory", async route => {
    const response = await route.fetch();
    const envelope = await response.json();
    const inventory = envelope.data;
    await route.fulfill({
      response, json: { ...envelope, data: {
        ...inventory, models: inventory.models.map((entry: { name: string }) =>
          entry.name === "acestep-v15-base" ? { ...entry, is_loaded: true } : entry)
      } }
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(server);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("combobox", { name: "Model", exact: true })
    .selectOption("acestep-v15-turbo");
  await page.getByLabel("Music description").fill("Turbo model session");
  await page.getByRole("button", { name: /Generate music/ }).click();
  await expect(page.getByRole("heading", { name: "Turbo model session" })).toBeVisible();
  await expect(page.getByText("succeeded", { exact: true })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("combobox", { name: "Model", exact: true })
    .selectOption("acestep-v15-base");
  await page.getByLabel("Music description").fill("Base model session");
  await page.getByRole("button", { name: /Generate music/ }).click();
  await expect(page.getByRole("heading", { name: "Base model session" })).toBeVisible();
  await expect(page.getByText("succeeded", { exact: true })).toHaveCount(2, { timeout: 15_000 });

  const model = page.getByLabel("Model filter");
  await model.selectOption("acestep-v15-base");
  await expect(page.getByRole("heading", { name: "Base model session" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Turbo model session" })).toHaveCount(0);
  await model.selectOption("acestep-v15-turbo");
  await expect(page.getByRole("heading", { name: "Turbo model session" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Base model session" })).toHaveCount(0);

  await model.selectOption("");
  await page.getByLabel("Sort jobs").selectOption("oldest");
  await expect(page.locator(".job-card .job-heading h2")).toHaveText([
    "Turbo model session", "Base model session"
  ]);
  await page.getByLabel("Sort jobs").selectOption("newest");
  await expect(page.locator(".job-card .job-heading h2")).toHaveText([
    "Base model session", "Turbo model session"
  ]);
});
