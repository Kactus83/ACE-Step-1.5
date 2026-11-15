/**
 * @module comparison-component
 * @remarks A/B reference audition using authenticated, backend-owned audio files.
 * @public
 */
import { Component, ElementRef, computed, inject, signal, viewChild } from "@angular/core";
import { AudioService } from "../../core/audio.service";
import { ConnectionStore } from "../../core/connection.store";
import { JobsStore } from "../../core/jobs.store";
import { LibraryStore } from "../library/library.store";
import { comparisonOptions } from "./comparison-options";

/** @public Two-channel comparison UI with optional approximately aligned playback. */
@Component({
  selector: "ace-comparison",
  standalone: true,
  templateUrl: "./comparison.component.html"
})
export class ComparisonComponent {
  private readonly audio = inject(AudioService);
  private readonly connection = inject(ConnectionStore);
  private readonly jobs = inject(JobsStore);
  private readonly library = inject(LibraryStore);
  private readonly playerA = viewChild<ElementRef<HTMLAudioElement>>("playerA");
  private readonly playerB = viewChild<ElementRef<HTMLAudioElement>>("playerB");

  readonly options = computed(() => comparisonOptions(
    this.jobs.jobs(), this.library.projects(), this.connection.endpoint()));
  readonly selectedA = signal("");
  readonly selectedB = signal("");
  readonly a = computed(() => this.options().find(item => item.id === this.selectedA()) || null);
  readonly b = computed(() => this.options().find(item => item.id === this.selectedB()) || null);
  readonly urlA = signal<string | null>(null);
  readonly urlB = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** @public Change an A/B slot without eagerly requesting remote audio. */
  select(event: Event, slot: "A" | "B"): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    this.stop();
    this.error.set(null);
    this.urlA.set(null);
    this.urlB.set(null);
    if (slot === "A") this.selectedA.set(target.value);
    else this.selectedB.set(target.value);
  }

  /**
   * @public Fetch both selected tracks via the authenticated audio adapter.
   * @remarks Rejects stale responses after backend or selection changes.
   */
  async load(): Promise<void> {
    if (!this.a() || !this.b() || this.loading()) return;
    const choiceA = this.a()!, choiceB = this.b()!;
    if (choiceA.file === choiceB.file) {
      this.error.set("Choose two different audio files for comparison."); return;
    }
    const revision = this.connection.revision();
    this.loading.set(true);
    this.error.set(null);
    try {
      const [urlA, urlB] = await Promise.all([
        this.audio.preview(choiceA.file), this.audio.preview(choiceB.file)
      ]);
      if (revision !== this.connection.revision()
        || this.a()?.id !== choiceA.id || this.b()?.id !== choiceB.id) return;
      this.urlA.set(urlA);
      this.urlB.set(urlB);
    } catch (error: unknown) {
      if (revision === this.connection.revision()) this.error.set(
        error instanceof Error ? error.message : "Cannot load comparison audio.");
    } finally { this.loading.set(false); }
  }

  /** @public Audition one channel, pausing the other. */
  async audition(slot: "A" | "B"): Promise<void> {
    const active = slot === "A" ? this.playerA()?.nativeElement : this.playerB()?.nativeElement;
    const other = slot === "A" ? this.playerB()?.nativeElement : this.playerA()?.nativeElement;
    if (!active) return;
    other?.pause();
    this.error.set(null);
    try { await active.play(); }
    catch { this.error.set("Playback was blocked or the audio file has expired."); }
  }

  /**
   * @public Start both audio elements at a shared time zero, approximately aligned.
   * @remarks HTMLMediaElement is not a sample-accurate synchronized mixer.
   */
  async playTogether(): Promise<void> {
    const a = this.playerA()?.nativeElement, b = this.playerB()?.nativeElement;
    if (!a || !b) return;
    this.stop();
    a.currentTime = 0;
    b.currentTime = 0;
    this.error.set(null);
    try { await Promise.all([a.play(), b.play()]); }
    catch {
      this.stop();
      this.error.set("Synchronized audition is unavailable for these tracks.");
    }
  }

  /** @public Pause both local elements without altering the Python jobs. */
  stop(): void {
    this.playerA()?.nativeElement.pause();
    this.playerB()?.nativeElement.pause();
  }
}

