/**
 * @module reported-model-mismatch-e2e
 * @remarks A real server-provided DiT mismatch appears without retrying GPU work.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("a successful job warns when actual backend DiT differs from the requested one", async ({ page }) => {
  const server = "http://127.0.0.1:18081";
  const counter = async (): Promise<number> => {
    const response = await page.request.get(server + "/__mock__/submission_count");
    return (await response.json()).data.count as number;
  };
  const before = await counter();

  await page.route(server + "/query_result", async route => {
    const response = await route.fetch();
    const envelope = await response.json();
    if (!Array.isArray(envelope.data)) {
      await route.fulfill({ response }); return;
    }
    const updated = envelope.data.map((item: {
      task_id: string; status: number; result: string
    }) => {
      if (item.status !== 1) return item;
      const rows = JSON.parse(item.result) as Array<Record<string, unknown>>;
      return { ...item, result: JSON.stringify(rows.map(row => ({
        ...row, metas: { ...(row["metas"] as object || {}),
          dit_model: "acestep-v15-base" }
      }))) };
    });
    await route.fulfill({ response, json: { ...envelope, data: updated } });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(server);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Model", { exact: true }).selectOption("acestep-v15-turbo");
  await page.getByLabel("Music description").fill("Model provenance mismatch test");
  await page.getByRole("button", { name: /Generate music/ }).click();
  await expect(page.getByText("succeeded", { exact: true }))
    .toBeVisible({ timeout: 15_000 });
  const alert = page.getByRole("alert").filter({
    hasText: "ACE-Step reports a different DiT model"
  });
  await expect(alert).toContainText("acestep-v15-turbo");
  await expect(alert).toContainText("acestep-v15-base");
  expect(await counter()).toBe(before + 1);
});
