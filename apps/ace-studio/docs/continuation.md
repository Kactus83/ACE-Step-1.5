# Coordinator continuity — remaining work until source-complete

This file is the next-pass worklist. Treat the mission as **in progress**, not
blocked by unavailable local compilation/GPU.

## Completed source increments

- Dedicated branch/PR, optional module isolation.
- Angular/Tauri skeleton with shared frontend.
- Live standalone API adapters, observed models and opt-in initialization.
- First text-to-music submission/job/audio flow.
- Basic Cover/Remix/Repaint uploads and reuse.
- Validated local connection / transient API key / local presets.
- Bounded polling and network recovery.
- Narrow desktop CORS extension.
- Mock backend + Vitest + Playwright test source.
- Source-level architecture/security/UX audits.

- Server-global dataset scan/load/save, indexed metadata editing, auto-label and
  tensor preprocessing status; handoff to validated LoRA/LoKr tensor directory.
- Backend queue and job counters from `/v1/stats`.
- Model-gated Extract/Lego/Complete submissions, instrument stems and classes.
- Optional Repaint waveform with accessible numeric fallback.
- Stale-response invalidation when URL or API credentials change.
- Pure API/data contract and waveform unit tests plus mocked E2E source.

## Next implementation increments (work even without local compilation)

1. Extend training API UI for adapter export, sample metadata navigation,
   label/preprocess task diagnostics, and complete retry policies.
2. Add model/LM advanced generation controls from actual request contracts:
   DCW, custom timesteps, scheduler, CoT, reference/cover tuning and validation.
3. Implement A/B result comparison, batches, metadata/seed browsing and repeat
   generation with reproducibility controls.
4. Build local projects and catalog with versioned storage, safe import/export
   and clear server-retention limitations; never claim a durable remote library.
5. Expand backend connection diagnostics with meaningful errors and opt-in
   supported hardware indicators (do not infer GPU values).
6. Improve Repaint source preview, selected region visualization and the exact
   server-boundary contract through E2E tests.
7. Implement browser/Tauri native abstraction where needed, keyboard shortcuts,
   translations and a consistent design-system accessibility review.
8. Add focused adapter/store tests, API failure scenarios, E2E reconnect,
   Playwright accessibility checks and Tauri permissions/packaging tests.
9. Carry out another two independent source reviews and fix their findings,
   including concurrent mutation and model switching edge cases.
10. After all code paths are implemented, local team runs real Angular/Rust
    builds and Python/Playwright/GPU tests and documents exit codes. Do not
    declare production readiness or merge approval from source inspection.

## Non-negotiable interpretation

A missing compiler is **not** a reason to abandon code implementation.
Mark source as written/unexecuted. Do not invent success or call the mission
100% complete while substantial user-visible features remain unimplemented.

The only legitimate final environmental handoff is after the fully authored
target scope can be compiled/tested by the local team, with all incomplete
items explicitly identified and independent approvals pending.



