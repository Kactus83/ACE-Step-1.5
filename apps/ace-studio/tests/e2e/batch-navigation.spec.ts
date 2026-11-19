/**
 * @module batch-navigation-e2e
 * @remarks Browser selection of real mocked batch variants without new GPU submissions.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("navigate multi-variant batch, preserve server seed and compare two outputs", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Music description").fill("Layered ambient drones");
  await page.getByLabel("Variations").fill("3");
  await page.getByRole("button", { name: /Generate music/ }).click();
  await expect(page.getByText("succeeded", { exact: true })).toBeVisible({
    timeout: 15_000
  });

  await expect(page.getByRole("navigation", { name: "Batch variant navigation" }))
    .toBeVisible();
  await expect(page.getByRole("button", { name: "Load audio preview" })).toHaveCount(3);
  await page.getByRole("button", { name: "Show variant 2" }).click();
  await expect(page.getByRole("button", { name: "Load audio preview" })).toHaveCount(1);
  await expect(page.getByText("Viewing variant 2 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Next variant" }).click();
  await expect(page.getByText("Viewing variant 3 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Next variant" }).click();
  await expect(page.getByText("Viewing variant 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Show all" }).click();
  await expect(page.getByRole("button", { name: "Load audio preview" })).toHaveCount(3);

  await page.getByText("Compare finished tracks A/B").click();
  await page.getByLabel("Track A").selectOption({ label: "Layered ambient drones · Variant 1" });
  await page.getByLabel("Track B").selectOption({ label: "Layered ambient drones · Variant 2" });
  await page.getByRole("button", { name: "Load comparison audio" }).click();
  await expect(page.getByRole("button", { name: "Listen A only" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Listen B only" })).toBeVisible();
  await expect(page.getByText(/not sample-synchronized/)).toBeVisible();
});
