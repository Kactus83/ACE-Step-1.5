/**
 * @module library-types
 * @remarks Versioned, browser-local catalog of server-owned audio references.
 * The catalog is not an audio backup and does not claim server persistence.
 * @public
 */
import { GeneratedAudio } from "../../core/api.types";

/** @public A deliberately saved track reference, scoped to its original API. */
export interface LibraryTrack {
  readonly id: string;
  readonly jobId: string;
  readonly variant: number;
  readonly title: string;
  readonly savedAt: number;
  readonly backend: string;
  readonly result: GeneratedAudio;
  readonly favorite: boolean;
  readonly note: string;
  readonly tags: readonly string[];
}

/** @public Human-named local project containing audio references. */
export interface LibraryProject {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly tracks: readonly LibraryTrack[];
}

/** @public Portable, explicit versioned project export envelope. */
export interface LibraryExport {
  readonly version: 1;
  readonly exportedAt: number;
  readonly projects: readonly LibraryProject[];
}

