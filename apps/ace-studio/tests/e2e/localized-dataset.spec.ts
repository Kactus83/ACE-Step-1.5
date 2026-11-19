/**
 * @module localized-dataset-e2e
 * @remarks French dataset curation retains two-step shared-dataset mutation controls.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("French dataset scan and sample update use confirmed server-global operations", async ({ page }) => {
  const endpoint = "http://127.0.0.1:18081";
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(endpoint);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await page.getByRole("button", { name: "Switch interface to French" }).click();
  await page.getByRole("button", { name: "Jeux de données" }).click();

  await expect(page.getByRole("heading", { name: "Préparez votre jeu de données." }))
    .toBeVisible();
  await expect(page.getByText(/jeu de données actif est partagé/)).toBeVisible();
  await page.getByLabel("Répertoire audio sur le serveur").fill("/mock/audio");
  await page.getByRole("button", { name: "Examiner l’analyse / le remplacement" }).click();
  await expect(page.getByRole("button", { name: "Confirmer l’analyse et le remplacement" }))
    .toBeVisible();
  await page.getByRole("button", { name: "Confirmer l’analyse et le remplacement" }).click();
  await expect(page.getByText(/0 \/ 3 échantillons étiquetés par le serveur/)).toBeVisible();

  await page.getByRole("button", { name: /1\. mock-0\.wav/ }).click();
  await page.getByLabel("Description musicale").fill("Grain acoustique et percussions");
  await page.getByRole("button", { name: "Enregistrer les métadonnées" }).click();
  await expect(page.getByText(/1 \/ 3 échantillons étiquetés par le serveur/)).toBeVisible();
  await page.getByRole("button", { name: "Passer l’interface en anglais" }).click();
  await expect(page.getByRole("heading", { name: "Prepare your dataset." })).toBeVisible();
  await page.getByRole("button", { name: /1\. mock-0\.wav/ }).click();
  await expect(page.getByLabel("Caption / musical description"))
    .toHaveValue("Grain acoustique et percussions");
});

