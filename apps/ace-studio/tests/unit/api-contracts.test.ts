/**
 * @module api-contract-tests
 * @remarks Untrusted backend shape/bounds checks for inventory, stats and queue.
 * @internal
 */
import { describe, expect, it } from "vitest";
import {
  decodeBackendStats, decodeModelInventory, decodeTaskRecords
} from "../../src/app/core/api-contracts";

describe("model inventory boundary", () => {
  it("retains explicitly advertised model capabilities and 5Hz LM state", () => {
    const result = decodeModelInventory({
      models: [{ name: "acestep-v15-base", is_loaded: true,
        supported_task_types: ["text2music", "lego"] }],
      lm_models: [{ name: "acestep-5Hz-lm-0.6B", is_loaded: true }],
      default_model: "acestep-v15-base",
      loaded_lm_model: "acestep-5Hz-lm-0.6B",
      llm_initialized: true
    });
    expect(result.models[0]?.supported_task_types).toEqual(["text2music", "lego"]);
    expect(result.lm_models?.[0]?.is_loaded).toBe(true);
  });
  it("rejects missing model list and duplicate model names", () => {
    expect(() => decodeModelInventory({ lm_models: [] })).toThrow("DiT model");
    expect(() => decodeModelInventory({ models: [
      { name: "a" }, { name: "a" }
    ] })).toThrow("Duplicate");
  });
});

describe("job counters and task lookup", () => {
  it("accepts actual nonnegative counts without guessing progress", () => {
    const stats = decodeBackendStats({
      jobs: { total: 3, running: 1, failed: 2 },
      queue_size: 0, queue_maxsize: 100, avg_job_seconds: 5.5
    });
    expect(stats.jobs["running"]).toBe(1);
    expect(stats.queue_size).toBe(0);
  });
  it("rejects untrustworthy queue values", () => {
    expect(() => decodeBackendStats({
      jobs: { running: -1 }, queue_size: 0,
      queue_maxsize: 10, avg_job_seconds: 2
    })).toThrow("counter");
  });
  it("verifies that every task record was requested", () => {
    const records = decodeTaskRecords([{ task_id: "a", status: 1, result: "[]" }], ["a"]);
    expect(records[0]?.task_id).toBe("a");
    expect(() => decodeTaskRecords([
      { task_id: "b", status: 1, result: "[]" }
    ], ["a"])).toThrow("identifier");
    expect(() => decodeTaskRecords([
      { task_id: "a", status: 1 }, { task_id: "a", status: 1 }
    ], ["a", "a"])).toThrow("identifier");
  });
});

