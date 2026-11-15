/**
 * @module training-component
 * @remarks Explicit dataset and LoRA/LoKr workflows; expensive actions require reconfirmation.
 * @public
 */
import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { BackendStore } from "../../core/backend.store";
import { TrainingStore } from "./training.store";
import { mapTrainingRequest } from "./training.request";

/** @public Training panel with server-side path validation and live monitoring. */
@Component({
  selector: "ace-training",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./training.component.html"
})
export class TrainingComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly backend = inject(BackendStore);
  readonly training = inject(TrainingStore);
  readonly mode = signal<"lora" | "lokr">("lora");
  readonly confirming = signal<string | null>(null);
  readonly stopConfirm = signal(false);
  readonly error = signal<string | null>(null);

  readonly dataset = this.fb.nonNullable.group({
    audio_dir: ["", Validators.required],
    dataset_name: ["studio_dataset", Validators.required],
    all_instrumental: [true]
  });

  readonly form = this.fb.nonNullable.group({
    tensor_dir: ["", Validators.required],
    output_dir: ["./lora_output", Validators.required],
    learning_rate: [0.0001, Validators.min(0.000000001)],
    train_epochs: [10, Validators.min(1)],
    train_batch_size: [1, Validators.min(1)],
    gradient_accumulation: [4, Validators.min(1)],
    save_every_n_epochs: [5, Validators.min(1)],
    training_shift: [3, Validators.min(0)],
    training_seed: [42],
    gradient_checkpointing: [false],
    lora_rank: [64, [Validators.min(1), Validators.max(256)]],
    lora_alpha: [128, [Validators.min(1), Validators.max(512)]],
    lora_dropout: [0.1, [Validators.min(0), Validators.max(1)]],
    use_fp8: [false],
    lokr_linear_dim: [64, [Validators.min(1), Validators.max(256)]],
    lokr_linear_alpha: [128, [Validators.min(1), Validators.max(512)]],
    lokr_factor: [-1, [Validators.min(-1), Validators.max(8)]],
    lokr_decompose_both: [false],
    lokr_use_tucker: [false],
    lokr_use_scalar: [false],
    lokr_weight_decompose: [true]
  });

  /** @public Start read-only status observation on view activation. */
  ngOnInit(): void { this.training.begin(); }

  /** @public Stop polling when navigating away. */
  ngOnDestroy(): void { this.training.pause(); }

  /** @public Change algorithm and reapply only its recommended initial learning parameters. */
  changeMode(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.value !== "lora" && target.value !== "lokr") return;
    this.mode.set(target.value);
    this.form.patchValue({
      output_dir: target.value === "lora" ? "./lora_output" : "./lokr_output",
      learning_rate: target.value === "lora" ? 0.0001 : 0.03,
      train_epochs: target.value === "lora" ? 10 : 500
    });
    this.confirming.set(null);
  }

  /** @public Scan the chosen folder on the server, not a local browser path. */
  async scanDataset(): Promise<void> {
    if (this.dataset.invalid) { this.dataset.markAllAsTouched(); return; }
    const val = this.dataset.getRawValue();
    await this.training.scanDataset(val.audio_dir, val.dataset_name, val.all_instrumental);
  }

  /** @public Validate preprocessed tensor directory on the Python server. */
  async validateTensors(): Promise<void> {
    const path = this.form.controls.tensor_dir.value.trim();
    if (!path) { this.error.set("Enter a tensor directory on the backend machine."); return; }
    this.confirming.set(null);
    this.error.set(null);
    await this.training.validateTensors(path);
  }

  /**
   * @public Double-confirm training start after validating exact server tensors.
   * @remarks Any subsequent parameter change invalidates the confirmation signature.
   */
  async start(): Promise<void> {
    this.error.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.backend.health()?.status !== "ok") {
      this.error.set("Connect a running ACE-Step API first."); return;
    }
    const values = this.form.getRawValue();
    try {
      const request = mapTrainingRequest(values, this.mode());
      if (this.training.tensorInfo()?.tensor_dir !== request.tensor_dir) {
        this.error.set("Validate the selected tensor directory before training."); return;
      }
      const signature = JSON.stringify({ mode: this.mode(), request });
      if (this.confirming() !== signature) {
        this.confirming.set(signature);
        return;
      }
      await this.training.start(this.mode(), request);
      this.confirming.set(null);
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Cannot start training.");
    }
  }

  /** @public Confirm a graceful stop request separately from generation cancellation. */
  async stop(): Promise<void> {
    if (!this.stopConfirm()) { this.stopConfirm.set(true); return; }
    this.stopConfirm.set(false);
    await this.training.requestStop();
  }
}
