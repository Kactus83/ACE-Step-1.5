/**
 * @module library-multi-tab-e2e
 * @remarks Cross-tab catalog changes are mirrored without manual reload.
 * @internal
 */
import { test, expect } from "@playwright/test";

test("a browser-local project created in one tab is visible in another", async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto("/");
  await second.goto("/");
  await first.getByRole("button", { name: "Library" }).click();
  await second.getByRole("button", { name: "Library" }).click();

  await first.getByLabel("New project").fill("Two-tab ambience");
  await first.getByRole("button", { name: "Create local project" }).click();
  await expect(first.getByRole("heading", { name: "Two-tab ambience" })).toBeVisible();

  await expect(second.getByRole("button", {
    name: /Two-tab ambience.*0 saved references/
  })).toBeVisible();
  await second.getByRole("button", { name: /Two-tab ambience.*0 saved references/ })
    .click();
  await expect(second.getByRole("heading", { name: "Two-tab ambience" })).toBeVisible();

  await second.getByRole("button", { name: "Edit project details" }).click();
  await second.getByLabel("Description").fill("Synced without remote audio");
  await second.getByRole("button", { name: "Save project details" }).click();
  await expect(first.getByText("Project catalog updated from another browser tab."))
    .toBeVisible();

  await first.reload();
  await first.getByRole("button", { name: "Library" }).click();
  await first.getByRole("button", { name: /Two-tab ambience.*0 saved references/ }).click();
  await expect(first.getByText("Synced without remote audio")).toBeVisible();
});
