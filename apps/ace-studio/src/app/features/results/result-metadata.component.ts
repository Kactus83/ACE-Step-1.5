/**
 * @module result-metadata-component
 * @remarks Inspect safe, server-reported generation metadata without inventing fields.
 * @public
 */
import { Component, computed, input } from "@angular/core";
import { GeneratedAudio } from "../../core/api.types";

/** @public Present actual server metadata, prompt and reproducibility information. */
@Component({
  selector: "ace-result-metadata",
  standalone: true,
  templateUrl: "./result-metadata.component.html"
})
export class ResultMetadataComponent {
  readonly result = input.required<GeneratedAudio>();
  readonly properties = computed(() => {
    const metas = this.result().metas || {};
    return Object.entries(metas).filter(([, value]) =>
      typeof value === "string" || typeof value === "boolean"
      || typeof value === "number" && Number.isFinite(value)
    ).slice(0, 24).map(([name, value]) => ({
      name: name.slice(0, 70), text: String(value).slice(0, 300)
    }));
  });
}

