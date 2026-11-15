/**
 * @module presets-store
 * @remarks Persistence of user-authored generation presets, never media files or tokens.
 * @public
 */
import { Injectable, signal } from "@angular/core";
import { decodePresets, sanitizeFields, StudioPreset } from "./preset-codec";

/** @public Local-only, versioned settings library. */
@Injectable({ providedIn: "root" })
export class PresetsStore {
  private readonly storageKey = "ace-studio:presets:v1";
  /** @public Presets saved in this browser or desktop webview. */
  readonly presets = signal<readonly StudioPreset[]>(this.read());

  private read(): readonly StudioPreset[] {
    try {
      const value = localStorage.getItem(this.storageKey);
      return value ? decodePresets(JSON.parse(value) as unknown) : [];
    } catch { return []; }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        version: 1, items: this.presets()
      }));
    } catch {
      // Preserve current in-memory presets if storage is unavailable.
    }
  }

  /**
   * @public Save settings only; source audio remains explicitly unpersisted.
   * @throws Error when the preset name is missing or too long.
   */
  save<T extends object>(name: string, values: T): StudioPreset {
    const normalized = name.trim();
    if (!normalized || normalized.length > 80) {
      throw new Error("Preset name must contain 1–80 characters.");
    }
    const fields = sanitizeFields(values);
    if (typeof fields["prompt"] !== "string") {
      throw new Error("The current form does not have a valid music description.");
    }
    const preset: StudioPreset = {
      id: crypto.randomUUID(), name: normalized, updatedAt: Date.now(), fields
    };
    this.presets.update(items => [preset, ...items].slice(0, 50));
    this.persist();
    return preset;
  }

  /** @public Remove an identified local preset only, without affecting jobs. */
  remove(id: string): void {
    this.presets.update(items => items.filter(item => item.id !== id));
    this.persist();
  }

  /** @public Read one validated saved preset. */
  get(id: string): StudioPreset | undefined {
    return this.presets().find(item => item.id === id);
  }
}
