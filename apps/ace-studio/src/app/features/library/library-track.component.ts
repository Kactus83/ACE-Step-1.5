/**
 * @module library-track-component
 * @remarks Local track metadata and optional audio interactions from its original backend.
 * @public
 */
import { Component, computed, inject, input, output, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { ConnectionStore } from "../../core/connection.store";
import { WorkflowStore } from "../../core/workflow.store";
import { LibraryStore } from "./library.store";
import { LocaleStore } from "../../core/locale.store";
import { LibraryTrack } from "./library.types";
import { AudioCardComponent } from "../results/audio-card.component";

/** @public Stored audio reference with explicit annotation and deletion controls. */
@Component({
  selector: "ace-library-track",
  standalone: true,
  imports: [AudioCardComponent, DatePipe],
  templateUrl: "./library-track.component.html"
})
export class LibraryTrackComponent {
  private readonly connection = inject(ConnectionStore);
  private readonly workflow = inject(WorkflowStore);
  readonly library = inject(LibraryStore);
  readonly locale = inject(LocaleStore);
  readonly projectId = input.required<string>();
  readonly track = input.required<LibraryTrack>();
  readonly navigateCreate = output<void>();
  readonly sameBackend = computed(() => this.track().backend === this.connection.endpoint());
  readonly editing = signal(false);
  readonly note = signal("");
  readonly tags = signal("");
  readonly favorite = signal(false);
  readonly confirmingRemove = signal(false);

  /** @public Stage non-destructive editing of local notes and classification. */
  beginEdit(): void {
    this.note.set(this.track().note);
    this.tags.set(this.track().tags.join(", "));
    this.favorite.set(this.track().favorite);
    this.editing.set(true);
  }

  /** @public Read a note/tags field from a user event without accessing audio bytes. */
  setField(event: Event, field: "note" | "tags"): void {
    const el = event.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
    if (field === "note") this.note.set(el.value);
    else this.tags.set(el.value);
  }

  /** @public Save local annotation; never send it to the Python API. */
  save(): void {
    if (this.library.editTrack(this.projectId(), this.track().id, {
      note: this.note(), tags: this.tags(), favorite: this.favorite()
    })) this.editing.set(false);
  }

  /** @public Toggle favorite status without modifying backend metadata. */
  toggleFavorite(): void {
    this.library.editTrack(this.projectId(), this.track().id, {
      note: this.track().note, tags: this.track().tags.join(", "),
      favorite: !this.track().favorite
    });
  }

  /** @public Reuse audio only when connected to the same server origin. */
  reuse(mode: "cover" | "repaint"): void {
    if (!this.sameBackend()) return;
    this.workflow.useAudio(this.track().result, mode);
    this.navigateCreate.emit();
  }

  /** @public Remove only the local bookmark after a second explicit click. */
  remove(): void {
    if (!this.confirmingRemove()) { this.confirmingRemove.set(true); return; }
    this.library.removeTrack(this.projectId(), this.track().id);
    this.confirmingRemove.set(false);
  }
}



