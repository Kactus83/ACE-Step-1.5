/**
 * @module workflow-store
 * @remarks Local, transient intent for reusing a generated track as a source.
 * @public
 */
import { Injectable, signal } from "@angular/core";
import { GeneratedAudio } from "./api.types";

/** @public A pending editor workflow, resolved to a multipart upload at submit time. */
export interface WorkflowDraft {
  readonly source: GeneratedAudio;
  readonly mode: "cover" | "repaint";
}

/** @public Shared intent state; no model or audio files are duplicated here. */
@Injectable({ providedIn: "root" })
export class WorkflowStore {
  readonly draft = signal<WorkflowDraft | null>(null);

  /** @public Stage an existing track for remix or repaint. */
  useAudio(source: GeneratedAudio, mode: WorkflowDraft["mode"]): void {
    if (!source.file) throw new Error("Cannot reuse a result without audio.");
    this.draft.set({ source, mode });
  }

  /** @public Clear the current editor's imported audio. */
  clear(): void { this.draft.set(null); }
}
