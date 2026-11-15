# Contract audit — standalone API baseline

Reviewed against `acestep/api/http/{release_task_route,release_task_request_builder,query_result_route,query_result_service,model_service_routes,audio_route,auth}.py` on fork main `ca1e85fe`.

| Operation | Method | Auth | Shape |
| --- | --- | --- | --- |
| /health | GET | none | wrapped object, status / version / models_initialized |
| /v1/models | GET | Bearer when key set | wrapped {models,default_model,lm_models,llm_initialized} |
| /v1/model_inventory | GET | Bearer when key set | same inventory shape |
| /v1/stats | GET | Bearer when key set | wrapped jobs counters |
| /v1/init | POST | Bearer when key set | model, slot, init_llm, lm_model_path |
| /release_task | POST | Bearer or ai_token | wrapped {task_id,status,queue_position} |
| /query_result | POST | Bearer or ai_token | wrapped array, each status numeric (0=waiting/running;1=success;2=failure), result often JSON-encoded array |
| /v1/audio?path=... | GET | Bearer when key set | binary audio response |

## Important divergences

- /query_result may return the **result field as a JSON string**; decode and validate defensively.
- The result may contain a backend-relative URL such as /v1/audio?path=...; do not construct a filesystem access path from arbitrary client input.
- /health does **not** establish auth success or initialized model readiness.
- /release_task accepting a job does **not** mean inference completed.
- A successful job may contain multiple audio paths but no file for analysis-only modes.
- The explicit API request model contains more fields than the published API.md.
- The current release_task_request_builder on main declares no custom `timesteps` forwarding although the request schema has the field; PR #1 supplies a fix not yet merged.
- Gradio-mounted API parity is **unverified**; standalone FastAPI is the initial supported profile.
- A browser cannot add Bearer headers to a plain <audio src>; fetch binary as authenticated Blob.
- CORS allows localhost origins and local native webview origin 'null'; remote web hosting requires a separate policy decision.

No Python endpoint has been modified by this branch. All API-specific assumptions must be backed by tests; unsupported features must remain unavailable in the UI.
