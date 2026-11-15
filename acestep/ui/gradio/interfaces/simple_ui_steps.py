"""Focused component builders for simple creation, lyrics and source audio."""

import html
from typing import Any

import gradio as gr

from acestep.ui.gradio.i18n import t

def _build_step_describe() -> tuple[gr.Column, dict[str, Any]]:
    """Build Step 1: Describe your song."""
    with gr.Column(visible=True, elem_id="simple-step-1", elem_classes="simple-step") as col:
        simple_song_style = gr.Textbox(
            label=t("simple_flow.describe_label"),
            placeholder=t("simple_flow.describe_placeholder"),
            lines=3,
            elem_classes=["simple-input"],
        )
        with gr.Row(elem_classes="simple-nav-row"):
            simple_random_btn = gr.Button(
                t("simple_flow.surprise"),
                variant="secondary",
                size="sm",
                elem_classes=["simple-random-btn"],
            )
            simple_step1_continue_btn = gr.Button(
                t("simple_flow.continue"),
                variant="primary",
                size="sm",
                elem_classes=["simple-continue-btn"],
            )
    return col, {
        "simple_step_1": col,
        "simple_song_style": simple_song_style,
        "simple_random_btn": simple_random_btn,
        "simple_step1_continue_btn": simple_step1_continue_btn,
    }


def _build_step_lyrics() -> tuple[gr.Column, dict[str, Any]]:
    """Build Step 2: Lyrics."""
    with gr.Column(visible=False, elem_id="simple-step-2", elem_classes="simple-step") as col:
        simple_lyrics = gr.Textbox(
            label=t("simple_flow.lyrics_label"),
            placeholder=t("simple_flow.lyrics_placeholder"),
            lines=8,
            elem_classes=["simple-input", "simple-lyrics"],
        )
        simple_instrumental = gr.Checkbox(
            label=t("simple_flow.instrumental_only"),
            info=t("simple_flow.instrumental_info"),
            value=False,
            elem_classes=["simple-instrumental"],
        )
        with gr.Row(elem_classes="simple-nav-row"):
            simple_step2_back_btn = gr.Button(
                t("simple_flow.back"),
                variant="secondary",
                size="sm",
                elem_classes=["simple-back-btn"],
            )
            simple_step2_continue_btn = gr.Button(
                t("simple_flow.continue"),
                variant="primary",
                size="sm",
                elem_classes=["simple-continue-btn"],
            )
    return col, {
        "simple_step_2": col,
        "simple_lyrics": simple_lyrics,
        "simple_instrumental": simple_instrumental,
        "simple_step2_back_btn": simple_step2_back_btn,
        "simple_step2_continue_btn": simple_step2_continue_btn,
    }


def _build_step_remix() -> tuple[gr.Column, dict[str, Any]]:
    """Build Step 3: Remix / Create."""
    with gr.Column(visible=False, elem_id="simple-step-3", elem_classes="simple-step") as col:
        gr.HTML(
            f'<div class="simple-upload-label">{html.escape(t("simple_flow.remix_prompt"))}</div>',
            elem_classes=["simple-upload-label-wrap"],
        )
        simple_src_audio = gr.Audio(
            label=t("simple_flow.remix_upload"),
            type="filepath",
            sources=["upload"],
            elem_classes=["simple-upload-area"],
        )
        with gr.Row(elem_classes=["simple-nav-row", "simple-remix-nav"]):
            simple_step3_back_btn = gr.Button(
                t("simple_flow.back"),
                variant="secondary",
                size="sm",
                elem_classes=["simple-back-btn"],
            )
            simple_create_btn = gr.Button(
                t("simple_flow.loading_models"),
                variant="primary",
                size="sm",
                interactive=False,
                elem_id="simple-create-btn",
                elem_classes=["simple-create-btn"],
            )
    return col, {
        "simple_step_3": col,
        "simple_src_audio": simple_src_audio,
        "simple_step3_back_btn": simple_step3_back_btn,
        "simple_create_btn": simple_create_btn,
    }


def _build_step_creating() -> tuple[gr.Column, dict[str, Any]]:
    """Build Step 4: Creating..."""
    with gr.Column(visible=False, elem_id="simple-step-4", elem_classes="simple-step") as col:
        gr.HTML(
            '<div class="simple-creating-icon">'
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48">'
            '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
            '</svg></div>'
        )
        gr.HTML(
            f'<div class="simple-creating-title">'
            f'{html.escape(t("simple_flow.creating_status"))}</div>'
        )
        gr.HTML(
            '<div class="simple-progress-track">'
            '<div class="simple-progress-bar" id="simple-progress-bar"></div>'
            '</div>'
        )
        simple_progress_text = gr.HTML(
            value=(
                '<div class="simple-progress-status">'
                + html.escape(t("simple_flow.preparing"))
                + '</div>'
            ),
            elem_classes=["simple-progress-status"],
        )
    return col, {
        "simple_step_4": col,
        "simple_progress_text": simple_progress_text,
    }


