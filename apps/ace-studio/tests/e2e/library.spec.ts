/**
 * @module library-e2e
 * @remarks User-driven local project save/export workflow with a fake GPU backend.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("bookmark a real job reference and edit local project metadata", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

  await page.getByRole("button", { name: "Library" }).click();
  await page.getByLabel("New project").fill("Experimental textures");
  await page.getByRole("button", { name: "Create local project" }).click();
  await expect(page.getByRole("heading", { name: "Experimental textures" })).toBeVisible();

  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Music description").fill("Dark textured percussion");
  await page.getByRole("button", { name: "Generate music" }).click();
  await expect(page.getByText("succeeded", { exact: true })).toBeVisible({ timeout: 15_000 });

  await page.getByLabel("Save reference to a local project")
    .selectOption({ label: "Experimental textures" });
  await page.getByRole("button", { name: "Save to project" }).click();
  await expect(page.getByRole("button", { name: "Reference saved" })).toBeDisabled();

  await page.getByRole("button", { name: "Library" }).click();
  await page.getByRole("button", { name: /Experimental textures.*1 saved references/ }).click();
  await expect(page.getByText("Dark textured percussion", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Edit track tags & notes" }).click();
  await page.getByLabel("Track notes").fill("Use in soundtrack");
  await page.getByLabel("Comma-separated tags").fill("ambient, experimental");
  await page.getByRole("button", { name: "Save track details" }).click();
  await expect(page.getByText("Use in soundtrack")).toBeVisible();
  await expect(page.getByText("experimental", { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export projects JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ace-studio-projects.json");
  const archivePath = await download.path();
  if (!archivePath) throw new Error("Playwright download did not produce a file");
  await page.getByLabel("Import project metadata").setInputFiles(archivePath);
  await expect(page.getByText(/Imported projects merged/)).toBeVisible();
});

