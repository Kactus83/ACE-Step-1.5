/**
 * @module localized-workspaces-e2e
 * @remarks Live EN/FR switching across queue, A/B and existing local project metadata.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("queue and A/B comparison change languages without losing workspace state", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch interface to French" }).click();
  await page.getByRole("button", { name: "File et résultats", exact: true }).click();
  await expect(page.getByRole("heading", { name: "File et résultats." })).toBeVisible();
  await expect(page.getByLabel("État")).toBeVisible();
  await expect(page.getByLabel("Rechercher dans la file")).toBeVisible();
  await page.getByText("Comparer les morceaux A/B").click();
  await expect(page.getByRole("heading", { name: "Comparer deux variantes" })).toBeVisible();
  await expect(page.getByText(/Générez ou enregistrez au moins deux/)).toBeVisible();

  await page.getByRole("button", { name: "Passer l’interface en anglais" }).click();
  await expect(page.getByRole("heading", { name: "Queue & results." })).toBeVisible();
  await expect(page.getByLabel("Status")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Compare two variants" })).toBeVisible();
});

test("project created in French remains editable after a live switch to English", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch interface to French" }).click();
  await page.getByRole("button", { name: "Bibliothèque", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Organisez vos créations." })).toBeVisible();
  await expect(page.getByText(/pas les fichiers audio/)).toBeVisible();
  await page.getByLabel("Nouveau projet").fill("Projet bilingue");
  await page.getByRole("button", { name: "Créer un projet local" }).click();
  await expect(page.getByRole("heading", { name: "Projet bilingue" })).toBeVisible();
  await page.getByRole("button", { name: "Modifier les détails du projet" }).click();
  await page.getByLabel("Description").fill("Créé en français");
  await page.getByRole("button", { name: "Enregistrer les détails du projet" }).click();

  await page.getByRole("button", { name: "Passer l’interface en anglais" }).click();
  await expect(page.getByRole("heading", { name: "Organize your creations." })).toBeVisible();
  await expect(page.getByText("Créé en français")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit project details" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await expect(page.getByRole("button", { name: /Projet bilingue/ })).toBeVisible();
});

