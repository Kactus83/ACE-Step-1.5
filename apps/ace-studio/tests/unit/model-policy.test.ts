/**
 * @module model-policy-tests
 * @remarks Prevent false task capability claims and silent model substitution.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { ModelInventory } from "../../src/app/core/api.types";
import {
  advertisedTaskModes, generationModelIssue
} from "../../src/app/features/create/model-policy";

const inventory: ModelInventory = {
  default_model: "turbo",
  models: [
    { name: "turbo", is_loaded: true,
      supported_task_types: ["text2music", "cover", "repaint"] },
    { name: "base", is_loaded: false,
      supported_task_types: ["text2music", "cover", "repaint", "extract", "lego", "complete"] },
    { name: "unknown-capabilities", is_loaded: true }
  ]
};

describe("generation model selection policy", () => {
  it("accepts only supported modes from a loaded, explicitly known DiT", () => {
    expect(advertisedTaskModes(inventory, "")).toEqual([
      "text2music", "cover", "repaint"
    ]);
    expect(generationModelIssue(inventory, "", "text2music")).toBeNull();
    expect(generationModelIssue(inventory, "turbo", "cover")).toBeNull();
    expect(generationModelIssue(inventory, "turbo", "extract")).toBe("unsupported");
    expect(advertisedTaskModes(inventory, "turbo")).not.toContain("extract");
  });

  it("does not silently use primary when a different model is not loaded", () => {
    expect(advertisedTaskModes(inventory, "base")).toContain("extract");
    expect(generationModelIssue(inventory, "base", "text2music")).toBe("not-loaded");
    expect(generationModelIssue(inventory, "base", "extract")).toBe("not-loaded");
    expect(generationModelIssue({
      ...inventory, models: inventory.models.map(model =>
        model.name === "base" ? { ...model, is_loaded: true } : model)
    }, "base", "extract")).toBeNull();
  });

  it("refuses missing models, missing inventories and undeclared capabilities", () => {
    expect(advertisedTaskModes(null, "")).toEqual([]);
    expect(generationModelIssue(null, "", "text2music")).toBe("unavailable");
    expect(generationModelIssue({ ...inventory, default_model: null }, "", "text2music"))
      .toBe("unavailable");
    expect(generationModelIssue(inventory, "not-advertised", "text2music"))
      .toBe("unknown");
    expect(generationModelIssue(inventory, "unknown-capabilities", "text2music"))
      .toBe("unsupported");
    expect(advertisedTaskModes(inventory, "unknown-capabilities")).toEqual([]);
  });

  it("rejects a stale unsupported mode after switching between advertised models", () => {
    expect(advertisedTaskModes(inventory, "base")).toContain("complete");
    expect(generationModelIssue(inventory, "turbo", "complete"))
      .toBe("unsupported");
  });
});
