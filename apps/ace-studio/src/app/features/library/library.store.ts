/**
 * @module library-store
 * @remarks Local-only project persistence with explicit save/import/export actions.
 * No audio bytes, API credentials or local filesystem permissions are stored.
 * @public
 */
import { Injectable, inject, signal } from "@angular/core";
import { ConnectionStore } from "../../core/connection.store";
import { normalizeAudioUrl } from "../../core/api-decoder";
import { GeneratedAudio, StudioJob } from "../../core/api.types";
import {
  decodeLibraryCatalog, decodeLibraryTrack, encodeLibraryCatalog,
  importLibraryJson, MAX_PROJECTS, MAX_TRACKS, normalizeTags
} from "./library.codec";
import { LibraryProject, LibraryTrack } from "./library.types";

const KEY = "ace-studio:library:v1";

/** @public Safe, explicit versioned browser-local project catalog. */
@Injectable({ providedIn: "root" })
export class LibraryStore {
  private readonly connection = inject(ConnectionStore);
  readonly projects = signal<readonly LibraryProject[]>([]);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  constructor() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.projects.set(decodeLibraryCatalog(JSON.parse(raw) as unknown));
    } catch {
      this.error.set("Saved catalog could not be loaded; the local file was not overwritten.");
    }
  }

  private commit(next: readonly LibraryProject[], message: string): boolean {
    this.error.set(null);
    try {
      const payload = JSON.stringify(encodeLibraryCatalog(next));
      if (new TextEncoder().encode(payload).byteLength > 1_500_000) {
        throw new Error("Project catalog exceeds the local storage size policy.");
      }
      localStorage.setItem(KEY, payload);
      this.projects.set(next);
      this.message.set(message);
      return true;
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message
        : "Local storage is unavailable. No changes were saved.");
      return false;
    }
  }

  /** @public Create a new project without silently moving existing audio. */
  create(name: string, description = ""): string | null {
    if (this.projects().length >= MAX_PROJECTS) {
      this.error.set("The catalog allows up to 30 projects."); return null;
    }
    const title = name.trim().slice(0, 100);
    if (!title) { this.error.set("A project name is required."); return null; }
    const now = Date.now();
    const project: LibraryProject = {
      id: crypto.randomUUID(), name: title,
      description: description.trim().slice(0, 3000),
      createdAt: now, updatedAt: now, tracks: []
    };
    return this.commit([...this.projects(), project], "Project created locally.")
      ? project.id : null;
  }

  /** @public Save one successful audio reference with the current backend origin. */
  add(projectId: string, job: StudioJob, result: GeneratedAudio, variant: number): boolean {
    const project = this.projects().find(item => item.id === projectId);
    if (!project) { this.error.set("Select an existing local project."); return false; }
    if (job.phase !== "succeeded") {
      this.error.set("Only completed audio results can be bookmarked."); return false;
    }
    const total = this.projects().reduce((n, item) => n + item.tracks.length, 0);
    if (total >= MAX_TRACKS) {
      this.error.set("The catalog allows up to 240 audio references."); return false;
    }
    if (!Number.isSafeInteger(variant) || variant < 1) {
      this.error.set("Invalid result variant."); return false;
    }
    const backend = this.connection.endpoint();
    try { normalizeAudioUrl(result.file, backend); }
    catch { this.error.set("Result does not contain a safe ACE-Step audio reference."); return false; }
    const track = decodeLibraryTrack({
      id: crypto.randomUUID(), jobId: job.id, variant,
      title: job.title, savedAt: Date.now(), backend, result,
      favorite: false, note: "", tags: []
    });
    if (!track) { this.error.set("Result cannot be stored in the local catalog."); return false; }
    if (project.tracks.some(item => item.jobId === job.id && item.variant === variant
      && item.backend === backend)) {
      this.error.set("This variant is already stored in that project."); return false;
    }
    return this.updateProject(project.id,
      { ...project, tracks: [track, ...project.tracks] }, "Audio reference saved.");
  }

  private updateProject(id: string, next: LibraryProject, message: string): boolean {
    const updated = this.projects().map(project => project.id === id
      ? { ...next, updatedAt: Date.now() } : project);
    return this.commit(updated, message);
  }

  /** @public Rename or describe a project without altering its audio references. */
  editProject(id: string, name: string, description: string): boolean {
    const project = this.projects().find(item => item.id === id);
    if (!project) { this.error.set("Project not found."); return false; }
    const title = name.trim().slice(0, 100);
    if (!title) { this.error.set("A project name is required."); return false; }
    return this.updateProject(id,
      { ...project, name: title, description: description.trim().slice(0, 3000) },
      "Project details saved.");
  }

  /** @public Update favorite, note and tags of a local reference. */
  editTrack(projectId: string, trackId: string, patch: {
    favorite: boolean; note: string; tags: string
  }): boolean {
    const project = this.projects().find(item => item.id === projectId);
    if (!project || !project.tracks.some(item => item.id === trackId)) {
      this.error.set("Audio reference not found."); return false;
    }
    const tracks = project.tracks.map(track => track.id !== trackId ? track : {
      ...track, favorite: patch.favorite, note: patch.note.trim().slice(0, 3000),
      tags: normalizeTags(patch.tags)
    });
    return this.updateProject(projectId, { ...project, tracks }, "Track details saved.");
  }

  /** @public Remove a selected local reference only; never delete backend audio. */
  removeTrack(projectId: string, trackId: string): boolean {
    const project = this.projects().find(item => item.id === projectId);
    if (!project) { this.error.set("Project not found."); return false; }
    return this.updateProject(projectId,
      { ...project, tracks: project.tracks.filter(track => track.id !== trackId) },
      "Local reference removed. Backend audio was not modified.");
  }

  /** @public Remove a project only after the UI explicitly confirms deletion. */
  removeProject(id: string): boolean {
    if (!this.projects().some(project => project.id === id)) return false;
    return this.commit(this.projects().filter(project => project.id !== id),
      "Local project deleted. Backend audio was not modified.");
  }

  /** @public Merge an imported JSON catalog with new local IDs to avoid collisions. */
  importJson(text: string): boolean {
    this.error.set(null);
    try {
      const incoming = importLibraryJson(text);
      if (incoming.length + this.projects().length > MAX_PROJECTS) {
        throw new Error("Too many projects to import; limit 30.");
      }
      const count = [...incoming, ...this.projects()]
        .reduce((sum, item) => sum + item.tracks.length, 0);
      if (count > MAX_TRACKS) throw new Error("Too many tracks; limit 240.");
      const projects = incoming.map(project => ({
        ...project, id: crypto.randomUUID(),
        tracks: project.tracks.map(track => ({ ...track, id: crypto.randomUUID() }))
      }));
      return this.commit([...this.projects(), ...projects],
        "Imported projects merged; no audio files were uploaded.");
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Project import failed.");
      return false;
    }
  }

  /** @public Export metadata and server references as user-triggered JSON download. */
  exportJson(): void {
    const content = JSON.stringify(encodeLibraryCatalog(this.projects()), null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "ace-studio-projects.json";
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
}

