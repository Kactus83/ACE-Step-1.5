/**
 * @module library-save-component
 * @remarks Deliberate save-to-project action on a successful server audio result.
 * @public
 */
import { Component, inject, input, signal } from "@angular/core";
import { GeneratedAudio, StudioJob } from "../../core/api.types";
import { LibraryStore } from "./library.store";
import { LocaleStore } from "../../core/locale.store";

/** @public Choose a local project; no automatic audio or prompt persistence. */
@Component({
  selector: "ace-library-save",
  standalone: true,
  templateUrl: "./library-save.component.html"
})
export class LibrarySaveComponent {
  readonly library = inject(LibraryStore);
  readonly locale = inject(LocaleStore);
  readonly job = input.required<StudioJob>();
  readonly result = input.required<GeneratedAudio>();
  readonly variant = input.required<number>();
  readonly selected = signal("");
  readonly saved = signal(false);

  /** @public Choose a project without touching persisted data yet. */
  choose(event: Event): void {
    const el = event.target;
    if (el instanceof HTMLSelectElement) {
      this.selected.set(el.value);
      this.saved.set(false);
    }
  }

  /** @public Explicitly bookmark this variant and its creative metadata. */
  save(): void {
    if (this.library.add(this.selected(), this.job(), this.result(), this.variant())) {
      this.saved.set(true);
    }
  }
}


