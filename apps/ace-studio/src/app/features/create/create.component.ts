/**
 * @module create-component
 * @remarks Generation studio: typed reactive form, explicit model controls, actual job submission.
 * @public
 */
import { Component, OnInit, computed, inject, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RepaintTimelineComponent } from "./repaint-timeline.component";
import { audioBlobToSourceFile } from "./source-audio";
import { createGenerationForm } from "./create.form";
import { toSignal } from "@angular/core/rxjs-interop";
import { startWith } from "rxjs";
import { BackendClient } from "../../core/backend.client";
import { BackendStore } from "../../core/backend.store";
import { TaskType } from "../../core/api.types";
import { ConnectionStore } from "../../core/connection.store";
import { mapGenerateRequest, TRACK_NAMES } from "./create.request";
import { restoreGenerateRequest } from "./restore-request";
import { JobsStore } from "../../core/jobs.store";
import { WorkflowStore } from "../../core/workflow.store";
import { CreatePresetsComponent } from "./create-presets.component";
import { CreateExpertComponent } from "./create-expert.component";
import { CreateSourceEditComponent } from "./create-source-edit.component";

/** @public Primary creation form, shared by web and desktop. */
@Component({
  selector: "ace-create",
  standalone: true,
  imports: [ReactiveFormsModule, RepaintTimelineComponent, CreatePresetsComponent, CreateExpertComponent, CreateSourceEditComponent],
  templateUrl: "./create.component.html"
})
export class CreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(BackendClient);
  private readonly connection = inject(ConnectionStore);
  readonly backend = inject(BackendStore);
  readonly jobs = inject(JobsStore);
  readonly workflow = inject(WorkflowStore);
  readonly stems = TRACK_NAMES;
  readonly showJobs = output<void>();
  readonly source = signal<File | null>(null);
  readonly reference = signal<File | null>(null);
  readonly error = signal<string | null>(null);
  readonly pendingDcwConfirmation = signal<string | null>(null);
  readonly pendingSampleConfirmation = signal<string | null>(null);
  readonly importName = computed(() => this.workflow.draft()?.source.prompt || "Generated track");

  readonly form = createGenerationForm(this.fb);
  readonly changes = toSignal(
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
    const staged = this.workflow.takeSettings();
    if (staged) {
      this.resetMedia();
      this.form.patchValue(restoreGenerateRequest(staged.request, staged.title));
      this.error.set(staged.originalMediaRequired
        ? "Original source/reference audio is not stored. Reattach media before generating."
        : "Generation settings and reported seed restored. Review before generating.");
      return;
    }
    const codes = this.workflow.takeCodes();
    if (codes) {
      this.resetMedia();
      this.form.patchValue({
        task_type: "text2music", sample_mode: false,
        thinking: false, audio_code_string: codes.codes
      });
      this.error.set("Semantic audio codes loaded. Enter a music description and review settings before generating.");
      return;
    }
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

  /** @public Synchronize the visual range selection with the advanced time inputs. */
  setRepaintRange(range: { start: number; end: number }): void {
    this.form.patchValue({
      repainting_start: range.start, repainting_end: range.end
    });
  }

  /** @public Explicitly retrieve an older generated track for local waveform inspection. */
  async loadDraftSource(): Promise<void> {
    const draft = this.workflow.draft();
    if (!draft || !draft.source.file) return;
    this.error.set(null);
    try {
      const blob = await this.api.audio(draft.source.file);
      this.source.set(audioBlobToSourceFile(blob, draft.source.file));
      this.workflow.clear();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Unable to load generated source.");
    }
  }

  /** @public Drop only transient source/reference media when restoring a preset. */
  resetMedia(): void {
    this.source.set(null);
    this.reference.set(null);
    this.workflow.clear();
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
    if (request.dcw_enabled === true) {
      const fingerprint = JSON.stringify({ revision: this.connection.revision(), value });
      if (this.pendingDcwConfirmation() !== fingerprint) {
        this.pendingDcwConfirmation.set(fingerprint);
        this.error.set("Forced DCW can distort non-turbo models. Review the warning and submit again to confirm.");
        return;
      }
    }
    this.pendingDcwConfirmation.set(null);
    if (request.sample_mode && !this.backend.inventory()?.llm_initialized) {
      const fingerprint = JSON.stringify({ revision: this.connection.revision(), value });
      if (this.pendingSampleConfirmation() !== fingerprint) {
        this.pendingSampleConfirmation.set(fingerprint);
        this.error.set("Sample mode may initialize the 5Hz language model and consume GPU memory. Submit again to confirm.");
        return;
      }
    }
    this.pendingSampleConfirmation.set(null);
    this.error.set(null);
    try {
      const draft = this.workflow.draft();
      if (mode !== "text2music" && !sourceFile && draft) {
        const blob = await this.api.audio(draft.source.file);
        sourceFile = audioBlobToSourceFile(blob, draft.source.file);
      }
      await this.jobs.submit(request, sourceFile || undefined,
        this.reference() || undefined,
        value.track_name.trim() || (request.sample_mode ? value.prompt.trim().slice(0, 72) : undefined));
      if (this.jobs.error()) { this.error.set(this.jobs.error()); return; }
      this.showJobs.emit();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Unable to prepare generation.");
    }
  }
}
