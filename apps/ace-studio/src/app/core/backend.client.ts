/**
 * @module backend-client
 * @remarks An HTTP adapter for the standalone ACE-Step FastAPI API.
 * Gradio-mounted endpoints are intentionally not assumed equivalent.
 * @public
 */
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  BackendHealth, BackendStats, GenerateRequest, ModelInventory, SubmittedTask, TaskRecordDto
} from "./api.types";
import { ConnectionStore } from "./connection.store";
import { normalizeAudioUrl, unwrap } from "./api-decoder";

/** @public ACE-Step network transport with explicit per-request authentication. */
@Injectable({ providedIn: "root" })
export class BackendClient {
  private readonly http = inject(HttpClient);
  private readonly connection = inject(ConnectionStore);

  private headers(): HttpHeaders {
    const key = this.connection.apiKey();
    return key ? new HttpHeaders({ Authorization: "Bearer " + key }) : new HttpHeaders();
  }

  /** @public Check transport and service liveness, not model readiness. */
  async health(): Promise<BackendHealth> {
    const data = await firstValueFrom(this.http.get<unknown>(
      this.connection.endpoint() + "/health", { headers: this.headers() }));
    return unwrap<BackendHealth>(data);
  }

  /** @public Read backend queue size and authoritative job counters. */
  async stats(): Promise<BackendStats> {
    const data = await firstValueFrom(this.http.get<unknown>(
      this.connection.endpoint() + "/v1/stats", { headers: this.headers() }));
    return unwrap<BackendStats>(data);
  }

  /** @public Enumerate available server models. */
  async models(): Promise<ModelInventory> {
    const data = await firstValueFrom(this.http.get<unknown>(
      this.connection.endpoint() + "/v1/models", { headers: this.headers() }));
    return unwrap<ModelInventory>(data);
  }

  /** @public Explicitly request model loading. Never called automatically. */
  async initializeModel(name: string): Promise<ModelInventory> {
    const data = await firstValueFrom(this.http.post<unknown>(
      this.connection.endpoint() + "/v1/init",
      { model: name }, { headers: this.headers() }));
    const result = unwrap<ModelInventory>(data);
    return result;
  }

  /**
   * @public Submit an audio generation job to the existing backend queue.
   * @throws Error on invalid or rejected server response.
   */
  async submit(request: GenerateRequest, source?: File, reference?: File): Promise<SubmittedTask> {
    let payload: GenerateRequest | FormData = request;
    if (source || reference) {
      const form = new FormData();
      for (const [key, value] of Object.entries(request)) {
        if (Array.isArray(value)) {
          for (const item of value) form.append(key, String(item));
        } else if (value !== undefined && value !== null) {
          form.append(key, String(value));
        }
      }
      if (source) form.append("src_audio", source, source.name);
      if (reference) form.append("reference_audio", reference, reference.name);
      payload = form;
    }
    const data = await firstValueFrom(this.http.post<unknown>(
      this.connection.endpoint() + "/release_task", payload, { headers: this.headers() }));
    const accepted = unwrap<SubmittedTask>(data);
    if (!accepted || typeof accepted.task_id !== "string" || !accepted.task_id) {
      throw new Error("Server did not return a valid task ID.");
    }
    return accepted;
  }

  /**
   * @public Batch-lookup queued or completed tasks.
   * @throws Error on unexpected envelope or batch data shape.
   */
  async tasks(ids: readonly string[]): Promise<readonly TaskRecordDto[]> {
    if (!ids.length) return [];
    const data = await firstValueFrom(this.http.post<unknown>(
      this.connection.endpoint() + "/query_result",
      { task_id_list: ids }, { headers: this.headers() }));
    const result = unwrap<unknown>(data);
    if (!Array.isArray(result)) throw new Error("Task lookup did not return an array.");
    return result as readonly TaskRecordDto[];
  }

  /**
   * @public Download audio with the same authentication as other endpoints.
   * @remarks HTML media elements do not transmit Authorization headers.
   */
  async audio(rawUrl: string): Promise<Blob> {
    const url = normalizeAudioUrl(rawUrl, this.connection.endpoint());
    return firstValueFrom(this.http.get(url, {
      headers: this.headers(), responseType: "blob"
    }));
  }
}


