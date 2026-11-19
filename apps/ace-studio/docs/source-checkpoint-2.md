# ACE Studio — Source-level checkpoint #2 (15 Nov 2026)

## Repository
- Branch: `feature/ace-studio-angular-tauri`
- PR: https://github.com/Kactus83/ACE-Step-1.5/pull/2
- Upstream/fork main at last sync: `ca1e85fe9430179831e6bc6be790c332190a3866`
- Feature work has not been merged into `main`.

## New source features
1. Dataset workspace: server filesystem scan/load/save, indexed metadata editing,
   async LM labeling and tensor preprocessing with status polling, strict DTO decoding.
2. LoRA/LoKr handoff: latest processed tensor directory may be prefilled, but
   must still be validated before an explicitly confirmed training start.
3. Model-aware Extract/Lego/Complete with stem and track-class input mapping.
4. Repaint waveform from explicit client AudioContext decode, bounded time
   sliders and numerical fallback if decoding is unavailable.
5. Connection revisions cancel stale result application after endpoint/credential
   changes, including jobs, models and dataset/training views.
6. Actual /v1/stats job counts are displayed; no synthetic GPU/VRAM metrics.
7. Scope decomposition: independent dataset modules and child preset component.

## Checks actually performed through GitHub connector
- Verified PR #2 is open and draft; base main unchanged at inspection.
- Resolved relative imports across 37 TypeScript application modules against
  the current repository tree: no unresolved relative imports observed.
- Checked TS application module LOC: none exceeded 200 at inspection.
- Compared Python Pydantic/route sources against TypeScript request shapes.
- Verified three alternative feature modes are only exposed if advertised by
  the selected model's inventory; no global enabling.
- Committed unit and E2E regression files; these were **not executed**.

## Checks not performed
No `npm install`, `ng build`, Rust/Tauri bundle build, Python `unittest`,
Playwright browser flow, real backend generation, waveform codec validation,
accessibility audit or hardware tests were executed. This environment cannot
retrieve npm dependencies or the remote repository through local DNS.

## Open risks
- No full API cancellation semantics; job UI never claims cancellation.
- Server-global active dataset has no optimistic locking/tenant isolation.
- Backend job results and audio paths expire; local presets are not a project
  library or durable archive.
- Repaint decoding may not support all codecs on all WebViews.
- Native desktop packaging and platform-specific CORS require tests.
- Some advanced controls, comparison/project organization and adapter export
  remain incomplete. Full API capabilities and model-specific semantics must
  be tested on a real backend before production or merge.


## Base synchronization after consolidation PR #1 merge

On 15 Nov 2026, the consolidation PR #1 was independently merged into fork
`main` (main HEAD `d207bdd283dc726a0d9c711ca518dcf3accd1381`).
An explicit source comparison against the original common ancestor found **zero
file-level overlap** between main's 75 modified files and ACE Studio's 99 files.
A non-force, two-parent merge of current `main` into the Studio feature branch
was committed as `73b32efc0f9da45f978695601aaf51f9f830514a`.
Post-merge compare reported **33 commits ahead, 0 behind, 99 changed files**;
PR #2 remained open and draft. This validates file-level isolation, not runtime
API compatibility or Angular/Rust compilation. All original Gradio and backend
runtime acceptance criteria remain in force.
