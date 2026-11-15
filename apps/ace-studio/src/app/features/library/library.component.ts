/**
 * @module library-component
 * @remarks Local project index, explicit JSON import/export and searchable navigation.
 * @public
 */
import { Component, computed, inject, output, signal } from "@angular/core";
import { LibraryStore } from "./library.store";
import { LibraryProjectComponent } from "./library-project.component";

/** @public User-controlled local project library, never an implicit cloud backup. */
@Component({
  selector: "ace-library",
  standalone: true,
  imports: [LibraryProjectComponent],
  templateUrl: "./library.component.html"
})
export class LibraryComponent {
  readonly catalog = inject(LibraryStore);
  readonly navigateCreate = output<void>();
  readonly selectedId = signal<string | null>(null);
  readonly query = signal("");
  readonly newName = signal("");
  readonly error = signal<string | null>(null);
  readonly selected = computed(() =>
    this.catalog.projects().find(item => item.id === this.selectedId()) || null
  );
  readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.catalog.projects().filter(project => !q
      || project.name.toLowerCase().includes(q)
      || project.description.toLowerCase().includes(q)
      || project.tracks.some(track => track.title.toLowerCase().includes(q)
        || track.tags.some(tag => tag.toLowerCase().includes(q))));
  });

  /** @public Update client-only project search. */
  setQuery(event: Event): void {
    const element = event.target;
    if (element instanceof HTMLInputElement) this.query.set(element.value);
  }

  /** @public Update the proposed project title before explicit creation. */
  setNewName(event: Event): void {
    const element = event.target;
    if (element instanceof HTMLInputElement) this.newName.set(element.value);
  }

  /** @public Create a persistent local project, then focus it in the workspace. */
  create(): void {
    const id = this.catalog.create(this.newName());
    if (id) {
      this.newName.set("");
      this.selectedId.set(id);
      this.error.set(null);
    }
  }

  /** @public Show one project and its original-server audio references. */
  select(id: string): void { this.selectedId.set(id); }

  /** @public Export the current local catalog as an explicit JSON download. */
  export(): void { this.catalog.exportJson(); }

  /**
   * @public Validate a user-supplied JSON file before an additive import.
   * @remarks Input is limited to 1.5 MB; imports never overwrite existing projects.
   */
  async import(event: Event): Promise<void> {
    const el = event.target;
    if (!(el instanceof HTMLInputElement)) return;
    const file = el.files?.item(0) || null;
    el.value = "";
    if (!file) return;
    if (file.size > 1_500_000) {
      this.error.set("Choose an archive smaller than 1.5 MB."); return;
    }
    try {
      const contents = await file.text();
      if (!this.catalog.importJson(contents)) {
        this.error.set(this.catalog.error());
        return;
      }
      this.error.set(null);
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Could not import JSON.");
    }
  }

  /** @public Clear the selection after a project was explicitly deleted. */
  removed(id: string): void {
    if (this.selectedId() === id) this.selectedId.set(null);
  }
}

