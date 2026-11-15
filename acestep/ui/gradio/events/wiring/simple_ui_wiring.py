"""Facade for the optional five-step Gradio event wiring.

This facade preserves the upstream #1270 helper import names for test clients.
"""

from typing import Any

from .simple_ui_generation import _simple_generate_wrapper
from .simple_ui_helpers import (
    _build_metadata_html,
    _build_status_html,
    _completion_message,
    _format_duration,
    _go_random,
    _ignore_progress,
    _instrumental_lyrics_update,
    _navigate_to,
    _resolve_simple_lyrics,
    _save_audio_js,
    _start_generation,
)
from .simple_ui_model_readiness import _initialize_simple_ui_models
from .simple_ui_navigation import register_simple_ui_navigation
from .simple_ui_generation_wiring import register_simple_ui_generation


def register_simple_ui_handlers(
    demo: Any,
    dit_handler: Any,
    llm_handler: Any,
    simple_section: dict[str, Any],
    results_section: dict[str, Any],
    advanced_column: Any = None,
    simple_mode_state: Any = None,
) -> None:
    """Attach navigation and generation callbacks to Gradio components."""
    _ = demo
    register_simple_ui_navigation(simple_section, advanced_column, simple_mode_state)
    register_simple_ui_generation(simple_section, results_section, dit_handler, llm_handler)
