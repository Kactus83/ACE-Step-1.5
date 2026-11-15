/**
 * @module app-component
 * @remarks Shared application shell for the standalone Angular and Tauri modes.
 * @public
 */
import { Component, OnInit, inject, signal } from "@angular/core";
import { BackendStore } from "./core/backend.store";
import { JobsStore } from "./core/jobs.store";
import { CreateComponent } from "./features/create/create.component";
import { JobsComponent } from "./features/results/jobs.component";
import { ConnectionComponent } from "./features/system/connection.component";
import { TrainingComponent } from "./features/training/training.component";
import { DatasetComponent } from "./features/datasets/dataset.component";
import { LibraryComponent } from "./features/library/library.component";
import { ThemeStore } from "./core/theme.store";

type Section = "create" | "jobs" | "library" | "datasets" | "training" | "system";

/** @public Main accessible, responsive shell. */
@Component({
  selector: "ace-root",
  standalone: true,
  imports: [CreateComponent, JobsComponent, LibraryComponent, DatasetComponent, TrainingComponent, ConnectionComponent],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
  readonly backend = inject(BackendStore);
  readonly theme = inject(ThemeStore);
  readonly jobs = inject(JobsStore);
  readonly section = signal<Section>("create");

  /** @public Check an existing engine without starting Python or loading a model. */
  ngOnInit(): void { void this.backend.refresh(); }

  /** @public Navigate between always-shared Angular features. */
  navigate(destination: Section): void { this.section.set(destination); }
}


