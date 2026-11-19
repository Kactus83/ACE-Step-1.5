/**
 * @module advanced-creation-e2e
 * @remarks API boundary scenarios using only a deterministic disposable HTTP mock.
 * @internal
 */
import { expect, test } from "@playwright/test";

async function connect(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill("http://127.0.0.1:18081");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Music description").fill("Muted granular pad with tape ambience");
  await page.getByText("Advanced controls", { exact: false }).click();
}

test("preserves backend DCW default and forwards exact scheduler and CoT controls",
  async ({ page }) => {
    await connect(page);
    await page.getByLabel("Inference method").selectOption("sde");
    await page.getByLabel("Custom timesteps").fill("0.97,0.5,0");
    await page.getByLabel("CoT: enhance music caption").check();
    await page.getByLabel("LM top-k").fill("40");
    await page.getByRole("button", { name: "Generate music" }).click();
    await expect(page.getByRole("heading", { name: /Muted granular/ })).toBeVisible();
    const result = await page.request.get("http://127.0.0.1:18081/__mock__/last_submission");
    const response = await result.json();
    const sent = response.data as Record<string, unknown>;
    expect(sent["infer_method"]).toBe("sde");
    expect(sent["timesteps"]).toBe("0.97,0.5,0");
    expect(sent["use_cot_caption"]).toBe(true);
    expect(sent["lm_top_k"]).toBe(40);
    expect(sent).not.toHaveProperty("dcw_enabled");
  });

test("requires a separate confirmation before forcing DCW on",
  async ({ page }) => {
    await connect(page);
    await page.getByLabel("DCW policy").selectOption("on");
    await page.getByLabel("Correction mode").selectOption("high");
    await page.getByRole("button", { name: "Generate music" }).click();
    await expect(page.getByText(/Forced DCW can distort/)).toBeVisible();
    await page.getByRole("button", { name: "Generate music" }).click();
    await expect(page.getByRole("heading", { name: /Muted granular/ })).toBeVisible();
    const result = await page.request.get("http://127.0.0.1:18081/__mock__/last_submission");
    const sent = (await result.json()).data as Record<string, unknown>;
    expect(sent["dcw_enabled"]).toBe(true);
    expect(sent["dcw_mode"]).toBe("high");
  });

test("rejects inverted scheduler steps without submitting",
  async ({ page }) => {
    await connect(page);
    await page.getByLabel("Custom timesteps").fill("0.4,0.7");
    await page.getByRole("button", { name: "Generate music" }).click();
    await expect(page.getByText(/strictly descending/)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Muted granular/ })).not.toBeVisible();
  });
