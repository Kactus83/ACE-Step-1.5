"""Executable regression checks for streaming error recovery.

These tests mock generation and never download model weights.
"""

import unittest
from types import SimpleNamespace
from unittest.mock import patch


class SimpleUiStreamingTests(unittest.TestCase):
    """Protect recoverable Gradio state transitions and partial audio outputs."""

    def test_streaming_failure_keeps_prior_audio_and_returns_to_done(self):
        """An exception after a partial update must not strand the UI at Creating."""
        import gradio as gr
        from acestep.ui.gradio.events.wiring.simple_ui_generation import (
            _simple_generate_wrapper,
        )

        def failing_stream():
            yield tuple([None, gr.update(value="new.wav")] + [None] * 10)
            raise RuntimeError("synthetic stream failure")

        dit = SimpleNamespace(model=object())
        llm = SimpleNamespace(llm_initialized=False)
        with patch(
            "acestep.ui.gradio.events.wiring.simple_ui_generation._dispatch_existing_generation",
            return_value=failing_stream(),
        ):
            outputs = list(_simple_generate_wrapper(
                dit, llm, "test style", "lyrics", False, None, 0, 0, {}, {},
            ))

        self.assertEqual(len(outputs), 3)
        self.assertNotIn("value", outputs[1][0])
        self.assertEqual(outputs[1][1]["value"], "new.wav")
        self.assertEqual(len(outputs[-1]), 14)
        self.assertTrue(outputs[-1][5]["visible"])
        self.assertFalse(outputs[-1][4]["visible"])

    def test_unloaded_model_generation_fails_without_dispatch(self):
        """Model absence should fail cleanly rather than attempting inference."""
        from acestep.ui.gradio.events.wiring.simple_ui_generation import (
            _simple_generate_wrapper,
        )

        with patch(
            "acestep.ui.gradio.events.wiring.simple_ui_generation._dispatch_existing_generation",
        ) as dispatch:
            outputs = list(_simple_generate_wrapper(
                None, None, "test style", "", False, None, 0, 0, {}, {},
            ))
        dispatch.assert_not_called()
        self.assertEqual(len(outputs), 1)
        self.assertTrue(outputs[0][5]["visible"])


if __name__ == "__main__":
    unittest.main()
