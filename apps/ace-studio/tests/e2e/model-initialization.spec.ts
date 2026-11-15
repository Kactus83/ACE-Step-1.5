/**
 * @module model-initialization-e2e
 * @remarks No implicit model loads; explicit DiT + 5Hz-LM double confirmation.
 * @internal
 */
import { test, expect } from "@playwright/test";

test("requires two matching user actions to initialize 5Hz LM and DiT", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  const before = (await (await page.request.get(
    "http://127.0.0.1:18081/__mock__/last_model_init")).json()).data;

  await page.getByLabel("Available language models")
    .selectOption("acestep-5Hz-lm-0.6B");
  await page.getByRole("button", { name: "Review DiT + LM initialization" }).click();
  await expect(page.getByText(/Confirm reinitialization of DiT/)).toBeVisible();
  const during = (await (await page.request.get(
    "http://127.0.0.1:18081/__mock__/last_model_init")).json()).data;
  expect(during).toEqual(before);

  await page.getByRole("button", { name: "Confirm DiT + LM initialization" }).click();
  await expect(page.getByText("Model initialization completed on the backend."))
    .toBeVisible();
  const after = (await (await page.request.get(
    "http://127.0.0.1:18081/__mock__/last_model_init")).json()).data;
  expect(after).toEqual({
    model: "acestep-v15-turbo", init_llm: true, lm_model_path: "acestep-5Hz-lm-0.6B"
  });
});

test("available DiT models need a second click before requesting initialization", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  const button = page.getByRole("button", { name: "Review DiT load" });
  await button.click();
  await expect(page.getByRole("button", { name: "Confirm DiT load" })).toBeVisible();
});

