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

## Next implementation increments (work even without local compilation)

1. Audit the **real** training and dataset API definitions; build complete
   typed clients plus contract fixtures before exposing actions.
2. Implement Extract, Lego and Complete with task-specific validation,
   file upload, mode-aware configuration and precise capabilities.
3. Improve Repaint with a real waveform + accessible numeric range syncing,
   and maintain backend time-range fidelity.
4. Implement full metadata/seed management, result comparisons, batch explorer,
   score/codes results when available, and repeat generation.
5. Build local projects with versioned schema and opt-in file handling;
   distinguish nonpersistent session history from a server-persistent library.
6. Add server stats, diagnostics, GPU/memory reported by API, and structured
   error reporting. Never invent progress from elapsed time.
7. Build training dataset, labeling, preprocessing and LoRA/LoKr workflows
   from server contracts; validate destructive actions and permissions.
8. Add polished a11y interaction, shortcut system, translations, presets import/
   export and cohesive light theme where justified.
9. Expand tests: unit stores/service adapters, API error/capability matrix,
   E2E failure/reconnection, Playwright a11y, Tauri command/permission tests.
10. Do two further contradictory source reviews and then local merge handoff.
    When local toolchains become available, run actual build/unit/browser/GPU
    validations, log evidence and fix failures.

## Non-negotiable interpretation

A missing compiler is **not** a reason to abandon code implementation.
Mark source as written/unexecuted. Do not invent success or call the mission
100% complete while substantial user-visible features remain unimplemented.

The only legitimate final environmental handoff is after the fully authored
target scope can be compiled/tested by the local team, with all incomplete
items explicitly identified and independent approvals pending.

