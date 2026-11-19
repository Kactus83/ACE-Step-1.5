/**
 * @module transient-audio-upload-test
 * @remarks Shared upload policy is independent from browser File API.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { validateAudioUpload } from "../../src/app/features/create/source-audio";

describe("temporary audio upload policy", () => {
  it("allows realistic audio with MIME or extension evidence", () => {
    expect(validateAudioUpload({ name: "sound.wav", type: "audio/wav", size: 128 }))
      .toBeNull();
    expect(validateAudioUpload({ name: "sound.flac", type: "", size: 128 }))
      .toBeNull();
  });
  it("rejects unsupported, empty and too-large files", () => {
    expect(validateAudioUpload({ name: "report.exe", type: "application/octet-stream",
      size: 128 })).toMatch(/audio file/);
    expect(validateAudioUpload({ name: "empty.mp3", type: "audio/mpeg",
      size: 0 })).not.toBeNull();
    expect(validateAudioUpload({ name: "huge.wav", type: "audio/wav",
      size: 121 * 1024 * 1024 })).not.toBeNull();
  });
});
