/**
 * @module sample-mode-e2e
 * @remarks Verify actual 5Hz-LM sample request and explicit resource warning.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("idea-based LM sample mode submits real sample_query only after consent", async ({ page }) => {
  await page.request.post("http://127.0.0.1:18081/__mock__/reset_lm");
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Generate music concept with 5Hz LM").check();
  await page.getByLabel("Idea / query for the 5Hz language model")
    .fill("Slow tribal percussion with wooden flutes");

  const before = (await (await page.request.get(
    "http://127.0.0.1:18081/__mock__/last_submission")).json()).data;
  await page.getByRole("button", { name: "Generate music" }).click();
  await expect(page.getByText(/Sample mode may initialize the 5Hz/)).toBeVisible();
  const during = (await (await page.request.get(
    "http://127.0.0.1:18081/__mock__/last_submission")).json()).data;
  expect(during).toEqual(before);

  await page.getByRole("button", { name: "Generate music" }).click();
  await expect(page.getByRole("heading", { name: /Slow tribal percussion/ }))
    .toBeVisible();
  const after = (await (await page.request.get(
    "http://127.0.0.1:18081/__mock__/last_submission")).json()).data;
  expect(after.sample_mode).toBe(true);
  expect(after.sample_query).toBe("Slow tribal percussion with wooden flutes");
  expect(after.prompt).toBe("");
  expect(after.lyrics).toBe("");
});

