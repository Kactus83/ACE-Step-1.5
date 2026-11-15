"""Regression tests for the fixed Simple UI text-generation duration.

The optional language-model drafting step must not override the 30-second
user-facing contract or silently enable the backend's longer default.
These tests use mocks and never load model checkpoints.
"""

import unittest
from types import SimpleNamespace
from unittest.mock import patch

from acestep.ui.gradio.events.wiring.simple_ui_generation import (
    SIMPLE_DEFAULT_DURATION_SECONDS,
    _simple_generate_wrapper,
)


class SimpleUiDurationTests(unittest.TestCase):
    """Validate duration invariants across optional-LM and Remix paths."""

    def _run_generation(
        self,
        *,
        src_audio=None,
        lyrics="",
        llm_initialized=True,
        draft_result=None,
        draft_error=None,
    ):
        """Exercise the generator with mocked inference and return dispatch state."""
        dit = SimpleNamespace(model=object())
        llm = SimpleNamespace(llm_initialized=llm_initialized)
        with (
            patch(
                "acestep.ui.gradio.events.wiring.simple_ui_generation.create_sample",
                return_value=draft_result,
                side_effect=draft_error,
            ) as sample,
            patch(
                "acestep.ui.gradio.events.wiring.simple_ui_generation._dispatch_existing_generation",
                return_value=iter([tuple([None] * 12)]),
            ) as dispatch,
            patch(
                "acestep.ui.gradio.events.wiring.simple_ui_generation._finish_simple_generation",
                return_value=iter(()),
            ),
        ):
            list(_simple_generate_wrapper(
                dit, llm, "ambient piano", lyrics, False, src_audio, 0, 0, {}, {},
            ))
            self.assertEqual(dispatch.call_count, 1)
            return dispatch.call_args.args[2], sample.call_count

    def test_lm_duration_metadata_cannot_override_thirty_seconds(self):
        """Missing, short, long or malformed LM duration is informational only."""
        durations = [None, -1.0, 10.0, 120.0, float("nan")]
        for candidate in durations:
            with self.subTest(lm_duration=repr(candidate)):
                params, calls = self._run_generation(
                    draft_result=SimpleNamespace(
                        success=True,
                        caption="drafted caption",
                        lyrics="drafted lyrics",
                        duration=candidate,
                    ),
                )
                self.assertEqual(calls, 1)
                self.assertEqual(
                    params["audio_duration"],
                    SIMPLE_DEFAULT_DURATION_SECONDS,
                )
                self.assertEqual(params["captions"], "drafted caption")
                self.assertEqual(params["lyrics"], "drafted lyrics")

    def test_lm_draft_failure_keeps_thirty_second_default(self):
        """A draft exception must fall back to fixed-duration DiT generation."""
        params, calls = self._run_generation(
            draft_error=RuntimeError("draft model unavailable"),
        )
        self.assertEqual(calls, 1)
        self.assertEqual(params["audio_duration"], 30.0)

    def test_lm_reports_failure_without_changing_default(self):
        """An unsuccessful LM response must preserve the user's duration."""
        params, calls = self._run_generation(
            draft_result=SimpleNamespace(
                success=False,
                status_message="metadata unavailable",
                duration=180.0,
            ),
        )
        self.assertEqual(calls, 1)
        self.assertEqual(params["audio_duration"], 30.0)
        self.assertEqual(params["captions"], "ambient piano")

    def test_duration_is_preserved_in_simple_batch_metadata(self):
        """A finished Simple batch retains the requested text duration."""
        from acestep.ui.gradio.events.results.batch_management_helpers import (
            _apply_param_defaults,
        )
        from acestep.ui.gradio.events.wiring.simple_ui_generation_results import (
            _finish_simple_generation,
        )

        params = {}
        _apply_param_defaults(params)
        params.update({
            "captions": "ambient piano",
            "lyrics": "drafted lyrics",
            "audio_duration": SIMPLE_DEFAULT_DURATION_SECONDS,
        })
        result = tuple([None] * 8 + [
            ["song.flac", "song.json"],
            "generation info",
            "Generation Complete",
            "4242",
        ])
        output = list(_finish_simple_generation(result, params, 0, 0, {}, {}))
        self.assertEqual(len(output), 1)
        self.assertEqual(len(output[0]), 14)
        self.assertEqual(output[0][13]["audio_duration"], 30.0)
        self.assertEqual(
            output[0][12][0]["generation_params"]["audio_duration"],
            30.0,
        )

    def test_manual_lyrics_do_not_trigger_drafting(self):
        """Explicit user lyrics must bypass LM drafting and retain 30 seconds."""
        params, calls = self._run_generation(lyrics="Verse one")
        self.assertEqual(calls, 0)
        self.assertEqual(params["audio_duration"], 30.0)

    def test_cover_keeps_source_audio_duration_and_skips_drafting(self):
        """Remix duration is source-dependent, not subject to the text contract."""
        params, calls = self._run_generation(src_audio="uploaded.wav")
        self.assertEqual(calls, 0)
        self.assertEqual(params["task_type"], "cover")
        self.assertEqual(params["src_audio"], "uploaded.wav")
        self.assertEqual(params["audio_duration"], -1)


if __name__ == "__main__":
    unittest.main()
