/**
 * @module create-source-revision-e2e
 * @remarks Deferred source audio from server A must not submit a job to server B.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("backend switch during source fetch cannot submit the old source to the new backend",
  async ({ page }) => {
    const oldServer = "http://127.0.0.1:18081";
    const newServer = "http://127.0.0.1:18082";
    let release!: () => void;
    let started!: () => void;
    let submissionsToNewServer = 0;
    const held = new Promise<void>(resolve => { release = resolve; });
    const requested = new Promise<void>(resolve => { started = resolve; });

    await page.route(newServer + "/**", async route => {
      if (route.request().url().includes("/release_task")) {
        submissionsToNewServer++;
      }
      const original = route.request().url().replace(":18082/", ":18081/");
      const response = await route.fetch({ url: original });
      await route.fulfill({ response });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Connection" }).click();
    await page.getByLabel("API server address").fill(oldServer);
    await page.getByRole("button", { name: "Save & connect" }).click();
    await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.getByLabel("Music description").fill("Deferred source track");
    await page.getByRole("button", { name: /Generate music/ }).click();
    await expect(page.getByText("succeeded", { exact: true }))
      .toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Remix/ }).click();

    await page.route(oldServer + "/v1/audio**", async route => {
      started();
      await held;
      await route.continue();
    });
    try {
      await page.getByRole("button", { name: /Generate music/ }).click();
      await requested;
      await page.getByRole("button", { name: "Connection" }).click();
      await page.getByLabel("API server address").fill(newServer);
      await page.getByRole("button", { name: "Save & connect" }).click();
      await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
    } finally {
      release();
    }
    await page.waitForTimeout(700);
    expect(submissionsToNewServer).toBe(0);
  });
