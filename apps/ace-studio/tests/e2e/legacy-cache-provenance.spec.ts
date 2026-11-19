/**
 * @module legacy-cache-provenance-e2e
 * @remarks Angular must correctly interpret old backend cached multi-variant seed lists.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("old cache batch-wide seeds and top-level DiT provenance render per variant", async ({ page }) => {
  const server = "http://127.0.0.1:18081";
  const beforeResponse = await page.request.get(server + "/__mock__/submission_count");
  const before = (await beforeResponse.json()).data.count as number;

  await page.route(server + "/query_result", async route => {
    const response = await route.fetch();
    const payload = await response.json();
    if (!Array.isArray(payload.data)) {
      await route.fulfill({ response }); return;
    }
    const data = payload.data.map((task: { status: number; result: string }) => {
      if (task.status !== 1) return task;
      const results = JSON.parse(task.result) as Array<Record<string, unknown>>;
      if (results.length !== 2) return task;
      return { ...task, result: JSON.stringify(results.map(item => ({
        ...item,
        seed_value: "101,202",
        dit_model: "acestep-v15-base",
        metas: { bpm: 120 }
      }))) };
    });
    await route.fulfill({ response, json: { ...payload, data } });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(server);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("combobox", { name: "Model", exact: true })
    .selectOption("acestep-v15-turbo");
  await page.getByLabel("Music description").fill("Legacy seed and model provenance");
  await page.getByLabel("Variations").fill("2");
  await page.getByRole("button", { name: /Generate music/ }).click();
  await expect(page.getByText("succeeded", { exact: true })).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText("Seed: 101", { exact: true })).toBeVisible();
  await expect(page.getByText("Seed: 202", { exact: true })).toBeVisible();
  const mismatch = page.getByRole("alert").filter({
    hasText: "ACE-Step reports a different DiT model"
  });
  await expect(mismatch).toContainText("acestep-v15-base");

  const afterResponse = await page.request.get(server + "/__mock__/submission_count");
  expect((await afterResponse.json()).data.count).toBe(before + 1);
});
