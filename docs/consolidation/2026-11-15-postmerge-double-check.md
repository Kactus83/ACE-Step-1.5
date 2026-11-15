# Post-merge duration fix — independent contradictory double check (2026-11-15)

## Review A — code, contracts, regression surface

**Baseline and containment.** Consolidation PR #1 is already merged into the fork's `main` at `d207bdd283dc726a0d9c711ca518dcf3accd1381`. The follow-up PR #3 is a separate **draft** targeting only the fork's `main`. The production diff removes an unused import and prevents LM sample metadata from overriding the fixed Simple text duration. No global generator, Advanced UI, API, CLI, model loader, or upstream contributor PR is modified.

**Adversarial question 1 — can an optional LM still override duration?** The Simple text flow sets `SIMPLE_DEFAULT_DURATION_SECONDS = 30.0` and never reassigns the local duration after optional `create_sample`. The original implementation had updated it from LM-proposed metadata, which was unbounded except for GPU maximum. The shared `generate_with_progress` still applies its hardware-duration guard.

**Adversarial question 2 — can the request and session metadata disagree?** The six newly authored tests exercise the LM-success, LM-exception, LM-error, manual-lyrics, source-Remix, and batch-metadata paths. The metadata test calls the actual Simple result finalizer and checks that the saved batch's `generation_params.audio_duration` is `30.0`. These are committed tests; **they have not been executed** in this connected-only review.

**Adversarial question 3 — is Remix changed accidentally?** The non-text path still explicitly uses `audio_duration=-1`. A focused test verifies the `cover` task, source file, unchanged duration sentinel and no LM drafting.

**Static evidence performed:** three commits ahead of current fork `main` after adding six tests, zero commits behind, five files changed, no added-line trailing whitespace, Simple production module at 200 physical lines, tests at 144 lines, no CI check runs on this head at review time.

## Review B — end-user, performance and hardware reliability

**User expectation.** The five-stage Simple text UI implicitly offers a 30-second song. An LM-generated 120-second duration or missing duration must not silently increase GPU work or override this contract; generated captions and lyrics may still improve prompt quality. Existing Advanced settings are the correct path for custom durations.

**Failure scenarios reviewed statically:**
- Successful LM draft returns short/long/missing/nonfinite duration: expected 30-second text request.
- LM throws or returns an error result: expected 30-second text request with original caption.
- Manual lyrics: expected no LM drafting, 30-second text request.
- Remix source: expected source-derived length rather than 30-second forced length.
- Completed Simple batch: expected metadata stores 30-second requested duration; output may be shorter only when the shared GPU cap requires it.

**Outstanding runtime uncertainties:** the new test module must pass under Python 3.12 and Gradio 6.2.0. A real initialized LM must produce two audio files with duration and sidecars consistent with the 30-second text contract. Check the low-memory GPU clamp, audio download and source Remix. Validate that no new fail/skip conditions arise from the tests themselves. Full suite and `git diff --check` must be executed by local CI; the source-only scan is not equivalent.

## Acceptance decision

**Authoring and source-side review complete for this narrow follow-up; runtime acceptance pending.**

Do not represent this as final local CI. Keep PR #3 in draft and do not merge without explicit authorization backed by actual test logs.
