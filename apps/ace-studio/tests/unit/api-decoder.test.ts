/** @module api-decoder-test @remarks Offline regression coverage for legacy ACE-Step task envelopes. */
import { describe, expect, it } from "vitest";
import { decodeTask, normalizeAudioUrl, normalizeEndpoint, unwrap } from "../../src/app/core/api-decoder";

describe("standalone API envelope", () => {
  it("unwraps a wrapped object", () => {
    expect(unwrap<{ status: string }>({ code: 200, error: null, data: { status: "ok" } }))
      .toEqual({ status: "ok" });
  });
  it("rejects a backend error even when HTTP itself succeeded", () => {
    expect(() => unwrap({ code: 401, error: "Invalid API key", data: null }))
      .toThrow("Invalid API key");
  });
  it("rejects missing wrapper data instead of assuming Gradio response parity", () => {
    expect(() => unwrap({ status: "ok" })).toThrow("Unsupported");
  });
});

describe("query_result legacy result decoding", () => {
  it("parses JSON-encoded audio arrays and preserves server seed", () => {
    const decoded = decodeTask({
      task_id: "t1", status: 1, progress_text: "Done",
      result: JSON.stringify([{ file: "/v1/audio?path=%2Ftmp%2Fa.mp3", seed_value: "42" }])
    });
    expect(decoded.phase).toBe("succeeded");
    expect(decoded.results[0]?.seed_value).toBe("42");
    expect(decoded.results[0]?.file).toContain("/v1/audio?");
  });
  it("does not manufacture a numeric percent from a nonterminal state", () => {
    const result = decodeTask({
      task_id: "t2", status: 0, progress_text: "Sampling",
      result: JSON.stringify([{ file: "", status: 0 }])
    });
    expect(result.phase).toBe("running");
    expect(result.progressText).toBe("Sampling");
    expect(result.results[0]?.progress).toBeUndefined();
  });
  it("keeps the failed status when audio is empty", () => {
    expect(decodeTask({
      task_id: "t3", status: 2, result: '[{"error":"CUDA out of memory"}]'
    }).phase).toBe("failed");
  });
  it("rejects corrupt and nonarray payloads", () => {
    expect(() => decodeTask({ status: 1, result: "broken JSON" })).toThrow("Malformed JSON");
    expect(() => decodeTask({ status: 1, result: '{"file":"bad"}' })).toThrow("array");
    expect(() => decodeTask({ status: "1", result: "[]" })).toThrow("Malformed");
  });
});

describe("network boundaries", () => {
  it("only permits local HTTP or HTTPS server URLs without embedded credentials", () => {
    expect(normalizeEndpoint("http://localhost:8001")).toBe("http://localhost:8001");
    expect(normalizeEndpoint("https://example.org/")).toBe("https://example.org");
    expect(() => normalizeEndpoint("http://example.org:8001")).toThrow("HTTPS");
    expect(() => normalizeEndpoint("https://key:secret@example.org/")).toThrow("credentials");
    expect(() => normalizeEndpoint("file:///tmp/studio")).toThrow("HTTPS");
  });
  it("blocks audio references outside the exact backend origin and route", () => {
    const host = "http://127.0.0.1:8001";
    expect(normalizeAudioUrl("/v1/audio?path=%2Ftmp%2Fa.wav", host))
      .toBe(host + "/v1/audio?path=%2Ftmp%2Fa.wav");
    expect(() => normalizeAudioUrl("https://evil.test/v1/audio?path=x", host)).toThrow("rejected");
    expect(() => normalizeAudioUrl("http://127.0.0.1:8001/private?path=x", host)).toThrow("rejected");
    expect(() => normalizeAudioUrl("/v1/audio", host)).toThrow("rejected");
  });
});
