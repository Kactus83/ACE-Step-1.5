# Contradictory review B — workflows / UX / accessibility

Review performed against authored view templates, stores, and API contracts.
No screenshots or real keyboard/screen-reader execution were available.

## Observable source improvements

- Distinct Create, Queue & Results, Datasets, Training and Connection views with a persistent
  backend-readiness indicator.
- Advanced generation parameters are progressively disclosed; the beginner's
  prompt and instrumental choice remain prominent.
- Jobs show actual backend text and an indeterminate animation, never an
  invented numeric completion percentage.
- Result playback is loaded on user action rather than eagerly prefetching
  multiple large audio files.
- The editor accepts both local uploads and generated results as editable
  source audio for Remix/Repaint.
- Dark tokens, focus-visible treatment, responsive panels, reduced-motion
  media query, semantic buttons and labels are authored.

## Defects / missing user journeys

- Opt-in browser-decoded Repaint waveform and synchronized start/end sliders\n  now exist; the waveform and actual codec behavior still require browser QA.
- No A/B synchronized audition, favourites, tagging, batch navigation across
  sessions, or persistent remote project library.
- Dataset scan/load/save, sample editing, auto-label and preprocessing controls\n  now exist. Dataset collaboration conflicts, training export and runtime QA\n  are still outstanding.
- Source audio remains volatile; restoring a preset will never restore files.
- No true multi-panel rearrangement or keyboard hotkey map yet.
- Browser contrast, screen-reader output, 320px width, zoom, Tauri native
  keyboard behavior and audio control rendering require actual inspection.
- Backend outages are communicated but there is no one-click diagnosis panel.
- The visible source currently presents English labels; translation architecture
  and French localization have not been implemented.
- No light theme is authored; users may request it after design review.

**Review verdict:** credible working-generation studio source, but the entire
advanced-product scope is unfinished. No UI acceptance claim before local QA.



## Contradictory review D — advanced controls

The existing beginner form remains the default surface. ODE/SDE, custom
timesteps, CFG, DCW policy and 5Hz LM controls are in the previously collapsed
Advanced section via a focused child component. This avoids burdening first
time users. Explicit model-default DCW is the default, while forced-on
requires two matching submission actions to prevent accidental distortion.

Still required: actual keyboard/screen-reader interaction, mobile/zoom
inspection, clear invalid-form diagnostics, GPU resource/load warnings and
visual QA across supported systems.

