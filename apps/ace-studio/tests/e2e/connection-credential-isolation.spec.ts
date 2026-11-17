/**
 * @module connection-credential-isolation-e2e
 * @remarks Backend URL changes must not expose a previous session's bearer token.
 * @internal
 */
import { expect, test } from "@playwright/test";

test("switching servers clears the previous token and permits explicit re-entry", async ({ page }) => {
  const source = "http://127.0.0.1:18081";
  const destination = "http://127.0.0.1:18082";
  const seen: string[] = [];
  const cors = {
    "Access-Control-Allow-Origin": "http://127.0.0.1:4211",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
  await page.route(destination + "/**", async route => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    seen.push(route.request().headers()["authorization"] ?? "");
    await route.fulfill({
      status: 503,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ detail: "Disposable destination is unavailable." })
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  const address = page.getByLabel("API server address");
  const token = page.getByLabel("API token optional");
  await address.fill(source);
  await token.fill("server-a-secret");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();

  await address.fill(destination);
  await expect(token).toHaveValue("");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect.poll(() => seen.length).toBeGreaterThan(0);
  expect(seen.every(header => header === "")).toBe(true);

  await token.fill("server-b-secret");
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect.poll(() => seen.includes("Bearer server-b-secret")).toBe(true);
  expect(seen).not.toContain("Bearer server-a-secret");
});
