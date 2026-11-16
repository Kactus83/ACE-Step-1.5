/**
 * @module batch-navigator-component
 * @remarks Client-only navigation of server-reported audio variants in one job.
 * @public
 */
import { Component, computed, input, output, signal } from "@angular/core";
import { GeneratedAudio } from "../../core/api.types";
import {
  VariantSelection, normalizeVariantSelection, playableVariantIndices, stepVariant
} from "./batch-navigation";

/** @public Keyboard-friendly all/one-variant navigator without GPU operations. */
@Component({
  selector: "ace-batch-navigator",
  standalone: true,
  templateUrl: "./batch-navigator.component.html"
})
export class BatchNavigatorComponent {
  readonly results = input.required<readonly GeneratedAudio[]>();
  readonly chosen = output<VariantSelection>();
  readonly selection = signal<VariantSelection>("all");
  readonly indices = computed(() => playableVariantIndices(this.results()));
  readonly normalized = computed(() =>
    normalizeVariantSelection(this.selection(), this.results()));
  readonly current = computed(() => {
    const selected = this.normalized();
    return selected === "all" ? 0 : this.indices().indexOf(selected) + 1;
  });

  /** @public Display all playable results without modifying their order. */
  showAll(): void { this.set("all"); }

  /** @public Select one actual server result, using zero-based variant index. */
  select(index: number): void { this.set(index); }

  /** @public Advance by one playable variant and wrap around the batch. */
  next(): void { this.set(stepVariant(this.normalized(), this.results(), 1)); }

  /** @public Return to the previous playable variant and wrap around. */
  previous(): void { this.set(stepVariant(this.normalized(), this.results(), -1)); }

  private set(value: VariantSelection): void {
    const normalized = normalizeVariantSelection(value, this.results());
    this.selection.set(normalized);
    this.chosen.emit(normalized);
  }
}

