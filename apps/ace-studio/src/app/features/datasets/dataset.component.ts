/**
 * @module dataset-component
 * @remarks Dataset workspace orchestrates independent sources, samples and async tasks.
 * @public
 */
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { DatasetStore } from "./dataset.store";
import { LocaleStore } from "../../core/locale.store";
import { DatasetTasksStore } from "./dataset.tasks.store";
import { DatasetSourcesComponent } from "./dataset-sources.component";
import { DatasetSamplesComponent } from "./dataset-samples.component";
import { DatasetWorkflowsComponent } from "./dataset-workflows.component";

/** @public Accessible dataset management screen for the existing Python server. */
@Component({
  selector: "ace-datasets",
  standalone: true,
  imports: [DatasetSourcesComponent, DatasetSamplesComponent, DatasetWorkflowsComponent],
  templateUrl: "./dataset.component.html"
})
export class DatasetComponent implements OnInit, OnDestroy {
  readonly dataset = inject(DatasetStore);
  readonly locale = inject(LocaleStore);
  readonly tasks = inject(DatasetTasksStore);

  /** @public Recover last async task status on entry without creating new tasks. */
  ngOnInit(): void { this.tasks.begin(); }

  /** @public Suspend polling on navigation; backend work continues. */
  ngOnDestroy(): void { this.tasks.pause(); }
}


