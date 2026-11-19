/**
 * @module connection-locale-e2e
 * @remarks Live language switching preserves explicit model loading confirmations.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("French connection remains explicit and model initialization requires review", async ({ page }) => {
  const server = "http://127.0.0.1:18081";
  await page.goto("/");
  await page.getByRole("button", { name: "Switch interface to French" }).click();
  await page.getByRole("button", { name: "Connexion", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Restez connecté." })).toBeVisible();
  await expect(page.getByLabel("Adresse du serveur API")).toBeVisible();
  await expect(page.getByLabel("Jeton API facultatif")).toBeVisible();
  await expect(page.getByText(/Le jeton est conservé uniquement en mémoire/))
    .toBeVisible();

  await page.getByLabel("Adresse du serveur API").fill(server);
  await page.getByRole("button", { name: "Enregistrer et connecter" }).click();
  await expect(page.getByText("Connecté à l’API ACE-Step.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Modèles DiT disponibles" }))
    .toBeVisible();
  await page.getByLabel("Modèles de langage disponibles")
    .selectOption("acestep-5Hz-lm-0.6B");

  const before = (await (await page.request.get(server + "/__mock__/last_model_init")).json()).data;
  await page.getByRole("button", { name: "Examiner l’initialisation DiT + LM" }).click();
  await expect(page.getByText(/réinitialisation du DiT.*mémoire GPU/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirmer l’initialisation DiT + LM" }))
    .toBeVisible();
  const after = (await (await page.request.get(server + "/__mock__/last_model_init")).json()).data;
  expect(after).toEqual(before);

  await page.getByRole("button", { name: "Passer l’interface en anglais" }).click();
  await expect(page.getByLabel("API server address")).toHaveValue(server);
  await expect(page.getByRole("heading", { name: "Available DiT models" })).toBeVisible();
});

