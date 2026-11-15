/**
 * @module audio-card
 * @remarks Read-only result player. Authenticated audio is only fetched on user action.
 * @public
 */
import { Component, inject, input, output, signal } from "@angular/core";
import { GeneratedAudio } from "../../core/api.types";
import { AudioService } from "../../core/audio.service";
import { ResultMetadataComponent } from "./result-metadata.component";

/** @public A result preview, metadata and workflow reuse controls. */
@Component({
  selector: "ace-audio-card",
  standalone: true,
  imports: [ResultMetadataComponent],
  templateUrl: "./audio-card.component.html"
})
export class AudioCardComponent {
  private readonly audio = inject(AudioService);
  readonly result = input.required<GeneratedAudio>();
  readonly index = input<number>(1);
  /** @public Only jobs with memory-resident requests can restore settings. */
  readonly canRestore = input(false);
  /** @public Request user-controlled settings restoration, not a GPU launch. */
  readonly restoreRequested = output<void>();
  /** @public Selected backend edit mode emitted only after a real audio result exists. */
  readonly reuseRequested = output<"cover" | "repaint">();
  readonly previewUrl = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** @public Fetch an authenticated Blob for standard browser playback. */
  async loadPreview(): Promise<void> {
    if (!this.result().file || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    try { this.previewUrl.set(await this.audio.preview(this.result().file)); }
    catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Audio preview unavailable.");
    } finally { this.loading.set(false); }
  }

  /** @public Explicit download; no arbitrary remote origins or file paths are accepted. */
  async download(): Promise<void> {
    if (!this.result().file) return;
    this.error.set(null);
    try { await this.audio.download(this.result().file, "ace-track-" + this.index() + ".mp3"); }
    catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Download failed.");
    }
  }
}


