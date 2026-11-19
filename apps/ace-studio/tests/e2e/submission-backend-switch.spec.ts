/**
 * @module submission-backend-switch-e2e
 * @remarks Stale submission responses cannot block or corrupt another backend session.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("old backend acceptance cannot unlock or register the new backend submission", async ({ page }) => {
  const first = "http://127.0.0.1:18081";
  const second = "http://127.0.0.1:18082";
  let startA!: () => void, startB!: () => void;
  let releaseA!: () => void, releaseB!: () => void;
  let deliveredA!: () => void;
  const aStarted = new Promise<void>(resolve => { startA = resolve; });
  const bStarted = new Promise<void>(resolve => { startB = resolve; });
  const aGate = new Promise<void>(resolve => { releaseA = resolve; });
  const bGate = new Promise<void>(resolve => { releaseB = resolve; });
  const aDelivered = new Promise<void>(resolve => { deliveredA = resolve; });

  await page.route(first + "/release_task", async route => {
    startA();
    await aGate;
    const response = await route.fetch();
    await route.fulfill({ response });
    deliveredA();
  });
  await page.route(second + "/**", async route => {
    const submission = new URL(route.request().url()).pathname === "/release_task";
    if (submission) { startB(); await bGate; }
    const response = await route.fetch({
      url: route.request().url().replace(":18082/", ":18081/")
    });
    await route.fulfill({ response });
  });

  const response = await page.request.get(first + "/__mock__/submission_count");
  const baseline = (await response.json()).data.count as number;
  try {
    await page.goto("/");
    await page.getByRole("button", { name: "Connection" }).click();
    await page.getByLabel("API server address").fill(first);
    await page.getByRole("button", { name: "Save & connect" }).click();
    await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.getByLabel("Music description").fill("Old backend pending request");
    await page.getByRole("button", { name: /Generate music/ }).click();
    await aStarted;

    await page.getByRole("button", { name: "Connection" }).click();
    await page.getByLabel("API server address").fill(second);
    await page.getByRole("button", { name: "Save & connect" }).click();
    await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.getByLabel("Music description").fill("New backend pending request");
    const generate = page.getByRole("button", { name: /Generate music/ });
    await expect(generate).toBeEnabled();
    await generate.click();
    await bStarted;

    releaseA();
    await aDelivered;
    // Old call finally cannot clear the busy flag of the new in-flight call.
    await expect(page.getByRole("button", { name: /Submitting/ })).toBeDisabled();

    releaseB();
    await expect(page.getByRole("heading", { name: "New backend pending request" }))
      .toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Old backend pending request" }))
      .toHaveCount(0);
    const after = await page.request.get(first + "/__mock__/submission_count");
    expect((await after.json()).data.count).toBe(baseline + 2);
  } finally {
    releaseA();
    releaseB();
  }
});
