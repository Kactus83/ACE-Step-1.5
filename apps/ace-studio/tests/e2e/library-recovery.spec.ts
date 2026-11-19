/**
 * @module library-recovery-e2e
 * @remarks Raw backup precedes any deliberate reset of a corrupt local catalog.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("corrupt catalog can be backed up and reset only after two user actions", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ace-studio:library:v1", "{broken-json");
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Library" }).click();
  await expect(page.getByText("The stored project catalog is unreadable.")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Back up unreadable catalog" }).click();
  expect((await download).suggestedFilename()).toBe("ace-studio-unreadable-catalog.txt");
  await page.getByRole("button", { name: "Review corrupt catalog reset" }).click();
  await expect(page.getByRole("button", { name: "Confirm discard corrupt catalog" }))
    .toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("ace-studio:library:v1")))
    .toBe("{broken-json");
  await page.getByRole("button", { name: "Confirm discard corrupt catalog" }).click();
  await expect(page.getByText("Unreadable catalog cleared. You can now create projects."))
    .toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("ace-studio:library:v1")))
    .toBeNull();
  await page.getByLabel("New project").fill("Recovered");
  await page.getByRole("button", { name: "Create local project" }).click();
  await expect(page.getByRole("heading", { name: "Recovered" })).toBeVisible();
});

test("a valid catalog never exposes the destructive recovery action", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Library" }).click();
  await expect(page.getByRole("button", { name: "Confirm discard corrupt catalog" }))
    .toHaveCount(0);
});
