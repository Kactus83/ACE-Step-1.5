/**
 * @module localized-create-e2e
 * @remarks Live language change retains expert form values and local presets.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("switch language while editing advanced diffusion and DCW without losing values", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch interface to French" }).click();
  await expect(page.getByRole("heading", { name: "Créez quelque chose de nouveau." }))
    .toBeVisible();
  await page.locator("#prompt").fill("Percussions organiques et nappes analogiques");
  await page.getByText("Réglages avancés").click();
  await expect(page.getByRole("heading", { name: "Ordonnanceur de diffusion" })).toBeVisible();
  await page.getByLabel("Politique DCW").selectOption("on");
  await expect(page.getByText(/peut déformer fortement le résultat audio/)).toBeVisible();

  await page.getByRole("button", { name: "Passer l’interface en anglais" }).click();
  await expect(page.getByRole("heading", { name: "Create something new." })).toBeVisible();
  await expect(page.getByLabel("Music description")).toHaveValue(
    "Percussions organiques et nappes analogiques"
  );
  await expect(page.getByLabel("DCW policy")).toHaveValue("on");
  await expect(page.getByText("Diffusion scheduler")).toBeVisible();
});

test("save a local preset in French without persisting media or changing language", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch interface to French" }).click();
  await page.getByLabel("Nom du nouveau preset").fill("Réglage rythmique");
  await page.getByRole("button", { name: "Enregistrer les paramètres" }).click();
  await expect(page.getByText("Preset enregistré sur cet appareil.")).toBeVisible();
  await page.getByRole("button", { name: "Passer l’interface en anglais" }).click();
  await expect(page.getByRole("option", { name: "Réglage rythmique" })).toBeAttached();
  const stored = await page.evaluate(() => localStorage.getItem("ace-studio:presets:v1"));
  expect(stored).not.toContain("audio_code_string");
  expect(stored).not.toContain("apiKey");
});

