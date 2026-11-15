"""Generation, retry and reset handlers for the optional simple workflow."""

from typing import Any

import gradio as gr

from acestep.ui.gradio.interfaces.simple_ui_markup import _step_indicator_html
from .simple_ui_generation import _simple_generate_wrapper
from .simple_ui_helpers import _navigate_to, _start_generation


def register_simple_ui_generation(
    gs: dict[str, Any],
    results_section: dict[str, Any],
    dit_handler: Any,
    llm_handler: Any,
) -> None:
    """Wire generation with independent state; preserve all advanced batches."""
    _ = results_section
    _nav_outputs = [
        gs["simple_state_current_step"],
        gs["simple_step_indicator"],
        gs["simple_step_1"],
        gs["simple_step_2"],
        gs["simple_step_3"],
        gs["simple_step_4"],
        gs["simple_step_5"],
    ]
    # ── Generate (Create Music) ──
    _gen_outputs = [
        gs["simple_generated_audio_1"],          # 0
        gs["simple_generated_audio_2"],          # 1
        gs["simple_step_indicator"],             # 2
        gs["simple_step_3"],                     # 3 — hide remix screen
        gs["simple_step_4"],                     # 4
        gs["simple_step_5"],                     # 5
        gs["simple_progress_text"],              # 6
        gs["simple_gen_info"],                   # 7
        gs["simple_metadata_1"],  # 8
        gs["simple_metadata_2"],  # 9
        gs["simple_current_batch_index"],   # 10
        gs["simple_total_batches"],         # 11
        gs["simple_batch_queue"],           # 12
        gs["simple_generation_params_state"], # 13
    ]

    _gen_shared_inputs = [
        gs["simple_song_style"],
        gs["simple_lyrics"],
        gs["simple_instrumental"],
        gs["simple_src_audio"],
        gs["simple_current_batch_index"],
        gs["simple_total_batches"],
        gs["simple_batch_queue"],
        gs["simple_generation_params_state"],
    ]

    # Generator must be a bare generator function (not wrapped in lambda)
    # so Gradio 6 can detect 'generator': True via introspection.
    def _gen_wrapper(style, lyrics, instrumental, src, bi, tb, bq, gps):
        yield from _simple_generate_wrapper(
            dit_handler, llm_handler, style, lyrics, instrumental, src, bi, tb, bq, gps,
        )

    gs["simple_create_btn"].click(
        fn=_start_generation,
        inputs=[],
        outputs=_gen_outputs,
        show_progress="hidden",
    ).then(
        fn=_gen_wrapper,
        inputs=_gen_shared_inputs,
        outputs=_gen_outputs,
        show_progress="hidden",
    )

    # ── Retry (Try Different Style) ──
    gs["simple_retry_btn"].click(
        fn=lambda style, lyrics, audio, state: _navigate_to(1, state),
        inputs=[
            gs["simple_song_style"], gs["simple_lyrics"],
            gs["simple_src_audio"], gs["simple_state_current_step"],
        ],
        outputs=_nav_outputs,
    )

    # ── New Song (reset all) ──
    _new_song_outputs = _nav_outputs + [
        gs["simple_song_style"],
        gs["simple_lyrics"],
        gs["simple_instrumental"],
        gs["simple_src_audio"],
        gs["simple_generated_audio_1"],
        gs["simple_generated_audio_2"],
        gs["simple_metadata_1"],
        gs["simple_metadata_2"],
        gs["simple_gen_info"],
    ]

    gs["simple_new_btn"].click(
        fn=lambda: (
            1,
            gr.update(value=_step_indicator_html(1)),
            gr.update(visible=True),        # step 1 show
            gr.update(visible=False),       # step 2 hide
            gr.update(visible=False),       # step 3 hide
            gr.update(visible=False),       # step 4 hide
            gr.update(visible=False),       # step 5 hide
            gr.update(value=""),
            gr.update(value=""),
            gr.update(value=False),
            gr.update(value=None),
            gr.update(value=None),
            gr.update(value=None),
            gr.update(value=""),
            gr.update(value=""),
            gr.update(value=""),
        ),
        inputs=[],
        outputs=_new_song_outputs,
    )
