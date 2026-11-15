"""UI-only presentation, navigation, and failure-state helpers.

These helpers never load model weights or mutate the inference service.
"""

import html
import random
from typing import Any

import gradio as gr

from acestep.ui.gradio.i18n import t
from acestep.ui.gradio.interfaces.simple_ui_markup import _step_indicator_html


_RANDOM_STYLES = [
    "A happy pop song with piano and drums",
    "A chill lo-fi beat with smooth guitar",
    "An energetic rock anthem with electric guitar",
    "A jazzy piano ballad with saxophone",
    "A peaceful ambient track with soft pads",
    "An upbeat funk song with bass and horns",
    "A soulful R&B track with smooth vocals",
    "An acoustic folk song with gentle strumming",
    "A cinematic orchestral piece with strings",
    "A driving electronic dance track with synths",
    "A dreamy synthwave track with retro vibes",
    "A melancholic piano piece with strings",
    "An uplifting orchestral film score",
    "A groovy disco track with funky bass",
]


def _format_duration(seconds: float) -> str:
    """Format seconds to human-readable duration string."""
    if seconds <= 0:
        return ""
    secs = int(seconds)
    if secs < 60:
        return f"{secs}s"
    return f"{secs // 60}m {secs % 60}s"


def _build_metadata_html(duration: float, fmt: str) -> str:
    """Build an HTML metadata string for a result card."""
    dur = _format_duration(duration)
    parts = [p for p in [dur, fmt.upper()] if p]
    return f'<span class="simple-meta-text">{" · ".join(parts)}</span>' if parts else ""


def _build_status_html(message: str, is_success: bool) -> str:
    cls = "success" if is_success else "info"
    return (
        f'<div class="simple-gen-status {cls}">'
        f"  {html.escape(str(message))}"
        f"</div>"
    )


def _resolve_simple_lyrics(lyrics: str, instrumental: bool) -> str:
    """Return the generator lyrics value for the selected vocal mode."""
    return "[Instrumental]" if instrumental else (lyrics or "")


def _instrumental_lyrics_update(instrumental: bool) -> dict:
    """Disable manual lyrics while instrumental generation is selected."""
    return gr.update(interactive=not instrumental)


def _completion_message() -> str:
    """Return a translated completion message with an English fallback."""
    message = t("messages.generation_complete")
    return "Generation complete" if message == "messages.generation_complete" else message


def _ignore_progress(*args: Any, **kwargs: Any) -> None:
    """Suppress native Gradio progress when the Simple UI renders its own status."""


def _navigate_to(target: int, current_step: int) -> tuple:
    """Navigate to a step — returns visibility updates for each column.

    Args:
        target: Step number to navigate to (1-5).
        current_step: Previous step number (unused, for state tracking).

    Returns:
        Tuple of (step_number, indicator_html, col1_vis, col2_vis, col3_vis, col4_vis, col5_vis).
    """
    _ = current_step
    step_vis = [gr.update(visible=(i + 1 == target)) for i in range(5)]
    indicator = _step_indicator_html(target)
    return (target, gr.update(value=indicator), *step_vis)


def _go_random() -> str:
    """Return exactly one style for the single Gradio Textbox output."""
    return random.choice(_RANDOM_STYLES)


def _start_generation() -> tuple:
    """Non-generator setup: navigate to step 4 (Creating...)."""
    return (
        gr.skip(),  # 0: audio_1
        gr.skip(),  # 1: audio_2
        gr.update(value=_step_indicator_html(4)),  # 2: step indicator
        gr.update(visible=False),  # 3: step 3 hidden
        gr.update(visible=True),  # 4: step 4 visible
        gr.update(visible=False),  # 5: step 5 hidden
        gr.update(value=(
            '<div class="simple-progress-status">'
            + html.escape(t("simple_flow.preparing"))
            + '</div>'
        )),  # 6: progress text
        gr.skip(),  # 7: gen info
        gr.skip(),  # 8: metadata 1
        gr.skip(),  # 9: metadata 2
        gr.skip(), gr.skip(), gr.skip(), gr.skip(),  # 10-13: batch state
    )



def _generation_failure_updates(
    message: str,
    current_batch_index: int,
    total_batches: int,
    batch_queue: dict,
    generation_params_state: dict,
) -> tuple:
    """Exit Creating while retaining any playable audio from earlier batches."""
    return (
        gr.skip(),
        gr.skip(),
        gr.update(value=_step_indicator_html(5)),
        gr.update(visible=False),
        gr.update(visible=False),
        gr.update(visible=True),
        gr.update(value=""),
        gr.update(value=_build_status_html(message, False)),
        gr.update(value=""),
        gr.update(value=""),
        current_batch_index, total_batches, batch_queue, generation_params_state,
    )

def _simple_progress_update(status: Any) -> dict:
    """Only render actual status strings, never Gradio skip/update sentinels."""
    if not isinstance(status, str) or not status.strip():
        return gr.skip()
    return gr.update(
        value='<div class="simple-progress-status">'
        + html.escape(status)
        + '</div>'
    )
