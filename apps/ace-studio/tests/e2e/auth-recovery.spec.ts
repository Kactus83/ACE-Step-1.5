/**
 * @module auth-recovery-e2e
 * @remarks 401/403 must suspend periodic job polling until user reconnects.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("an authorization failure suspends automatic polling and a reconnect resumes it", async ({ page }) => {
  const mock = "http://127.0.0.1:18081";
  await page.request.post(mock + "/__mock__/task_auth?reject=1");
  try {
    await page.goto("/");
    await page.getByRole("button", { name: "Connection" }).click();
    await page.getByLabel("API server address").fill(mock);
    await page.getByRole("button", { name: "Save & connect" }).click();
    await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.getByLabel("Music description").fill("Authorization diagnostic");
    await page.getByRole("button", { name: /Generate music/ }).click();
    await expect(page.getByText(/API token \(401\)/)).toBeVisible({ timeout: 15_000 });
    const first = (await (await page.request.get(mock + "/__mock__/task_auth")).json()).data;
    expect(first.rejectedTaskPolls).toBe(1);

    await page.waitForTimeout(3500);
    const later = (await (await page.request.get(mock + "/__mock__/task_auth")).json()).data;
    expect(later.rejectedTaskPolls).toBe(1);

    await page.request.post(mock + "/__mock__/task_auth?reject=0");
    await page.getByRole("button", { name: "Connection" }).click();
    await page.getByRole("button", { name: "Save & connect" }).click();
    await page.getByRole("button", { name: "Queue & results" }).click();
    await expect(page.getByText("succeeded", { exact: true })).toBeVisible({ timeout: 15_000 });
  } finally {
    await page.request.post(mock + "/__mock__/task_auth?reject=0");
  }
});
