# Contradictory Review 4 — Final hardening / negative-path inspection (2026-11-15)

## Scope and evidence

Re-read the consolidation candidate PR #1 and verified all earlier scope decisions against unchanged upstream and fork main. Inspected source for the five-stage Simple flow, Advanced preservation, progress adapter, seeded metadata, WAV fallback, source conditioning, offloading, API parameters and service flag. This fourth review is **static source inspection**; it is **not** compilation, a Gradio render, or a GPU run.

## Blocking and major defects found during this pass

| Finding | Severity | Correction committed | Added safeguard |
|---|---|---|---|
| Simple hamburger Help clicked the first global help control, potentially inside the **hidden Advanced column** | P1 usability | Render existing help component inside visible Simple column; target scoped selector | Offline source contract: visible modal owner and scoped selector |
| Upstream progress generator can emit null audio slots on failure, clearing prior playable audio | P1 data retention/UX | Normalize null and explicit null-update to Gradio skip | New focused foundation + streaming regression tests |
| Empty output branch explicitly cleared both audio players | P1 data retention/UX | Keep prior players and their sidecar metadata, display error | Foundation empty-output assertions |
| Synchronous generation dispatcher exceptions could leave user at Creating | P1 state management | Catch adapter failures and emit recoverable Done/error tuple | Stream dispatcher-start regression test |
| New interface composition introduced four whitespace-only added lines | P2 hygiene | Remove whitespace-only lines | Recheck full PR diff added-line whitespace |
| About overlay styling, mobile indicator legibility, static half-full progress affordance | P2 design | Fixed-position modal styling, readable Close label, scrollable small-screen indicator, honest indeterminate animation and reduced-motion handling | Browser cases added to local handoff; still require visual verification |

## Post-fix structural checks

- Full PR changed-line scan: zero newly-added lines with trailing whitespace. This is **not** the command `git diff --check`.
- All 38 distinct production `gs["..."]` component bindings matched Simple builder keys in the checked diff.
- All 40 distinct `simple_flow.*` translation keys found in the English locale after adding `close`.
- The 17 new Simple-related Python modules stayed within the 200-line cap (diff-based source counts).
- New isolated `simple_ui_streaming_test.py` tests complement `simple_ui_foundation_test.py` and source-only `simple_ui_contracts_test.py`.
- The branch stayed ahead of own `main` with zero commits behind at inspection, and PR #1 remained a draft.
- Existing eight-slot Advanced Generation and separate two-slot Simple outputs remained structurally preserved; no new model initializer was introduced.

## Remaining hard blockers for merge authorization

1. The source changes have **not** passed Python `compileall`, dynamic import, or any `unittest` / `pytest` here.
2. Gradio version `6.2.0` must be tested at runtime; this environment has a different installed version and no accessible repository checkout.
3. Live Simple Help, About modal focus/ESC, responsive layout, real audio download, no-LM generation, streaming failure and session switching need browser verification.
4. Actual GPU offloading, seed/batch metadata, WAV fallback, full Advanced smoke and API/CLI behavior require local evidence.
5. The persistent library from upstream #1199 and LM-wide concurrency determinism from #1283 are **deliberately outside this PR** and are not claimed delivered.

**Review 4 outcome:** Implementation hardening committed and source-level double check completed. **Implémentation préparée — validation locale finale requise — merge non autorisé.**
