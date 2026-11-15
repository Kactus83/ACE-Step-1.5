# Dataset workflow API contract evidence

Verified against Python route files on fork main `ca1e85fe`:

- GET `/v1/dataset/samples`: current global DatasetBuilder state.
- POST `/v1/dataset/scan`: server-local `audio_dir`, dataset_name, custom_tag,
  tag_position and all_instrumental.
- POST `/v1/dataset/load`: existing server JSON dataset_path.
- POST `/v1/dataset/save`: backend save_path, dataset_name and optional metadata.
- PUT `/v1/dataset/sample/{index}`: redundant sample_idx in Pydantic body,
  index is from server result. Never send an audio path for mutation.
- POST `/v1/dataset/auto_label_async`: request from AutoLabelRequest, requires
  initialized LLM, returns {task_id,message,total}.
- GET `/v1/dataset/auto_label_status`: latest task snapshot.
- POST `/v1/dataset/preprocess_async`: requires initialized DiT and active
  dataset, returns {task_id,message,total}.
- GET `/v1/dataset/preprocess_status`: latest task snapshot.

Important limitations: server state is process-global and can change between
reads and writes. No optimistic concurrency token is exposed; do not claim
cross-client conflict prevention. Backend performs filesystem writes and model
offloading. Confirm actions, validate server-side paths on backend and avoid
disclosing path fields in browser telemetry.

