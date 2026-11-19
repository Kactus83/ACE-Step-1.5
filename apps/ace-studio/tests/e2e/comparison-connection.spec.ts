/**
 * @module comparison-connection-e2e
 * @remarks Selected audio must not remain playable after API credential or origin changes.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("reconnecting invalidates previously loaded A/B audio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Music description").fill("A/B backend isolation");
  await page.getByLabel("Variations").fill("2");
  await page.getByRole("button", { name: /Generate music/ }).click();
  await expect(page.getByText("succeeded", { exact: true }))
    .toBeVisible({ timeout: 15_000 });

  await page.getByText("Compare finished tracks A/B").click();
  await page.getByLabel("Track A").selectOption({ label: "A/B backend isolation · Variant 1" });
  await page.getByLabel("Track B").selectOption({ label: "A/B backend isolation · Variant 2" });
  await page.getByRole("button", { name: "Load comparison audio" }).click();
  await expect(page.getByRole("button", { name: "Listen A only" })).toBeVisible();

  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://localhost:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await page.getByRole("button", { name: "Queue & results" }).click();
  await page.getByText("Compare finished tracks A/B").click();
  await expect(page.getByRole("button", { name: "Listen A only" })).toHaveCount(0);
});

