/**
 * @module task-variant-provenance-tests
 * @remarks Cache-derived batch seeds must belong to their correct audio variant.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { decodeTask } from "../../src/app/core/api-decoder";
import { taskVariantProvenance } from "../../src/app/core/task-variant-provenance";

describe("legacy cache provenance normalization", () => {
  it("aligns repeated batch-wide seed lists with the actual audio index", () => {
    const rows = [
      { file: "/v1/audio?path=one", seed_value: "101,202",
        dit_model: "acestep-v15-base", metas: { bpm: 120 } },
      { file: "/v1/audio?path=two", seed_value: "101,202",
        dit_model: "acestep-v15-base", metas: { bpm: 121 } }
    ];
    expect(taskVariantProvenance(rows)).toEqual([
      { seed: "101", ditModel: "acestep-v15-base" },
      { seed: "202", ditModel: "acestep-v15-base" }
    ]);
    const decoded = decodeTask({ task_id: "job", status: 1, result: JSON.stringify(rows) });
    expect(decoded.results.map(result => result.seed_value)).toEqual(["101", "202"]);
    expect(decoded.results[0].metas?.["dit_model"]).toBe("acestep-v15-base");
    expect(decoded.results[1].metas?.["bpm"]).toBe(121);
    expect(rows[0].metas).toEqual({ bpm: 120 });
  });

  it("preserves already distinct store-derived seeds and nested DiT metadata", () => {
    const result = taskVariantProvenance([
      { seed_value: "17", metas: { dit_model: "acestep-v15-turbo" } },
      { seed_value: "18", metas: { dit_model: "acestep-v15-turbo" } }
    ]);
    expect(result).toEqual([
      { seed: "17", ditModel: "acestep-v15-turbo" },
      { seed: "18", ditModel: "acestep-v15-turbo" }
    ]);
  });

  it("prefers the canonical direct server model when nested cache metadata disagrees", () => {
    const [actual] = taskVariantProvenance([{
      dit_model: "acestep-v15-base",
      metas: { dit_model: "acestep-v15-turbo" }
    }]);
    expect(actual?.ditModel).toBe("acestep-v15-base");
  });

  it("omits mismatched batch seeds and unsafe model identity", () => {
    expect(taskVariantProvenance([
      { seed_value: "101,202", dit_model: "/etc/secrets" },
      { seed_value: "101,303", dit_model: "invalid/model" }
    ])).toEqual([{}, {}]);
    expect(taskVariantProvenance([
      { seed_value: "101,202" }
    ])).toEqual([{}]);
    expect(taskVariantProvenance([
      { seed_value: "-1" }, { seed_value: "99999999999999999" }
    ])).toEqual([{}, {}]);
  });

  it("does not fabricate metadata when task entries are empty or malformed", () => {
    expect(taskVariantProvenance([])).toEqual([]);
    expect(taskVariantProvenance([null, 5, "data"])).toEqual([{}, {}, {}]);
  });
});
