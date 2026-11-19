/**
 * @module training-client
 * @remarks Authenticated adapter for audited training and dataset HTTP routes.
 * @public
 */
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { isObject, unwrap } from "../../core/api-decoder";
import { ConnectionStore } from "../../core/connection.store";
import { TrainingExportRequest } from "./training-export.request";
import {
  StartLoKrRequest, StartLoRARequest,
  TensorDirectoryInfo, TrainingActionResult, TrainingStatus
} from "./training.types";

/** @public Explicit training and dataset operations; no implicit process creation. */
@Injectable({ providedIn: "root" })
export class TrainingClient {
  private readonly http = inject(HttpClient);
  private readonly connection = inject(ConnectionStore);

  private headers(): HttpHeaders {
    const token = this.connection.apiKey();
    return token ? new HttpHeaders({ Authorization: "Bearer " + token }) : new HttpHeaders();
  }

  private async get<T>(path: string): Promise<T> {
    const response = await firstValueFrom(this.http.get<unknown>(
      this.connection.endpoint() + path, { headers: this.headers() }));
    return unwrap<T>(response);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await firstValueFrom(this.http.post<unknown>(
      this.connection.endpoint() + path, body, { headers: this.headers() }));
    return unwrap<T>(response);
  }

  /**
   * @public Fetch actual training status; no synthetic progress calculations.
   * @throws Error for malformed or unauthorized backend responses.
   */
  async status(): Promise<TrainingStatus> {
    const data = await this.get<unknown>("/v1/training/status");
    if (!isObject(data) || typeof data["is_training"] !== "boolean"
      || typeof data["status"] !== "string") {
      throw new Error("Unsupported training status response.");
    }
    return data as unknown as TrainingStatus;
  }

  /** @public Verify preprocessed tensors on the server filesystem. */
  async tensors(directory: string): Promise<TensorDirectoryInfo> {
    return this.post<TensorDirectoryInfo>("/v1/training/load_tensor_info", {
      tensor_dir: directory
    });
  }

  /**
   * @public Export a trained LoRA/LoKr adapter after destructive UI confirmation.
   * @remarks Studio-only backend route rejects existing destination directories.
   */
  async exportAdapter(request: TrainingExportRequest): Promise<TrainingActionResult> {
    return this.post<TrainingActionResult>("/v1/studio/training/export", request);
  }

  /** @public Start LoRA training only after an explicit user confirmation. */
  async startLoRA(request: StartLoRARequest): Promise<TrainingActionResult> {
    return this.post<TrainingActionResult>("/v1/training/start", request);
  }

  /** @public Start LoKr training only after an explicit user confirmation. */
  async startLoKr(request: StartLoKrRequest): Promise<TrainingActionResult> {
    return this.post<TrainingActionResult>("/v1/training/start_lokr", request);
  }

  /**
   * @public Request a graceful backend training stop.
   * @remarks The endpoint sets should_stop; it does not forcibly terminate GPU work.
   */
  async requestStop(): Promise<TrainingActionResult> {
    return this.post<TrainingActionResult>("/v1/training/stop", {});
  }
}



