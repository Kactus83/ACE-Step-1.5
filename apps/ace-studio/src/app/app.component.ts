/**
 * @module app-component
 * @remarks Shared application shell for the standalone Angular and Tauri modes.
 * @public
 */
import { Component, HostListener, OnInit, inject, signal } from "@angular/core";
import { BackendStore } from "./core/backend.store";
import { JobsStore } from "./core/jobs.store";
import { CreateComponent } from "./features/create/create.component";
import { JobsComponent } from "./features/results/jobs.component";
import { ConnectionComponent } from "./features/system/connection.component";
import { TrainingComponent } from "./features/training/training.component";
import { DatasetComponent } from "./features/datasets/dataset.component";
import { LibraryComponent } from "./features/library/library.component";
import { AnalysisComponent } from "./features/analysis/analysis.component";
import { ThemeStore } from "./core/theme.store";
import { StudioSection, isEditingElement, resolveStudioShortcut } from "./core/keyboard-shortcuts";

type Section = StudioSection;

/** @public Main accessible, responsive shell. */
@Component({
  selector: "ace-root",
  standalone: true,
  imports: [CreateComponent, JobsComponent, LibraryComponent, AnalysisComponent, DatasetComponent, TrainingComponent, ConnectionComponent],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
  readonly backend = inject(BackendStore);
  readonly theme = inject(ThemeStore);
  readonly jobs = inject(JobsStore);
  readonly section = signal<Section>("create");
  readonly shortcutsOpen = signal(false);

  /** @public Check an existing engine without starting Python or loading a model. */
  ngOnInit(): void { void this.backend.refresh(); }

  /** @public Route documented shortcuts without hijacking editable fields. */
  @HostListener("window:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.shortcutsOpen()) {
      this.shortcutsOpen.set(false);
      return;
    }
    if (isEditingElement(event.target)) return;
    if (event.key === "?" && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.shortcutsOpen.update(value => !value);
      return;
    }
    const destination = resolveStudioShortcut(event);
    if (!destination) return;
    event.preventDefault();
    this.navigate(destination);
  }

  /** @public Show or hide nonmodal keyboard help. */
  toggleShortcuts(): void { this.shortcutsOpen.update(value => !value); }

  /** @public Navigate between always-shared Angular features. */
  navigate(destination: Section): void { this.section.set(destination); }
}




