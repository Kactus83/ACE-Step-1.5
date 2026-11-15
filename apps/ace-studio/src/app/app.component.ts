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

type Section = "create" | "jobs" | "system";

/** @public Main accessible, responsive shell. */
@Component({
  selector: "ace-root",
  standalone: true,
  imports: [CreateComponent, JobsComponent, ConnectionComponent],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
  readonly backend = inject(BackendStore);
  readonly jobs = inject(JobsStore);
  readonly section = signal<Section>("create");

  /** @public Check an existing engine without starting Python or loading a model. */
  ngOnInit(): void { void this.backend.refresh(); }

  /** @public Navigate between always-shared Angular features. */
  navigate(destination: Section): void { this.section.set(destination); }
}
