"""Focused builder for two audio result players."""

import html
from typing import Any

import gradio as gr

from acestep.ui.gradio.i18n import t

def _build_step_results() -> tuple[gr.Column, dict[str, Any]]:
    """Build Step 5: Results."""
    with gr.Column(visible=False, elem_id="simple-step-5", elem_classes="simple-step") as col:
        gr.HTML(
            '<div class="simple-divider">'
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">'
            '<path d="M12 3l1.91 5.87L20 9.73l-4.88 4.12 1.38 6.15L12 16.5l-4.5 3.5 1.38-6.15L4 9.73l6.09-.86L12 3z"/>'
            '</svg>'
            f'<span>{html.escape(t("simple_flow.your_music"))}</span>'
            '</div>',
            elem_classes=["simple-divider-wrap"],
        )
        with gr.Row(elem_classes="simple-results-row"):
            with gr.Column(scale=1, elem_classes="simple-result-col") as simple_result_col_1:
                gr.HTML(
                    '<div class="simple-best-badge">'
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" width="12" height="12">'
                    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
                    f'</svg> {html.escape(t("simple_flow.result_one"))}'
                    '</div>'
                )
                simple_generated_audio_1 = gr.Audio(
                    label=t("simple_flow.result_one"),
                    type="filepath",
                    interactive=False,
                    editable=False,
                    show_label=False,
                    container=False,
                    buttons=["download"],
                    elem_classes=["simple-audio"],
                )
                with gr.Row(elem_classes="simple-meta-row"):
                    simple_metadata_1 = gr.HTML(
                        value="",
                        elem_classes=["simple-metadata"],
                    )
            with gr.Column(scale=1, elem_classes="simple-result-col") as simple_result_col_2:
                gr.HTML(
                    '<div class="simple-best-badge simple-best-badge-placeholder">'
                    f'{html.escape(t("simple_flow.result_two"))}</div>'
                )
                simple_generated_audio_2 = gr.Audio(
                    label=t("simple_flow.result_two"),
                    type="filepath",
                    interactive=False,
                    editable=False,
                    show_label=False,
                    container=False,
                    buttons=["download"],
                    elem_classes=["simple-audio"],
                )
                with gr.Row(elem_classes="simple-meta-row"):
                    simple_metadata_2 = gr.HTML(
                        value="",
                        elem_classes=["simple-metadata"],
                    )
        simple_gen_info = gr.HTML(
            value="",
            elem_classes=["simple-gen-info"],
        )
        with gr.Row(elem_classes="simple-footer-row"):
            simple_retry_btn = gr.Button(
                t("simple_flow.retry"),
                variant="secondary",
                size="sm",
                elem_classes=["simple-retry-btn"],
            )
            simple_new_btn = gr.Button(
                t("simple_flow.new_song"),
                variant="secondary",
                size="sm",
                elem_classes=["simple-new-btn"],
            )
    return col, {
        "simple_step_5": col,
        "simple_generated_audio_1": simple_generated_audio_1,
        "simple_generated_audio_2": simple_generated_audio_2,
        "simple_result_col_1": simple_result_col_1,
        "simple_result_col_2": simple_result_col_2,
        "simple_metadata_1": simple_metadata_1,
        "simple_metadata_2": simple_metadata_2,
        "simple_gen_info": simple_gen_info,
        "simple_retry_btn": simple_retry_btn,
        "simple_new_btn": simple_new_btn,
    }


