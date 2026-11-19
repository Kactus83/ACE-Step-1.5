/**
 * @module training-request
 * @remarks Pure mapping from validated UI fields to authoritative Python Pydantic requests.
 * @public
 */
import { StartLoKrRequest, StartLoRARequest, TrainingCommonRequest } from "./training.types";

/** @public Shared, typed editable training parameters. */
export interface TrainingFormSnapshot {
  readonly tensor_dir: string;
  readonly output_dir: string;
  readonly learning_rate: number;
  readonly train_epochs: number;
  readonly train_batch_size: number;
  readonly gradient_accumulation: number;
  readonly save_every_n_epochs: number;
  readonly training_shift: number;
  readonly training_seed: number;
  readonly gradient_checkpointing: boolean;
  readonly lora_rank: number;
  readonly lora_alpha: number;
  readonly lora_dropout: number;
  readonly use_fp8: boolean;
  readonly lokr_linear_dim: number;
  readonly lokr_linear_alpha: number;
  readonly lokr_factor: number;
  readonly lokr_decompose_both: boolean;
  readonly lokr_use_tucker: boolean;
  readonly lokr_use_scalar: boolean;
  readonly lokr_weight_decompose: boolean;
}

/**
 * @public Map exactly known request fields for the selected algorithm.
 * @throws Error when the tensor directory or output location is missing.
 */
export function mapTrainingRequest(
  values: TrainingFormSnapshot, mode: "lora" | "lokr"
): StartLoRARequest | StartLoKrRequest {
  const tensor_dir = values.tensor_dir.trim();
  const output_dir = values.output_dir.trim();
  if (!tensor_dir || !output_dir) throw new Error("Tensor and output directories are required.");
  const common: TrainingCommonRequest = {
    tensor_dir,
    learning_rate: values.learning_rate,
    train_epochs: values.train_epochs,
    train_batch_size: values.train_batch_size,
    gradient_accumulation: values.gradient_accumulation,
    save_every_n_epochs: values.save_every_n_epochs,
    training_shift: values.training_shift,
    training_seed: values.training_seed,
    gradient_checkpointing: values.gradient_checkpointing
  };
  if (mode === "lora") {
    return {
      ...common,
      lora_rank: values.lora_rank,
      lora_alpha: values.lora_alpha,
      lora_dropout: values.lora_dropout,
      lora_output_dir: output_dir,
      use_fp8: values.use_fp8
    };
  }
  return {
    ...common,
    lokr_linear_dim: values.lokr_linear_dim,
    lokr_linear_alpha: values.lokr_linear_alpha,
    lokr_factor: values.lokr_factor,
    lokr_decompose_both: values.lokr_decompose_both,
    lokr_use_tucker: values.lokr_use_tucker,
    lokr_use_scalar: values.lokr_use_scalar,
    lokr_weight_decompose: values.lokr_weight_decompose,
    output_dir
  };
}
