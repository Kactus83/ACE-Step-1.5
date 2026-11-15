/**
 * @module create-component
 * @remarks Generation studio: typed reactive form, explicit model controls, actual job submission.
 * @public
 */
import { Component, OnInit, computed, inject, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { startWith } from "rxjs";
import { BackendClient } from "../../core/backend.client";
import { BackendStore } from "../../core/backend.store";
import { GenerateRequest, TaskType } from "../../core/api.types";
import { JobsStore } from "../../core/jobs.store";
import { WorkflowStore } from "../../core/workflow.store";

/** @public Primary creation form, shared by web and desktop. */
@Component({
  selector: "ace-create",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./create.component.html"
})
export class CreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(BackendClient);
  readonly backend = inject(BackendStore);
  readonly jobs = inject(JobsStore);
  readonly workflow = inject(WorkflowStore);
  readonly showJobs = output<void>();
  readonly source = signal<File | null>(null);
  readonly reference = signal<File | null>(null);
  readonly error = signal<string | null>(null);
  readonly importName = computed(() => this.workflow.draft()?.source.prompt || "Generated track");

  readonly form = this.fb.nonNullable.group({
    track_name: ["", [Validators.maxLength(120)]],
    prompt: ["", [Validators.required, Validators.maxLength(5000)]],
    lyrics: [""],
    instrumental: [true],
    task_type: ["text2music"],
    model: [""],
    thinking: [false],
    use_format: [false],
    duration: [180, [Validators.min(10), Validators.max(600)]],
    bpm: [0, [Validators.min(0), Validators.max(300)]],
    key_scale: [""],
    time_signature: [""],
    vocal_language: ["en"],
    inference_steps: [8, [Validators.min(1), Validators.max(200)]],
    guidance_scale: [7, [Validators.min(0), Validators.max(30)]],
    batch_size: [1, [Validators.min(1), Validators.max(8)]],
    seed: [-1],
    use_random_seed: [true],
    audio_cover_strength: [1, [Validators.min(0), Validators.max(1)]],
    repainting_start: [0, [Validators.min(0)]],
    repainting_end: [30, [Validators.min(0)]],
    audio_format: ["mp3"]
  });
  private readonly changes = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() }
  );
  readonly selectedMode = computed(() => this.changes().task_type || "text2music");
  readonly selectedModel = computed(() => this.changes().model || "");
  readonly supportedModes = computed<readonly TaskType[]>(() => {
    const current = this.backend.inventory()?.models.find(
      item => item.name === this.selectedModel()
    );
    const tasks = current?.supported_task_types || ["text2music"];
    return (["text2music", "cover", "repaint", "lego", "extract", "complete"] as TaskType[])
      .filter(mode => tasks.includes(mode) || mode === "text2music");
  });

  /** @public Apply a previously generated track as an editing source. */
  ngOnInit(): void {
    const draft = this.workflow.draft();
    if (!draft) return;
    this.form.patchValue({
      task_type: draft.mode,
      prompt: draft.source.prompt || "",
      lyrics: draft.source.lyrics || "",
      instrumental: false
    });
  }

  /**
   * @public Store user-selected audio locally until a generation is submitted.
   * @throws Never: invalid files set a visible form error.
   */
  pickAudio(event: Event, kind: "source" | "reference"): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0) || null;
    if (file && (file.size > 120 * 1024 * 1024
      || !(file.type.startsWith("audio/") || /\.(wav|mp3|flac|ogg|m4a)$/i.test(file.name)))) {
      this.error.set("Use an audio file under 120 MB (WAV, MP3, FLAC, OGG or M4A).");
      target.value = "";
      return;
    }
    this.error.set(null);
    if (kind === "source") {
      this.source.set(file);
      if (file) this.workflow.clear();
    } else this.reference.set(file);
  }

  /** @public Prepare an explicitly acknowledged generation request. */
  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.backend.health()?.status !== "ok") {
      this.error.set("Connect a running ACE-Step API before generating.");
      return;
    }
    const value = this.form.getRawValue();
    const mode = value.task_type as TaskType;
    if (!this.supportedModes().includes(mode)) {
      this.error.set("The selected model does not advertise this mode."); return;
    }
    let sourceFile = this.source();
    if (mode !== "text2music" && !sourceFile && !this.workflow.draft()) {
      this.error.set("Select a source audio file for this mode."); return;
    }
    const request: GenerateRequest = {
      prompt: value.prompt.trim(),
      lyrics: value.instrumental ? "[inst]" : value.lyrics,
      task_type: mode,
      model: value.model || undefined,
      thinking: value.thinking,
      use_format: value.use_format,
      track_name: value.track_name || undefined,
      audio_duration: value.duration,
      bpm: value.bpm || undefined,
      key_scale: value.key_scale || undefined,
      time_signature: value.time_signature || undefined,
      vocal_language: value.vocal_language || "en",
      inference_steps: value.inference_steps,
      guidance_scale: value.guidance_scale,
      batch_size: value.batch_size,
      use_random_seed: value.use_random_seed,
      seed: value.use_random_seed ? -1 : value.seed,
      audio_cover_strength: value.audio_cover_strength,
      repainting_start: value.repainting_start,
      repainting_end: value.repainting_end,
      audio_format: value.audio_format as GenerateRequest["audio_format"]
    };
    this.error.set(null);
    try {
      const draft = this.workflow.draft();
      if (mode !== "text2music" && !sourceFile && draft) {
        const blob = await this.api.audio(draft.source.file);
        sourceFile = new File([blob], "ace-result.wav", { type: blob.type || "audio/wav" });
      }
      await this.jobs.submit(request, sourceFile || undefined, this.reference() || undefined);
      if (this.jobs.error()) { this.error.set(this.jobs.error()); return; }
      this.showJobs.emit();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Unable to prepare generation.");
    }
  }
}
