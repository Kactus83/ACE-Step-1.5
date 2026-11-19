/**
 * @module existing-job-attachment-e2e
 * @remarks Read-only recovery must not enqueue duplicate GPU inference work.
 * @internal
 */
import { expect, test } from "@playwright/test";

const mock = "http://127.0.0.1:18081";

async function countSubmissions(page: import("@playwright/test").Page): Promise<number> {
  const response = await page.request.get(mock + "/__mock__/submission_count");
  return (await response.json()).data.count as number;
}

test("attach one known task without resubmitting and reject duplicate/unknown IDs", async ({ page }) => {
  const seeded = await page.request.post(mock + "/release_task", {
    data: { prompt: "Imported known server task", task_type: "text2music" }
  });
  expect(seeded.ok()).toBe(true);
  const taskId = (await seeded.json()).data.task_id as string;
  const before = await countSubmissions(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(mock);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  await page.getByRole("button", { name: "Queue & results" }).click();

  await page.getByText("Attach an existing task by ID").click();
  await page.getByLabel("Existing task ID").fill(taskId);
  await page.getByRole("button", { name: "Find & attach task" }).click();
  await expect(page.getByText(/Existing task added to this session/)).toBeVisible();
  await expect(page.getByRole("heading", { name: taskId })).toBeVisible();
  await expect(page.getByText("succeeded", { exact: true })).toBeVisible({ timeout: 15_000 });
  expect(await countSubmissions(page)).toBe(before);

  await page.getByLabel("Existing task ID").fill(taskId);
  await page.getByRole("button", { name: "Find & attach task" }).click();
  await expect(page.getByText("This task is already in your session.")).toBeVisible();
  await page.getByLabel("Existing task ID").fill("missing-xyz");
  await page.getByRole("button", { name: "Find & attach task" }).click();
  await expect(page.getByText(/Task not found on this server/)).toBeVisible();
  await expect(page.locator(".job-card")).toHaveCount(1);
  expect(await countSubmissions(page)).toBe(before);
});

test("a task lookup resolved after switching backend cannot attach old-server work", async ({ page }) => {
  const seeded = await page.request.post(mock + "/release_task", {
    data: { prompt: "Old endpoint task", task_type: "text2music" }
  });
  const taskId = (await seeded.json()).data.task_id as string;
  const before = await countSubmissions(page);
  const next = "http://127.0.0.1:18082";
  let lookupStarted!: () => void;
  let finishLookup!: () => void;
  const started = new Promise<void>(resolve => { lookupStarted = resolve; });
  const released = new Promise<void>(resolve => { finishLookup = resolve; });

  await page.route(next + "/**", async route => {
    const response = await route.fetch({
      url: route.request().url().replace(":18082/", ":18081/")
    });
    await route.fulfill({ response });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Connection" }).click();
  await page.getByLabel("API server address").fill(mock);
  await page.getByRole("button", { name: "Save & connect" }).click();
  await page.getByRole("button", { name: "Queue & results" }).click();
  await page.getByText("Attach an existing task by ID").click();

  await page.route(mock + "/v1/studio/jobs/" + taskId, async route => {
    lookupStarted();
    await released;
    await route.continue();
  });
  try {
    await page.getByLabel("Existing task ID").fill(taskId);
    await page.getByRole("button", { name: "Find & attach task" }).click();
    await started;
    await page.getByRole("button", { name: "Connection" }).click();
    await page.getByLabel("API server address").fill(next);
    await page.getByRole("button", { name: "Save & connect" }).click();
    await expect(page.getByText("Connected to ACE-Step API.")).toBeVisible();
  } finally {
    finishLookup();
  }
  await page.getByRole("button", { name: "Queue & results" }).click();
  await expect(page.locator(".job-card")).toHaveCount(0);
  expect(await countSubmissions(page)).toBe(before);
});
