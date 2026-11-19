/**
 * @module dataset-conflict-e2e
 * @remarks Refuse stale sample edits in a server-global dataset.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("preflight refuses a stale sample edit instead of overwriting another operator", async ({ page }) => {
  const base = "http://127.0.0.1:18081";
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(base);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await page.getByRole("button", { name: "Datasets" }).click();
  await page.getByLabel("Backend audio directory").fill("/mock/audio");
  await page.getByRole("button", { name: "Review scan / replace" }).click();
  await page.getByRole("button", { name: "Confirm scan and replace" }).click();
  await expect(page.getByText(/0 \/ 3 samples labeled/)).toBeVisible();
  await page.getByRole("button", { name: /1\. mock-0\.wav/ }).click();
  await page.getByLabel("Caption / musical description").fill("My unsubmitted caption");

  const raw = (await (await page.request.get(base + "/v1/dataset/samples")).json()).data;
  const first = raw.samples[0];
  const mutation = await page.request.put(base + "/v1/dataset/sample/0", {
    data: {
      sample_idx: 0, caption: "Another operator edited first",
      genre: first.genre, lyrics: first.lyrics,
      prompt_override: first.prompt_override, bpm: first.bpm,
      keyscale: first.keyscale, timesignature: first.timesignature,
      language: first.language, is_instrumental: first.is_instrumental
    }
  });
  expect(mutation.ok()).toBe(true);

  await page.getByRole("button", { name: "Save sample metadata" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Dataset conflict:" }))
    .toBeVisible();
  const after = (await (await page.request.get(base + "/v1/dataset/samples")).json()).data;
  expect(after.samples[0].caption).toBe("Another operator edited first");
  await expect(page.getByLabel("Caption / musical description"))
    .toHaveValue("My unsubmitted caption");
});
