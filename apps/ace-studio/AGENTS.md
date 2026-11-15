# ACE Studio local agent instructions

This independent app follows the repository's root `AGENTS.md`. Keep modules
focused (target <=150 LOC, hard cap 200 unless justified in a review), use
Angular 21 standalone components, strict TypeScript, signals, typed DTOs and
public TSDoc for all exported APIs.

Do not modify traditional Gradio, Python inference, CLI or training behavior
unless strictly necessary for a new opt-in integration and approved contract.
Do not introduce direct Tauri imports in Angular business modules. Add a browser
fallback for every future native capability.

The standalone ACE-Step API, not the frontend, owns model/job/media state.
Do not fabricate GPU progress or treat aborting fetch as job cancellation.
API credentials are session-only. Protect backend audio URL origin constraints.

Every behavior change gets a focused unit test and a named manual acceptance
step. Include exact command evidence when tests were actually run. If the web
environment cannot compile, advance source safely and leave an explicit,
granular implementation/verification distinction for local CI.

Work only on `feature/ace-studio-angular-tauri`, update the draft PR #2,
never merge or force-push, and never interfere with consolidation PR #1.

