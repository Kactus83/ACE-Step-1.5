/**
 * @module source-audio-test
 * @remarks Ensure server extension is preserved when FastAPI returns a fallback MIME.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { audioBlobToSourceFile } from "../../src/app/features/create/source-audio";

describe("generated source file adapter", () => {
  it("keeps actual extension from backend reference rather than generic MIME", () => {
    const blob = new Blob(["test"], { type: "audio/mpeg" });
    const file = audioBlobToSourceFile(blob, "/v1/audio?path=%2Ftmp%2Fout.aac");
    expect(file.name).toBe("ace-result.aac");
  });
  it("falls back to MIME type when no backend file extension is reported", () => {
    const file = audioBlobToSourceFile(new Blob(["test"], { type: "audio/wav" }));
    expect(file.name).toBe("ace-result.wav");
  });
});

