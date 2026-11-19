/**
 * @module keyboard-shortcuts-e2e
 * @remarks Browser-controlled navigation and conservative editable-field behavior.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("keyboard navigation moves across app sections and exposes help", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Alt+3");
  await expect(page.getByRole("heading", { name: "Organize your creations." }))
    .toBeVisible();
  await page.getByRole("button", { name: "Shortcuts ?" }).click();
  await expect(page.getByRole("region", { name: "Keyboard shortcuts" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("region", { name: "Keyboard shortcuts" }))
    .not.toBeVisible();
});

test("Alt+digit does not navigate while the user is editing a form field", async ({ page }) => {
  await page.goto("/");
  const prompt = page.getByLabel("Music description");
  await prompt.focus();
  await page.keyboard.press("Alt+2");
  await expect(page.getByRole("heading", { name: "Create something new." }))
    .toBeVisible();
});

