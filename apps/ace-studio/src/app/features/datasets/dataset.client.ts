/**
 * @module dataset-client
 * @remarks Typed standalone FastAPI client; all paths refer to the Python server.
 * @public
 */
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { unwrap } from "../../core/api-decoder";
import { ConnectionStore } from "../../core/connection.store";
import {
  AutoLabelRequest, DatasetMutationResult, DatasetTaskAccepted, DatasetTaskStatus,
  PreprocessRequest, SaveDatasetRequest, ScanDatasetRequest, UpdateSampleRequest
} from "./dataset.contracts";
import { DatasetOverview } from "./dataset.contracts";
import { decodeDataset } from "./dataset.decoder";

/** @public Dataset operations issued to the current standalone backend. */
@Injectable({ providedIn: "root" })
export class DatasetClient {
  private readonly http = inject(HttpClient);
  private readonly connection = inject(ConnectionStore);

  private headers(): HttpHeaders {
    const key = this.connection.apiKey();
    return key ? new HttpHeaders({ Authorization: "Bearer " + key }) : new HttpHeaders();
  }

  private async get<T>(path: string): Promise<T> {
    const response = await firstValueFrom(this.http.get<unknown>(
      this.connection.endpoint() + path, { headers: this.headers() }));
    return unwrap<T>(response);
  }

  private async send<T>(method: "POST" | "PUT", path: string, body: unknown): Promise<T> {
    const response = await firstValueFrom(this.http.request<unknown>(
      method, this.connection.endpoint() + path,
      { body, headers: this.headers() }));
    return unwrap<T>(response);
  }

  /** @public Read the server-global active dataset with runtime validation. */
  async samples(): Promise<DatasetOverview> {
    return decodeDataset(await this.get<unknown>("/v1/dataset/samples"));
  }

  /** @public Scan an existing backend directory into the server-global dataset. */
  async scan(request: ScanDatasetRequest): Promise<DatasetMutationResult> {
    return this.send<DatasetMutationResult>("POST", "/v1/dataset/scan", request);
  }

  /** @public Load a previously saved server-side dataset JSON file. */
  async load(datasetPath: string): Promise<DatasetMutationResult> {
    return this.send<DatasetMutationResult>("POST", "/v1/dataset/load",
      { dataset_path: datasetPath });
  }

  /** @public Save the active dataset to an explicitly chosen backend filesystem path. */
  async save(request: SaveDatasetRequest): Promise<DatasetMutationResult> {
    return this.send<DatasetMutationResult>("POST", "/v1/dataset/save", request);
  }

  /** @public Update an existing indexed server sample without file mutations. */
  async update(request: UpdateSampleRequest): Promise<DatasetMutationResult> {
    const id = request.sample_idx;
    if (!Number.isSafeInteger(id) || id < 0) throw new Error("Invalid sample index.");
    return this.send<DatasetMutationResult>("PUT", "/v1/dataset/sample/" + id, request);
  }

  /** @public Launch asynchronous auto-labeling; requires an initialized LM. */
  async autoLabel(request: AutoLabelRequest): Promise<DatasetTaskAccepted> {
    return this.send<DatasetTaskAccepted>("POST", "/v1/dataset/auto_label_async", request);
  }

  /** @public Launch asynchronous tensor preprocessing. */
  async preprocess(request: PreprocessRequest): Promise<DatasetTaskAccepted> {
    return this.send<DatasetTaskAccepted>("POST", "/v1/dataset/preprocess_async", request);
  }

  /** @public Read the last auto-label status, including after UI reconnection. */
  async labelStatus(): Promise<DatasetTaskStatus> {
    return this.get<DatasetTaskStatus>("/v1/dataset/auto_label_status");
  }

  /** @public Read the last tensor preprocessing status. */
  async preprocessStatus(): Promise<DatasetTaskStatus> {
    return this.get<DatasetTaskStatus>("/v1/dataset/preprocess_status");
  }
}

