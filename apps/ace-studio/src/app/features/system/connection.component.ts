/**
 * @module connection-component
 * @remarks Explicit, session-secure API connection settings and model operations.
 * @public
 */
import { Component, inject, signal } from "@angular/core";
import { BackendStore } from "../../core/backend.store";
import { ConnectionStore } from "../../core/connection.store";
import { JobsStore } from "../../core/jobs.store";
import { AudioService } from "../../core/audio.service";
import { WorkflowStore } from "../../core/workflow.store";
import { DatasetStore } from "../datasets/dataset.store";
import { DatasetTasksStore } from "../datasets/dataset.tasks.store";
import { TrainingStore } from "../training/training.store";
import { ModelManagerComponent } from "./model-manager.component";

/** @public Backend connection, session token and explicit model loading UI. */
@Component({
  selector: "ace-connection",
  standalone: true,
  imports: [ModelManagerComponent],
  templateUrl: "./connection.component.html"
})
export class ConnectionComponent {
  private readonly connection = inject(ConnectionStore);
  private readonly audio = inject(AudioService);
  private readonly workflow = inject(WorkflowStore);
  private readonly dataset = inject(DatasetStore);
  private readonly datasetTasks = inject(DatasetTasksStore);
  private readonly training = inject(TrainingStore);
  readonly backend = inject(BackendStore);
  readonly jobs = inject(JobsStore);
  readonly endpoint = signal(this.connection.endpoint());
  readonly token = signal(this.connection.apiKey());
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  /** @public Capture a field without directly coupling the template to the DOM. */
  setField(event: Event, target: "endpoint" | "token"): void {
    const element = event.target;
    if (!(element instanceof HTMLInputElement)) return;
    if (target === "endpoint") this.endpoint.set(element.value);
    else this.token.set(element.value);
    this.saved.set(false);
  }

  /**
   * @public Apply a validated server URL, clear disconnected tracking, and reconnect.
   * @remarks Does not stop the Python service or cancel any running job.
   */
  async save(): Promise<void> {
    this.error.set(null);
    this.saved.set(false);
    try {
      const previousEndpoint = this.connection.endpoint();
      const previousKey = this.connection.apiKey();
      this.connection.setEndpoint(this.endpoint());
      this.connection.setApiKey(this.token());
      const changed = previousEndpoint !== this.connection.endpoint()
        || previousKey !== this.connection.apiKey();
      if (changed) {
        this.jobs.resetSession();
        this.workflow.clear();
      }
      if (changed) {
        this.dataset.clear();
        this.datasetTasks.clear();
        this.training.clear();
      }
      if (changed) this.audio.clear();
      await this.backend.refresh();
      this.jobs.resume();
      this.saved.set(this.backend.health()?.status === "ok" && !this.backend.error());
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Invalid connection settings.");
    }
  }

}



