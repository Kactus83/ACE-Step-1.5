/**
 * @module dataset-server-switch-e2e
 * @remarks A delayed sample preflight cannot send PUT to a different backend.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("switching backend during dataset preflight cannot write to the new server", async ({ page }) => {
  const source = "http://127.0.0.1:18081";
  const destination = "http://127.0.0.1:18082";
  let destinationWrites = 0;
  let preflightStarted!: () => void;
  let releasePreflight!: () => void;
  const started = new Promise<void>(resolve => { preflightStarted = resolve; });
  const released = new Promise<void>(resolve => { releasePreflight = resolve; });

  await page.route(destination + "/**", async route => {
    if (route.request().method() === "PUT") destinationWrites++;
    const redirected = route.request().url().replace(":18082/", ":18081/");
    const response = await route.fetch({ url: redirected });
    await route.fulfill({ response });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(source);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

  await page.getByRole("button", { name: "Datasets" }).click();
  await page.getByLabel("Backend audio directory").fill("/mock/audio");
  await page.getByRole("button", { name: "Review scan / replace" }).click();
  await page.getByRole("button", { name: "Confirm scan and replace" }).click();
  await expect(page.getByText(/0 \/ 3 samples labeled/)).toBeVisible();
  await page.getByRole("button", { name: /1\. mock-0\.wav/ }).click();
  await page.getByLabel("Caption / musical description").fill("Must not reach server B");

  await page.route(source + "/v1/dataset/samples", async route => {
    preflightStarted();
    await released;
    await route.continue();
  });
  try {
    await page.getByRole("button", { name: "Save sample metadata" }).click();
    await started;
    await page.getByRole("button", { name: "Connection" }).click();
    await page.getByLabel("API server address").fill(destination);
    await page.getByRole("button", { name: "Save & connect" }).click();
    await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  } finally {
    releasePreflight();
  }
  await page.waitForTimeout(600);
  expect(destinationWrites).toBe(0);

  const response = await page.request.get(source + "/v1/dataset/samples");
  const overview = (await response.json()).data;
  expect(overview.samples[0].caption).not.toBe("Must not reach server B");
});
