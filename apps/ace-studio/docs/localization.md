# ACE Studio localization strategy

## Current scope

ACE Studio defaults to English to preserve existing browser test semantics.
A runtime EN/FR preference is persisted only in `localStorage` under the
`ace-studio:locale:v1` key. The HTML `lang` attribute changes immediately.
A typed bilingual dictionary handles the application chrome, navigation,
keyboard help, backend status captions and initial Analysis workspace labels.
This is **partial localization**, not a claim that all screens are bilingual.

## Invariants for extension

- Each dictionary key requires English and French values in the same typed
  object; do not use ad-hoc string fallback or machine translated API payloads.
- Keep backend error messages, audio metadata and user prompts as returned,
  never silently translate or reinterpret user data.
- Keep UI messages concise and suitable for screen-reader announcements.
- Tests relying on English continue to run in the default locale; add explicit
  French-mode E2E and source tests for each newly translated feature.
- Translate whole feature surfaces incrementally, including errors, notices,
  form labels, empty states, keyboard hints and accessibility names.
- Do not persist a language value that is not in the explicit allowlist.
- Review typographic overflow at 320px and 200% zoom for longer French labels.

## Remaining

Translate Create advanced forms, results/analysis details, library project
management, dataset editing, LoRA/LoKr training, connection diagnostics and
all validation errors before declaring internationalization complete.
Do not mistake the navigation-level language switch for full coverage.

