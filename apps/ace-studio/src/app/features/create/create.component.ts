/**
 * @module create-component
 * @remarks Generation studio: typed reactive form, explicit model controls, actual job submission.
 * @public
 */
import { Component, OnInit, computed, inject, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { createGenerationForm } from "./create.form";
import { toSignal } from "@angular/core/rxjs-interop";
import { startWith } from "rxjs";
import { BackendClient } from "../../core/backend.client";
import { BackendStore } from "../../core/backend.store";
import { TaskType } from "../../core/api.types";
import { mapGenerateRequest, TRACK_NAMES } from "./create.request";
import { JobsStore } from "../../core/jobs.store";
import { WorkflowStore } from "../../core/workflow.store";
import { PresetsStore } from "../../core/presets.store";

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
  readonly presets = inject(PresetsStore);
  readonly stems = TRACK_NAMES;
  readonly presetName = signal("");
  readonly selectedPresetId = signal("");
  readonly deletingPreset = signal(false);
  readonly showJobs = output<void>();
  readonly source = signal<File | null>(null);
  readonly reference = signal<File | null>(null);
  readonly error = signal<string | null>(null);
  readonly importName = computed(() => this.workflow.draft()?.source.prompt || "Generated track");

  readonly form = createGenerationForm(this.fb);
  private readonly changes = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() }
  );
  readonly selectedMode = computed(() => this.changes().task_type || "text2music");
  readonly selectedModel = computed(() => this.changes().model || "");
  readonly supportedModes = computed<readonly TaskType[]>(() => {
    const selected = this.selectedModel() || this.backend.inventory()?.default_model;
    const current = this.backend.inventory()?.models.find(item => item.name === selected);
    const tasks = current?.supported_task_types || ["text2music"];
    return (["text2music", "cover", "repaint", "extract", "lego", "complete"] as TaskType[])
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

  /** @public Stage a title for the next local preset. */
  changePresetName(event: Event): void {
    const element = event.target;
    if (element instanceof HTMLInputElement) this.presetName.set(element.value);
  }

  /** @public Select a previously saved set of generation parameters. */
  selectPreset(event: Event): void {
    const element = event.target;
    if (element instanceof HTMLSelectElement) {
      this.selectedPresetId.set(element.value);
      this.deletingPreset.set(false);
    }
  }

  /** @public Save current form parameters without any media or credential. */
  savePreset(): void {
    this.error.set(null);
    try {
      const preset = this.presets.save(this.presetName(), this.form.getRawValue());
      this.selectedPresetId.set(preset.id);
      this.presetName.set("");
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Unable to save preset.");
    }
  }

  /** @public Restore a saved form snapshot without stale audio references. */
  restorePreset(): void {
    const selected = this.presets.get(this.selectedPresetId());
    if (!selected) return;
    this.source.set(null);
    this.reference.set(null);
    this.workflow.clear();
    this.form.patchValue(
      selected.fields as unknown as Parameters<typeof this.form.patchValue>[0]
    );
    this.error.set(null);
  }

  /** @public Require a second explicit click before permanently deleting a preset. */
  deletePreset(): void {
    const id = this.selectedPresetId();
    if (!id) return;
    if (!this.deletingPreset()) { this.deletingPreset.set(true); return; }
    this.presets.remove(id);
    this.selectedPresetId.set("");
    this.deletingPreset.set(false);
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
    if (mode === "repaint" && value.repainting_end <= value.repainting_start) {
      this.error.set("Repaint end must be greater than its start time.");
      return;
    }
    let request;
    try { request = mapGenerateRequest(value); }
    catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Invalid generation settings.");
      return;
    }
    this.error.set(null);
    try {
      const draft = this.workflow.draft();
      if (mode !== "text2music" && !sourceFile && draft) {
        const blob = await this.api.audio(draft.source.file);
        const mime = blob.type.toLowerCase();
        const extension = mime.includes("mpeg") ? "mp3" : mime.includes("flac") ? "flac"
          : mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "audio";
        sourceFile = new File([blob], "ace-result." + extension, {
          type: blob.type || "application/octet-stream"
        });
      }
      await this.jobs.submit(request, sourceFile || undefined, this.reference() || undefined);
      if (this.jobs.error()) { this.error.set(this.jobs.error()); return; }
      this.showJobs.emit();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Unable to prepare generation.");
    }
  }
}



