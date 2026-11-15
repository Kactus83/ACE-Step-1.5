/**
 * @module audio-service
 * @remarks Authenticated in-memory audio object URLs; never persist binary data.
 * @public
 */
import { Injectable, OnDestroy, inject } from "@angular/core";
import { BackendClient } from "./backend.client";

/** @public Responsible for previews and downloads of backend-generated audio. */
@Injectable({ providedIn: "root" })
export class AudioService implements OnDestroy {
  private readonly backend = inject(BackendClient);
  private readonly urls = new Map<string, string>();

  /**
   * @public Return or fetch a playable blob URL for protected audio.
   * @throws Error on network, permission, or invalid-reference failures.
   */
  async preview(raw: string): Promise<string> {
    const existing = this.urls.get(raw);
    if (existing) return existing;
    const blob = await this.backend.audio(raw);
    const url = URL.createObjectURL(blob);
    this.urls.set(raw, url);
    return url;
  }

  /**
   * @public Download an audio result with an explicitly user-triggered action.
   * @remarks Uses a browser blob anchor; native file dialog is not yet exposed.
   */
  async download(raw: string, name: string): Promise<void> {
    const blob = await this.backend.audio(raw);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const encodedPath = new URL(raw, "http://localhost").searchParams.get("path") || "";
    const extension = encodedPath.match(/\.(mp3|wav|flac|ogg|opus|aac)$/i)?.[1] || "mp3";
    const base = name.replace(/\.(mp3|wav|flac|ogg|opus|aac)$/i, "");
    link.download = (base.replace(/[^\w. -]/g, "_").slice(0, 92) || "ace-step-audio")
      + "." + extension.toLowerCase();
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  /** @public Invalidate authenticated preview URLs after credentials or endpoint change. */
  clear(): void {
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
  }

  /** @public Release every preview blob URL when the service is destroyed. */
  ngOnDestroy(): void {
    this.clear();
  }
}
