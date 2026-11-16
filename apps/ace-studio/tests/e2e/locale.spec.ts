/**
 * @module locale-e2e
 * @remarks EN/FR preference survives reload without touching backend settings.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("switching language localizes navigation and analysis without changing task state", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Switch interface to French" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("button", { name: "Créer", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Analyser", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Comprendre un enregistrement." }))
    .toBeVisible();
  await expect(page.getByLabel("Opération d’analyse")).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.getByRole("button", { name: "Passer l’interface en anglais" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "Analyze", exact: true })).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem("ace-studio:locale:v1"));
  expect(stored).toBe("en");
});
