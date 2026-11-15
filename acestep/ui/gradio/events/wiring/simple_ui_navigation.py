"""Navigation and mode-switch wiring for the optional simple workflow."""

from typing import Any

import gradio as gr

from .simple_ui_helpers import _go_random, _instrumental_lyrics_update, _navigate_to


def register_simple_ui_navigation(
    gs: dict[str, Any], advanced_column: Any, simple_mode_state: Any
) -> None:
    """Wire step navigation, help, and explicit Advanced mode switching."""
    # ── Navigation outputs ──
    _nav_outputs = [
        gs["simple_state_current_step"],
        gs["simple_step_indicator"],
        gs["simple_step_1"],
        gs["simple_step_2"],
        gs["simple_step_3"],
        gs["simple_step_4"],
        gs["simple_step_5"],
    ]

    # ── Step 1 → Step 2 ──
    gs["simple_step1_continue_btn"].click(
        fn=lambda state: _navigate_to(2, state),
        inputs=[gs["simple_state_current_step"]],
        outputs=_nav_outputs,
    )
    # ── Step 2 Back ──
    gs["simple_step2_back_btn"].click(
        fn=lambda state: _navigate_to(1, state),
        inputs=[gs["simple_state_current_step"]],
        outputs=_nav_outputs,
    )
    # ── Step 2 → Step 3 ──
    gs["simple_step2_continue_btn"].click(
        fn=lambda state: _navigate_to(3, state),
        inputs=[gs["simple_state_current_step"]],
        outputs=_nav_outputs,
    )
    gs["simple_instrumental"].change(
        fn=_instrumental_lyrics_update,
        inputs=[gs["simple_instrumental"]],
        outputs=[gs["simple_lyrics"]],
    )

    # ── Step 3 Back ──
    gs["simple_step3_back_btn"].click(
        fn=lambda state: _navigate_to(2, state),
        inputs=[gs["simple_state_current_step"]],
        outputs=_nav_outputs,
    )

    # ── Hamburger toggle ──
    gs["simple_hamburger_btn"].click(
        fn=lambda state: (
            gr.update(visible=not state),
            not state,
        ),
        inputs=[gs["simple_hamburger_state"]],
        outputs=[gs["simple_hamburger_menu"], gs["simple_hamburger_state"]],
    )

    # ── About overlay ──
    gs["simple_about_btn"].click(
        fn=lambda: (
            gr.update(visible=False),   # close menu
            False,                       # menu state = closed
            gr.update(visible=True),     # show overlay
        ),
        inputs=[],
        outputs=[gs["simple_hamburger_menu"], gs["simple_hamburger_state"], gs["simple_about_overlay"]],
    )
    gs["simple_about_close_btn"].click(
        fn=lambda: gr.update(visible=False),
        inputs=[],
        outputs=[gs["simple_about_overlay"]],
    )

    # ── Help (activate only the modal mounted in the visible Simple column) ──
    gs["simple_help_btn"].click(
        fn=lambda: (
            gr.update(visible=False),   # close menu
            False,
        ),
        inputs=[],
        outputs=[gs["simple_hamburger_menu"], gs["simple_hamburger_state"]],
        js="""() => {
            var btn = document.querySelector('#simple-ui-column .help-inline-btn');
            if (btn) btn.click();
        }""",
    )

    # ── Advanced Mode (from hamburger menu) ──
    if advanced_column is not None and simple_mode_state is not None:
        gs["simple_advanced_btn"].click(
            fn=lambda: (
                gr.update(visible=False),   # close menu
                False,                       # menu state = closed
                gr.update(visible=False),    # hide simple column
                gr.update(visible=True),     # show advanced column
                "Advanced",                  # state = Advanced
            ),
            inputs=[],
            outputs=[
                gs["simple_hamburger_menu"], gs["simple_hamburger_state"],
                gs["simple_column"], advanced_column, simple_mode_state,
            ],
        )

    # ── Random Style ──
    gs["simple_random_btn"].click(
        fn=_go_random,
        inputs=[],
        outputs=[gs["simple_song_style"]],
    )
