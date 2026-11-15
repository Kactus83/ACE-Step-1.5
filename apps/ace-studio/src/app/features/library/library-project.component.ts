/**
 * @module library-project-component
 * @remarks Project metadata editor and searchable collection of audio references.
 * @public
 */
import { Component, computed, inject, input, output, signal } from "@angular/core";
import { LibraryStore } from "./library.store";
import { LibraryProject } from "./library.types";
import { LibraryTrackComponent } from "./library-track.component";

/** @public Project workspace with explicit edit and double-confirm delete actions. */
@Component({
  selector: "ace-library-project",
  standalone: true,
  imports: [LibraryTrackComponent],
  templateUrl: "./library-project.component.html"
})
export class LibraryProjectComponent {
  readonly project = input.required<LibraryProject>();
  readonly navigateCreate = output<void>();
  readonly removed = output<string>();
  readonly catalog = inject(LibraryStore);
  readonly filter = signal("");
  readonly editing = signal(false);
  readonly confirmingDelete = signal(false);
  readonly projectName = signal("");
  readonly description = signal("");
  readonly visible = computed(() => {
    const query = this.filter().trim().toLowerCase();
    return this.project().tracks.filter(track => !query
      || track.title.toLowerCase().includes(query)
      || track.note.toLowerCase().includes(query)
      || track.tags.some(tag => tag.toLowerCase().includes(query)));
  });

  /** @public Stage editable project details without implicit storage writes. */
  beginEdit(): void {
    this.projectName.set(this.project().name);
    this.description.set(this.project().description);
    this.editing.set(true);
  }

  /** @public Capture a form field while preserving the typed signal API. */
  changed(event: Event, field: "name" | "description" | "filter"): void {
    const el = event.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
    if (field === "name") this.projectName.set(el.value);
    else if (field === "description") this.description.set(el.value);
    else this.filter.set(el.value);
  }

  /** @public Persist explicit project renaming and notes, if valid. */
  save(): void {
    if (this.catalog.editProject(this.project().id, this.projectName(),
      this.description())) this.editing.set(false);
  }

  /** @public Two-click local deletion; does not touch ACE-Step output files. */
  remove(): void {
    if (!this.confirmingDelete()) { this.confirmingDelete.set(true); return; }
    const id = this.project().id;
    if (this.catalog.removeProject(id)) this.removed.emit(id);
    this.confirmingDelete.set(false);
  }
}

