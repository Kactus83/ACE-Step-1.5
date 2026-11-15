"""Read-only generation readiness for the optional simple interface."""

from typing import Any

import gradio as gr


def _initialize_simple_ui_models(
    llm_handler: Any = None,
    dit_handler: Any = None,
) -> dict:
    """Return a button state without loading or replacing any model.

    Model initialization remains owned by Advanced service configuration.
    LM initialization is optional for direct DiT generation.
    """
    _ = llm_handler
    ready = bool(dit_handler is not None and getattr(dit_handler, "model", None) is not None)
    return gr.update(
        interactive=ready,
        value="Create Music" if ready else "Load a model in Advanced settings",
    )
