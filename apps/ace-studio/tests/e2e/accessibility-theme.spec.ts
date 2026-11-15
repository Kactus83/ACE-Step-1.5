/**
 * @module accessibility-theme-e2e
 * @remarks Browser checks for appearance persistence, keyboard route and landmarks.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("theme selection persists without changing backend configuration", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator("html").getAttribute("data-theme");
  expect(["dark", "light"]).toContain(before);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("first keyboard action reaches the skip link and the application landmark", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to workspace" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
});

test("small viewport preserves navigation and create submission affordance", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Create", exact: true })).toBeVisible();
  await expect(page.getByLabel("Music description")).toBeVisible();
  const rootWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(rootWidth).toBeLessThanOrEqual(377);
});

