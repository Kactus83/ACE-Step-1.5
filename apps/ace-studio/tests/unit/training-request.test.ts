/** @module training-request-test @remarks Tests adapter-specific LoRA/LoKr field boundaries. */
import { describe, expect, it } from "vitest";
import { TrainingFormSnapshot, mapTrainingRequest } from "../../src/app/features/training/training.request";

const values: TrainingFormSnapshot = {
  tensor_dir: "/srv/tensors", output_dir: "/srv/output", learning_rate: 0.0001,
  train_epochs: 10, train_batch_size: 1, gradient_accumulation: 4,
  save_every_n_epochs: 5, training_shift: 3, training_seed: 42,
  gradient_checkpointing: false, lora_rank: 64, lora_alpha: 128,
  lora_dropout: 0.1, use_fp8: false, lokr_linear_dim: 64, lokr_linear_alpha: 128,
  lokr_factor: -1, lokr_decompose_both: false, lokr_use_tucker: false,
  lokr_use_scalar: false, lokr_weight_decompose: true
};

describe("training request mapping", () => {
  it("uses the exact LoRA schema and canonical output key", () => {
    const req = mapTrainingRequest(values, "lora");
    expect(req).toMatchObject({ tensor_dir: "/srv/tensors",
      lora_output_dir: "/srv/output", lora_rank: 64 });
    expect(Object.keys(req)).not.toContain("output_dir");
  });
  it("uses the exact LoKr schema and canonical output key", () => {
    const req = mapTrainingRequest(values, "lokr");
    expect(req).toMatchObject({ tensor_dir: "/srv/tensors",
      output_dir: "/srv/output", lokr_factor: -1 });
    expect(Object.keys(req)).not.toContain("lora_output_dir");
  });
  it("rejects empty backend path inputs", () => {
    expect(() => mapTrainingRequest({ ...values, tensor_dir: "" }, "lora"))
      .toThrow("required");
  });
});
