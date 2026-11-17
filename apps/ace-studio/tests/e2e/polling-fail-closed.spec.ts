/**
 * @module polling-fail-closed-e2e
 * @remarks Non-retryable task lookup failures must not create a retry storm.
 * @internal
 */
import { expect, test } from "@playwright/test";

for (const status of [404, 409]) {
  test(`non-retryable HTTP ${status} pauses job polling until explicit reconnect`, async ({ page }) => {
    const mock = "http://127.0.0.1:18081";
    await page.request.post(mock + "/__mock__/task_poll_failure?status=" + status);
    try {
      await page.goto("/");
      await page.getByRole("button", { name: "Connection" }).click();
      await page.getByLabel("API server address").fill(mock);
      await page.getByRole("button", { name: "Save & connect" }).click();
      await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

      await page.getByRole("button", { name: "Create", exact: true }).click();
      await page.getByLabel("Music description").fill("Poll policy " + status);
      await page.getByRole("button", { name: /Generate music/ }).click();
      await expect(page.getByText(new RegExp("\\(" + status + "\\)"))).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/Automatic checks are paused/)).toBeVisible();
      const count = async (): Promise<number> => {
        const response = await page.request.get(mock + "/__mock__/task_auth");
        return (await response.json()).data.rejectedTaskPolls as number;
      };
      expect(await count()).toBe(1);
      await page.getByRole("button", { name: "Check jobs now" }).click();
      await page.waitForTimeout(3500);
      expect(await count()).toBe(1);

      await page.request.post(mock + "/__mock__/task_poll_failure?status=0");
      await page.getByRole("button", { name: "Connection" }).click();
      await page.getByRole("button", { name: "Save & connect" }).click();
      await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
      await page.getByRole("button", { name: "Queue & results" }).click();
      await expect(page.getByText("succeeded", { exact: true }))
        .toBeVisible({ timeout: 15_000 });
    } finally {
      await page.request.post(mock + "/__mock__/task_poll_failure?status=0");
    }
  });
}
