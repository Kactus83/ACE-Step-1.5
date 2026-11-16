# ACE Studio localization strategy

## Current scope

ACE Studio defaults to English to preserve existing browser test semantics.
A runtime EN/FR preference is persisted only in `localStorage` under the
`ace-studio:locale:v1` key. The HTML `lang` attribute changes immediately.
A typed bilingual dictionary handles the application chrome, navigation,
keyboard help, backend status captions, Analysis, Queue & results,
batch navigation, A/B listening and the local project library. Client-created
timestamps use Intl.DateTimeFormat in the selected interface language.
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

Translate Create basic/advanced forms, audio-card details and analysis-result
subpanels, dataset editing, LoRA/LoKr training, Connection, and application
validation errors before declaring internationalization complete. The
library's server-owned diagnostics remain verbatim when returned by Python.
Do not mistake the navigation-level language switch for full coverage.


## Checkpoint 7 — 16 November 2026

- Typed dictionaries now split into `core/locale.store.ts`,
  `core/locale.results.ts`, and `core/locale.library.ts`. Keys keep static
  TypeScript verification of both English and French translations.
- `translateLocale()` is available for pure testing; `LocaleStore.text()`
  tracks its reactive current language preference. No network or reload.
- Queue lifecycle labels, filters, empty states, status notices, dates, batch
  navigation and A/B controls are translated; backend progress descriptions
  and user-created audio metadata are intentionally not modified.
- Local project management, note/tag editing, server reference warnings,
  JSON import/export and corrupt catalog recovery guidance are translated.
- Default-English selectors are preserved for existing browser tests.
  New `localized-workspaces.spec.ts` and `locale-workspaces.test.ts` cover
  active switching and data continuity, but have **not yet executed**.

