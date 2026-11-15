# Contradictory Review 1 — Code and integration (2026-11-15)

## Method

Reviewed GitHub candidate against original upstream \`ca1e85fe9430179831e6bc6be790c332190a3866\`, read per-file changes, upstream review comments, handler signatures, component map, i18n keys and imports. **This is a static review, not a Python runtime or CI run.** A second review of user flows is recorded separately.

## Defects identified, corrective action and evidence

| Finding | Severity | Action | Validation so far |
|---|---|---|---|
| #1270 moves advanced results out of Generation tab | Blocking | Keep \`create_results_section\` inside Generation in new optional composition | Source inspected |
| #1270 reinitializes DiT/LM at load and mode switching | Blocking | Replace with read-only model readiness, manual Advanced setup | No initializer in readiness module (static) |
| Shared simple and advanced result/batch state | Major | Separate four session state components, stop wiring Simple to advanced queue | 38 component binding references resolved (static) |
| #1270 event and UI modules at 390/769 LOC plus 824-line CSS | Major | Split by responsibility; compact scoped stylesheet | 12 new UI modules <=200 LOC (static) |
| Initial split dropped \`html\`/\`t\` imports from SVG helper | Blocking | Restore imports in \`simple_ui_markup.py\` | Source inspected |
| Generation refactor had illegal 12-space yield indentation | Blocking | Correct streaming indent and extract positional dispatch adapter | Source inspected; compiler still required |
| Unescaped HTML status from generation errors | Major | Escape dynamic status and suppress Gradio skip sentinels | Source inspected; regression test committed |
| #1313 fallback file returned with wrong format metadata | Major | Update per-audio \`audio_format\` to \`wav\` in inference and Gradio | Tests committed, not run |
| #1283 request helper tests retain one-arg reference callback | Major | Update test doubles to accept \`seed\`, add forwarding assertion | Tests committed, not run |
| #1309 assertion relies on removed literal text | Major | Replace with \`DIRECT_CONDITIONING_TASKS\` contract | Tests committed, not run |
| Seed replay stored requested random value instead of resolved | Major | Save the actual returned seeds with random flag cleared | Mock test committed, not run |
| Custom JavaScript download potentially brittle/unsafe | Major | Use native Gradio 6 \`gr.Audio(buttons=["download"])\` | Docs/API cross-check, not clicked in browser |
| Empty prompt and missing model could leave Creating active | Major | Preflight and generator exception paths return explicit Done/error tuple | Tests committed, not run |
| Source audio Remix accidentally enters LM draft creation | Major | Skip draft creation when source audio is present | Source inspected |
| Implicit "Best Pick" with no ranking | UX misleading | Replace with neutral versions 1/2 | Source inspected |

## Checks run (static only)

- GitHub fork/upstream \`main\` SHA equality checked.
- Branch versus \`main\`: fast-forward commits ahead, no divergence at inspection.
- Matched all 38 referenced simple component keys against builder exports.
- Matched all 38 simple translation lookups against \`en.json\`.
- Audited file lengths for 12 new UI Python modules: none over 200 lines.
- Compared generation call's 67 required positional parameters and saved-params call's 61 required parameters to historical source. New offline AST test enforces order.
- Confirmed advanced results builder still resides under Generation tab and Simple has separate batch queue fields.
- Verified two Simple \`gr.Audio\` controls use Gradio's native download button.

## Not verified

\`python -m compileall\`, targeted/all \`unittest\`, imports, Gradio layout launch, source exports, CUDA/ROCm/MPS/XPU/MLX, and true API/CLI execution. The local shell cannot resolve GitHub, and the available GitHub connection is file/commit oriented, not an executable Python runtime. The static checks above cannot prove code compiles.

**Review 1 verdict:** Critical source defects found and corrected; **local compilation and tests still mandatory**.
