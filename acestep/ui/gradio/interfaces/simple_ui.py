"""Composition facade for the optional five-step Gradio interface."""

from typing import Any

import gradio as gr

from acestep.ui.gradio.i18n import t

from .simple_ui_markup import _about_overlay_html, _build_header, _step_indicator_html
from .simple_ui_steps import (_build_step_describe, _build_step_lyrics, _build_step_remix, _build_step_creating)
from .simple_ui_results import _build_step_results


def build_simple_ui() -> dict[str, Any]:
    """Build the optional stepped-flow simplified UI.

    Returns:
        A merged component map for all simple-UI controls.
    """
    with gr.Column(visible=True, elem_id="simple-ui-column") as simple_column:
        gr.HTML(_build_header())

        # ── Hamburger toggle button ──
        simple_hamburger_btn = gr.Button(
            t("simple_flow.menu"),
            elem_classes=["simple-hamburger-btn"],
        )

        # ── Dropdown menu (hidden by default) ──
        with gr.Group(visible=False, elem_classes="simple-hamburger-menu") as simple_hamburger_menu:
            simple_about_btn = gr.Button(
                t("simple_flow.about"),
                elem_classes=["simple-menu-item", "simple-menu-about"],
            )
            simple_help_btn = gr.Button(
                t("simple_flow.help"),
                elem_classes=["simple-menu-item", "simple-menu-help"],
            )
            simple_advanced_btn = gr.Button(
                t("simple_flow.advanced_mode"),
                elem_classes=["simple-menu-item", "simple-menu-advanced"],
            )

        # ── About overlay (hidden by default) ──
        with gr.Group(
            visible=False,
            elem_classes=["simple-about-overlay", "simple-about-backdrop"],
        ) as simple_about_overlay:
            with gr.Column(elem_classes=["simple-about-modal"]):
                simple_about_close_btn = gr.Button(
                    "×", elem_classes=["simple-about-close"], size="sm"
                )
                gr.HTML(value=_about_overlay_html())

        simple_step_indicator = gr.HTML(
            value=_step_indicator_html(1),
            elem_classes=["simple-step-indicator"],
        )
        _, step1 = _build_step_describe()
        _, step2 = _build_step_lyrics()
        _, step3 = _build_step_remix()
        _, step4 = _build_step_creating()
        _, step5 = _build_step_results()
        simple_state_current_step = gr.State(value=1)
        simple_state_song_style = gr.State(value="")
        simple_state_lyrics = gr.State(value="")
        simple_state_audio = gr.State(value=None)
        simple_hamburger_state = gr.State(value=False)
        # Separate session state: the advanced eight-slot batch queue is never mutated
        # by the experimental two-slot workflow.
        simple_current_batch_index = gr.State(value=0)
        simple_total_batches = gr.State(value=0)
        simple_batch_queue = gr.State(value={})
        simple_generation_params_state = gr.State(value={})

    result: dict[str, Any] = {
        "simple_column": simple_column,
        "simple_hamburger_btn": simple_hamburger_btn,
        "simple_hamburger_menu": simple_hamburger_menu,
        "simple_hamburger_state": simple_hamburger_state,
        "simple_current_batch_index": simple_current_batch_index,
        "simple_total_batches": simple_total_batches,
        "simple_batch_queue": simple_batch_queue,
        "simple_generation_params_state": simple_generation_params_state,
        "simple_about_btn": simple_about_btn,
        "simple_help_btn": simple_help_btn,
        "simple_advanced_btn": simple_advanced_btn,
        "simple_about_overlay": simple_about_overlay,
        "simple_about_close_btn": simple_about_close_btn,
        "simple_step_indicator": simple_step_indicator,
        "simple_state_current_step": simple_state_current_step,
        "simple_state_song_style": simple_state_song_style,
        "simple_state_lyrics": simple_state_lyrics,
        "simple_state_audio": simple_state_audio,
    }
    for d in (step1, step2, step3, step4, step5):
        result.update(d)
    return result
