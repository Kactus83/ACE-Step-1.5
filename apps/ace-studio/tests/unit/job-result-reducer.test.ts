/**
 * @module job-result-reducer-tests
 * @remarks Pure polling reducer keeps valid results and refuses malformed payloads.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { StudioJob, TaskRecordDto } from "../../src/app/core/api.types";
import { applyTaskRecord } from "../../src/app/core/job-result-reducer";

const job: StudioJob = {
  id: "task-1", title: "Test", createdAt: 1,
  phase: "queued", progressText: "Queued", results: []
};

describe("task record reducer", () => {
  it("maps completed audio results without mutating the original job", () => {
    const raw: TaskRecordDto = {
      task_id: job.id, status: 1, progress_text: "Completed",
      result: JSON.stringify([{ file: "/v1/audio?path=%2Fmock%2Ftest.wav",
        seed_value: "42", status: 1, metas: { dit_model: "acestep-v15-turbo" } }])
    };
    const next = applyTaskRecord(job, raw);
    expect(next.phase).toBe("succeeded");
    expect(next.progressText).toBe("Completed");
    expect(next.results[0].seed_value).toBe("42");
    expect(next.results[0].metas?.["dit_model"]).toBe("acestep-v15-turbo");
    expect(job.phase).toBe("queued");
    expect(job.results).toHaveLength(0);
  });

  it("does not invent a successful job when results are malformed", () => {
    const next = applyTaskRecord(job, {
      task_id: job.id, status: 1, result: "{invalid JSON"
    });
    expect(next.phase).toBe("unknown");
    expect(next.progressText).toMatch(/Malformed JSON/);
    expect(job.phase).toBe("queued");
  });

  it("preserves existing progress text if server response omits it", () => {
    expect(applyTaskRecord(job, {
      task_id: job.id, status: 0, result: "[]"
    }).progressText).toBe("Queued");
  });
});
