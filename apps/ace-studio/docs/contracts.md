# ACE Studio — Standalone API contract audit

Scope: `Kactus83/ACE-Step-1.5` standalone FastAPI, synchronized with
fork `main` `d207bdd283dc726a0d9c711ca518dcf3accd1381`.
The Gradio-mounted API is **not assumed equivalent**.

## Server contracts

| Endpoint | Method | Auth | Client interpretation |
| --- | --- | --- | --- |
| `/health` | GET | Usually none | Wrapped service status, no implicit model readiness assumption |
| `/v1/models` | GET | API Bearer when configured | Validated DiT + 5Hz-LM inventory and supported task types |
| `/v1/model_inventory` | GET | API Bearer | Alternate existing inventory route |
| `/v1/init` | POST | API Bearer | `model`, optional `init_llm/lm_model_path`; **reinitializes DiT**, double-confirmed |
| `/v1/stats` | GET | API Bearer | Server job counters, queue size, mean duration |
| `/release_task` | POST | Bearer or AI token | JSON or multipart, queue acknowledgement, not finished audio |
| `/query_result` | POST | Bearer or AI token | `task_id_list` with numeric statuses 0/1/2 and sometimes JSON-encoded result strings |
| `/v1/audio?path=...` | GET | API Bearer | Binary returned as authenticated Blob, origin/route validated |
| `/v1/dataset/scan,load,save` | POST | API Bearer | Server-global working dataset, not browser filesystem |
| `/v1/dataset/samples` | GET | API Bearer | Current server-global dataset sample metadata |
| `/v1/dataset/sample/{index}` | PUT | API Bearer | Indexed metadata update; CORS preflight now allows PUT |
| `/v1/dataset/auto_label_async,preprocess_async` | POST | API Bearer | Asynchronous task IDs, poll server status routes |
| `/v1/training/status,load_tensor_info,start,start_lokr,stop` | GET/POST | API Bearer | Observed tensor/training states, explicit GPU operations |
| `/v1/studio/training/export` | POST | API Bearer | **New additive Studio route**, same `lora_output_dir/export_path` request; refuses overwrite |
| `/v1/training/export` | POST | API Bearer | **Existing legacy route deletes existing output; Studio never calls it** |

## Generation request fields verified from Python model and request builder

The Studio binds the real `GenerateMusicRequest` schema:
text2music, cover, repaint, extract, lego, complete; optional `global_caption`
for Lego; cover-noise mixing; repaint source-preservation mode, balanced strength,
explicit/automatic chunk mask, 25Hz latent crossfade frames, final WAV crossfade,
and tiled decode.

The expert panel forwards ODE/SDE, shift, custom timesteps, ADG and CFG window,
explicit DCW tri-state override (auto/off/on), CoT and LM sampling settings.
Absent DCW must remain `None` so the loaded model's policy chooses its default.
The branch includes a narrow fix to forward DCW values through Python's builder.

For `sample_mode=true`, the user's idea is sent as `sample_query`, with an
empty raw prompt/lyrics. The Python 5Hz-LM preparation actually generates
caption, lyrics and musical metadata; it may lazily initialize the LM.

## Network and payload boundaries

- HTTPS required except loopback HTTP; token never persisted, all protected
  audio routed through the exact selected origin and `/v1/audio` path.
- Client validates inventories, job IDs/statuses and queue counter envelopes;
  invalid or excessive responses produce errors, not fabricated state.
- Multipart `track_classes` is transmitted as repeated fields.
- CORS allows GET/POST/PUT/OPTIONS for explicitly allowed browser origins;
  fixed Tauri origins remain opt-in and never wildcard.
- Python's server-global dataset and training state remains authoritative.
- The new safe export route fails if its destination exists or source paths
  overlap. It does not fall back to the legacy destructive route on 404.

## Verification warning

The frontend, Python route additions and regression tests were written and
committed through the GitHub connector. They have **not** been compiled or
executed against a GPU, Angular browser or Tauri bundle. Test and integrate
with a disposable backend before using remote or production data.

