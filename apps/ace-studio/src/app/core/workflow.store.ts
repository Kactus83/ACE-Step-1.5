/**
 * @module workflow-store
 * @remarks Local, transient intent for reusing a generated track as a source.
 * @public
 */
import { Injectable, signal } from "@angular/core";
import { GeneratedAudio, GenerateRequest } from "./api.types";

/** @public A pending editor workflow, resolved to a multipart upload at submit time. */
export interface WorkflowDraft {
  readonly source: GeneratedAudio;
  readonly mode: "cover" | "repaint";
}

/** @public One-time restorable request; source audio is never persisted. */
export interface SettingsDraft {
  readonly request: GenerateRequest;
  readonly title: string;
  readonly originalMediaRequired: boolean;
}

/** @public Ephemeral code-control draft held in memory only. */
export interface AudioCodesDraft {
  readonly codes: string;
}

/** @public Shared intent state; no model or audio files are duplicated here. */
@Injectable({ providedIn: "root" })
export class WorkflowStore {
  readonly draft = signal<WorkflowDraft | null>(null);
  readonly settings = signal<SettingsDraft | null>(null);
  readonly codeDraft = signal<AudioCodesDraft | null>(null);

  /** @public Stage an existing track for remix or repaint. */
  useAudio(source: GeneratedAudio, mode: WorkflowDraft["mode"]): void {
    if (!source.file) throw new Error("Cannot reuse a result without audio.");
    this.settings.set(null);
    this.codeDraft.set(null);
    this.draft.set({ source, mode });
  }

  /** @public Stage a past request without silently creating a new GPU job. */
  useSettings(request: GenerateRequest, title: string, originalMediaRequired: boolean): void {
    this.draft.set(null);
    this.codeDraft.set(null);
    this.settings.set({ request, title, originalMediaRequired });
  }

  /** @public Consume a settings intent exactly once on editor activation. */
  takeSettings(): SettingsDraft | null {
    const staged = this.settings();
    this.settings.set(null);
    return staged;
  }

  /** @public Stage semantic codes for explicit generation, without persistence. */
  useCodes(codes: string): void {
    if (!codes.trim() || codes.length > 1_000_000) {
      throw new Error("Invalid semantic audio code length.");
    }
    this.draft.set(null);
    this.settings.set(null);
    this.codeDraft.set({ codes });
  }

  /** @public Consume semantic codes once, only when the creation editor opens. */
  takeCodes(): AudioCodesDraft | null {
    const draft = this.codeDraft();
    this.codeDraft.set(null);
    return draft;
  }

  /** @public Clear audio-edit, settings-restore and code-control intents. */
  clear(): void {
    this.draft.set(null);
    this.settings.set(null);
    this.codeDraft.set(null);
  }
}


