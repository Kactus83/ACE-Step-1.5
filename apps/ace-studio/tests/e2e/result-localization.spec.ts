/**
 * @module result-localization-e2e
 * @remarks Live locale switching preserves actual backend prompt and seed values.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("French audio result copy preserves prompt and server seed", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Music description").fill("Original unmodified prompt");
  await page.getByRole("button", { name: /Generate music/ }).click();
  await expect(page.getByText("succeeded", { exact: true })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Switch interface to French" }).click();
  await expect(page.getByRole("button", { name: "Charger l’aperçu audio" })).toBeVisible();
  await expect(page.getByText("Graine : 42")).toBeVisible();
  await page.getByText("Afficher les détails de génération").click();
  await expect(page.locator(".result-metadata").getByText("Original unmodified prompt"))
    .toBeVisible();
  await expect(page.getByText("Graine du serveur")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remixer" })).toBeVisible();

  await page.getByRole("button", { name: "Passer l’interface en anglais" }).click();
  await expect(page.getByRole("button", { name: "Load audio preview" })).toBeVisible();
  await expect(page.getByText("Server seed")).toBeVisible();
});
