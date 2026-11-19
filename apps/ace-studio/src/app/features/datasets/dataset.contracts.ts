/**
 * @module dataset-contracts
 * @remarks Audited against train_api_dataset_{models,sample_routes,scan_load_routes}.py.
 * @public
 */

/** @public Metadata stored by ACE-Step for one server-owned audio sample. */
export interface DatasetSample {
  readonly index: number;
  readonly filename: string;
  readonly audio_path: string;
  readonly duration: number;
  readonly caption: string;
  readonly genre: string;
  readonly prompt_override: string | null;
  readonly lyrics: string;
  readonly bpm: number | null;
  readonly keyscale: string;
  readonly timesignature: string;
  readonly language: string;
  readonly is_instrumental: boolean;
  readonly labeled: boolean;
}

/** @public Active dataset overview from /v1/dataset/samples. */
export interface DatasetOverview {
  readonly dataset_name: string;
  readonly num_samples: number;
  readonly labeled_count: number;
  readonly samples: readonly DatasetSample[];
}

/** @public Payload expected by PUT /v1/dataset/sample/{sample_idx}. */
export interface UpdateSampleRequest {
  readonly sample_idx: number;
  readonly caption: string;
  readonly genre: string;
  readonly prompt_override: string | null;
  readonly lyrics: string;
  readonly bpm: number | null;
  readonly keyscale: string;
  readonly timesignature: string;
  readonly language: string;
  readonly is_instrumental: boolean;
}

/** @public Dataset-save API fields, targeting the backend filesystem. */
export interface SaveDatasetRequest {
  readonly save_path: string;
  readonly dataset_name: string;
  readonly custom_tag?: string;
  readonly tag_position?: "prepend" | "append" | "replace";
  readonly all_instrumental?: boolean;
  readonly genre_ratio?: number;
}

/** @public Dataset auto-labeling request, verified from Pydantic fields. */
export interface AutoLabelRequest {
  readonly only_unlabeled: boolean;
  readonly skip_metas: boolean;
  readonly format_lyrics: boolean;
  readonly transcribe_lyrics: boolean;
  readonly chunk_size: number;
  readonly batch_size: number;
  readonly save_path?: string;
  readonly lm_model_path?: string;
}

/** @public Tensor preprocessing request. */
export interface PreprocessRequest {
  readonly output_dir: string;
  readonly skip_existing: boolean;
}

/** @public Acknowledgement of queued asynchronous dataset work. */
export interface DatasetTaskAccepted {
  readonly task_id: string;
  readonly message: string;
  readonly total: number;
}

/** @public Latest or keyed dataset task status, directly returned by FastAPI. */
export interface DatasetTaskStatus {
  readonly task_id: string | null;
  readonly status: string;
  readonly progress: string;
  readonly current: number;
  readonly total: number;
  readonly error?: string | null;
  readonly save_path?: string | null;
  readonly result?: unknown;
}

/** @public Standard server acknowledgement of a dataset change. */
export interface DatasetMutationResult {
  readonly message: string;
  readonly save_path?: string;
  readonly sample?: DatasetSample;
  readonly num_samples?: number;
  readonly samples?: readonly DatasetSample[];
  readonly labeled_count?: number;
  readonly dataset_name?: string;
}

/** @public Scan request contract, operating on a server-local directory. */
export interface ScanDatasetRequest {
  readonly audio_dir: string;
  readonly dataset_name: string;
  readonly custom_tag: string;
  readonly tag_position: "prepend" | "append" | "replace";
  readonly all_instrumental: boolean;
}

