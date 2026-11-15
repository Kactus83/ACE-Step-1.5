/**
 * @module repaint-timeline-component
 * @remarks Optional client-side waveform, preserving accessible numeric fallback.
 * @public
 */
import { Component, computed, input, output, signal } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { clampRepaintRange, waveformPeaks } from "./waveform.peaks";

/** @public User-triggered source waveform and bounded repaint interval controls. */
@Component({
  selector: "ace-repaint-timeline",
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: "./repaint-timeline.component.html"
})
export class RepaintTimelineComponent {
  readonly file = input<File | null>(null);
  readonly start = input(0);
  readonly end = input(30);
  readonly rangeChange = output<{ start: number; end: number }>();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly loadedFile = signal<File | null>(null);
  readonly duration = signal(0);
  readonly peaks = signal<readonly number[]>([]);
  readonly ready = computed(() => this.file() && this.loadedFile() === this.file());

  /**
   * @public Decode on explicit request, never uploading or persisting source audio.
   * @remarks A failed codec gracefully leaves the numeric editor usable.
   */
  async decode(): Promise<void> {
    const file = this.file();
    if (!file || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    let context: AudioContext | undefined;
    try {
      context = new AudioContext();
      const decoded = await context.decodeAudioData(await file.arrayBuffer());
      if (this.file() !== file) return;
      this.duration.set(decoded.duration);
      this.peaks.set(waveformPeaks(decoded.getChannelData(0)));
      this.loadedFile.set(file);
      this.rangeChange.emit(clampRepaintRange(this.start(), this.end(), decoded.duration));
    } catch (error: unknown) {
      if (this.file() === file) {
        this.error.set(error instanceof Error ? error.message : "Could not decode this audio.");
      }
    } finally {
      if (context) await context.close().catch(() => undefined);
      this.loading.set(false);
    }
  }

  /** @public Set the beginning of the region, retaining nonzero selection length. */
  selectStart(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !this.ready()) return;
    this.rangeChange.emit(clampRepaintRange(
      Number(target.value), this.end(), this.duration()));
  }

  /** @public Set the region end, retaining the existing beginning if possible. */
  selectEnd(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !this.ready()) return;
    this.rangeChange.emit(clampRepaintRange(
      this.start(), Number(target.value), this.duration()));
  }
}


