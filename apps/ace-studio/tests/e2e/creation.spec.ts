/** @module creation-e2e @remarks Web smoke scenario; no live GPU or model is used. */
import { test, expect } from "@playwright/test";

test("connect, queue, inspect job and request playable audio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Music description").fill("Ambient piano with warm tape textures");
  await page.getByRole("button", { name: /Generate music/ }).click();
  await expect(page.getByRole("heading", { name: /Ambient piano/ })).toBeVisible();
  await expect(page.getByText("succeeded", { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Load audio preview" }).click();
  await expect(page.locator("audio[controls]")).toBeVisible();
  await page.getByRole("button", { name: "Remix" }).click();
  await expect(page.getByText(/Imported from results/)).toBeVisible();
  await expect(page.getByText(/A source track is required/)).toBeVisible();
});

test("refuses generation when no backend is available", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Music description").fill("No offline simulation");
  await expect(page.getByRole("button", { name: /Generate music/ })).toBeDisabled();
});
