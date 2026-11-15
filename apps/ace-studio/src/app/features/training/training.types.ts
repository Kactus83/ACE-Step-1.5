/**
 * @module training-types
 * @remarks DTOs verified from acestep/api/train_api_{models,service}.py at ca1e85fe.
 * @public
 */

/** @public Read-only authoritative training progress. */
export interface TrainingStatus {
  readonly is_training: boolean;
  readonly should_stop?: boolean;
  readonly current_step: number;
  readonly current_epoch?: number;
  readonly current_loss: number | null;
  readonly status: string;
  readonly tensor_dir?: string;
  readonly config?: Readonly<Record<string, unknown>>;
  readonly loss_history?: readonly { readonly step: number; readonly loss: number }[];
  readonly training_log?: string;
  readonly steps_per_second?: number;
  readonly estimated_time_remaining?: number;
  readonly error?: string | null;
}

/** @public Server-side tensor directory validation result. */
export interface TensorDirectoryInfo {
  readonly dataset_name: string;
  readonly num_samples: number;
  readonly tensor_dir: string;
  readonly custom_tag?: string;
  readonly message: string;
}

/** @public Dataset scan response. Samples remain owned by the Python backend. */
export interface DatasetScanResult {
  readonly message: string;
  readonly num_samples: number;
  readonly samples: readonly unknown[];
}

/** @public Fields common to LoRA/LoKr start schema. */
export interface TrainingCommonRequest {
  readonly tensor_dir: string;
  readonly learning_rate: number;
  readonly train_epochs: number;
  readonly train_batch_size: number;
  readonly gradient_accumulation: number;
  readonly save_every_n_epochs: number;
  readonly training_shift: number;
  readonly training_seed: number;
  readonly gradient_checkpointing: boolean;
}

/** @public LoRA start route request. */
export interface StartLoRARequest extends TrainingCommonRequest {
  readonly lora_rank: number;
  readonly lora_alpha: number;
  readonly lora_dropout: number;
  readonly lora_output_dir: string;
  readonly use_fp8: boolean;
}

/** @public LoKr start route request. */
export interface StartLoKrRequest extends TrainingCommonRequest {
  readonly lokr_linear_dim: number;
  readonly lokr_linear_alpha: number;
  readonly lokr_factor: number;
  readonly lokr_decompose_both: boolean;
  readonly lokr_use_tucker: boolean;
  readonly lokr_use_scalar: boolean;
  readonly lokr_weight_decompose: boolean;
  readonly output_dir: string;
}

/** @public Backend-reported acknowledgement, not completed training. */
export interface TrainingActionResult {
  readonly message: string;
}
