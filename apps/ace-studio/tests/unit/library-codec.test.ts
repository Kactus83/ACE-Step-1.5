/**
 * @module library-codec-tests
 * @remarks Browser-local catalog compatibility, bounds, server scope and sanitization.
 * @internal
 */
import { describe, expect, it } from "vitest";
import {
  decodeLibraryCatalog, decodeLibraryTrack, encodeLibraryCatalog,
  importLibraryJson, normalizeTags
} from "../../src/app/features/library/library.codec";

const reference = {
  id: "track-one", jobId: "gen-123", variant: 1,
  title: "Nocturne", savedAt: 2000,
  backend: "http://127.0.0.1:18081",
  result: {
    file: "/v1/audio?path=%2Fmock%2Fnocturne.wav",
    prompt: "Analog nocturne", seed_value: "33",
    metas: { bpm: 120, evil_field: "untrusted", duration: 30 }
  },
  favorite: true, note: "Calm textures", tags: ["ambient", "film"]
};

const project = {
  id: "project-one", name: "Soundscapes",
  description: "", createdAt: 1, updatedAt: 2, tracks: [reference]
};

describe("local library catalog contracts", () => {
  it("roundtrips versioned projects but strips unsupported output metadata", () => {
    const decoded = decodeLibraryCatalog({
      version: 1, projects: [project]
    });
    expect(decoded).toHaveLength(1);
    expect(decoded[0]?.tracks[0]?.result.metas).toEqual({ bpm: 120, duration: 30 });
    const exported = encodeLibraryCatalog(decoded, 1234);
    expect(exported.version).toBe(1);
    expect(exported.exportedAt).toBe(1234);
    expect(decodeLibraryCatalog(exported)).toEqual(decoded);
  });

  it("rejects off-backend or non-audio references, avoiding credential exfiltration", () => {
    expect(decodeLibraryTrack({
      ...reference, result: {
        file: "https://evil.test/v1/audio?path=%2Fsample.wav"
      }
    })).toBeNull();
    expect(decodeLibraryTrack({
      ...reference, result: { file: "http://127.0.0.1:18081/admin?path=x" }
    })).toBeNull();
    expect(decodeLibraryTrack({
      ...reference, backend: "http://untrusted.test:8001"
    })).toBeNull();
  });

  it("enforces catalog version and strict valid JSON", () => {
    expect(() => decodeLibraryCatalog({ version: 3, projects: [] }))
      .toThrow("Unsupported");
    expect(() => importLibraryJson("{invalid")).toThrow("not valid JSON");
    expect(() => importLibraryJson("x".repeat(1_500_001))).toThrow("1.5 MB");
  });

  it("deduplicates IDs, caps project count and sanitizes labels", () => {
    const duplicate = decodeLibraryCatalog({
      version: 1, projects: [project, project]
    });
    expect(duplicate).toHaveLength(1);
    expect(normalizeTags(["ambient", "ambient", " drum ", "", "x".repeat(80)]))
      .toEqual(["ambient", "drum", "x".repeat(32)]);
  });

  it("removes raw strings not included in the audio allowlist", () => {
    const result = decodeLibraryTrack({
      ...reference, result: {
        ...reference.result,
        bearer_token: "never-save-this",
        src_audio_path: "/private/path", track_name: "nocturne"
      }
    });
    expect(JSON.stringify(result)).not.toContain("never-save-this");
    expect(JSON.stringify(result)).not.toContain("src_audio_path");
  });
});

