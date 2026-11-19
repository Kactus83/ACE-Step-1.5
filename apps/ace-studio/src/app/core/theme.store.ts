/**
 * @module theme-store
 * @remarks Persist only a non-sensitive theme preference for Web and desktop.
 * @public
 */
import { Injectable, signal } from "@angular/core";

/** @public Supported visual appearances. */
export type StudioTheme = "dark" | "light";

/** @public Decode stored user theme preferences without trusting arbitrary values. */
export function decodeTheme(raw: unknown): StudioTheme {
  return raw === "light" ? "light" : "dark";
}

/** @public Shared theme state applied to the root semantic design tokens. */
@Injectable({ providedIn: "root" })
export class ThemeStore {
  private static readonly key = "ace-studio:theme:v1";
  readonly mode = signal<StudioTheme>("dark");

  constructor() {
    try { this.mode.set(decodeTheme(localStorage.getItem(ThemeStore.key))); }
    catch { /* Browser privacy restrictions retain dark default. */ }
    this.apply();
  }

  private apply(): void {
    document.documentElement.setAttribute("data-theme", this.mode());
  }

  /** @public Apply explicit user choice with a browser-only fallback if storage fails. */
  set(mode: StudioTheme): void {
    this.mode.set(decodeTheme(mode));
    this.apply();
    try { localStorage.setItem(ThemeStore.key, this.mode()); }
    catch { /* Persistent preference is optional. */ }
  }

  /** @public Switch appearance without changing audio or model state. */
  toggle(): void { this.set(this.mode() === "dark" ? "light" : "dark"); }
}

