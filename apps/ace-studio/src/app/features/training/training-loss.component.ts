/**
 * @module training-loss-component
 * @remarks Visualize actual server-reported training loss, not estimated progress.
 * @public
 */
import { Component, computed, input } from "@angular/core";
import { LossPoint, buildLossPlot } from "./training-loss";

/** @public Bounded and accessible inline SVG loss visualization. */
@Component({
  selector: "ace-training-loss",
  standalone: true,
  templateUrl: "./training-loss.component.html"
})
export class TrainingLossComponent {
  readonly history = input<readonly LossPoint[]>([]);
  readonly plot = computed(() => buildLossPlot(this.history()));
}

