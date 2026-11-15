"""Deterministic regression tests for the optional five-step UI contracts.

No models, checkpoints, or service network calls are required.
"""

import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from acestep.ui.gradio.events.results.generation_progress import _lyrics_are_instrumental
from acestep.ui.gradio.events.wiring.simple_ui_contracts import (
    AUDIO_PATHS_INDEX,
    GENERATION_INFO_INDEX,
    PROGRESS_STATUS_INDEX,
    SEED_VALUE_INDEX,
)
from acestep.ui.gradio.events.wiring.simple_ui_helpers import (
    _build_status_html,
    _go_random,
    _navigate_to,
    _resolve_simple_lyrics,
    _start_generation,
    _preserve_audio_on_null,
)
from acestep.ui.gradio.events.wiring.simple_ui_model_readiness import (
    _initialize_simple_ui_models,
)
from acestep.ui.gradio.events.wiring.simple_ui_generation_results import (
    _finish_simple_generation,
)


class SimpleFoundationTests(unittest.TestCase):
    """Protect navigation, model safety, metadata positions, and rendering."""

    def test_navigation_has_exactly_five_steps(self):
        """Selected step is visible, and the other four are hidden."""
        result = _navigate_to(3, 2)
        self.assertEqual(len(result), 7)
        self.assertEqual(result[0], 3)
        self.assertEqual([v["visible"] for v in result[2:]], [False, False, True, False, False])

    def test_random_style_matches_one_textbox_output(self):
        """Random prompt returns a single nonempty string."""
        self.assertIsInstance(_go_random(), str)
        self.assertTrue(_go_random())

    def test_instrumental_sentinal_and_lyrics(self):
        """Instrumental mode is encoded without leaking user lyrics."""
        self.assertEqual(_resolve_simple_lyrics("hello", True), "[Instrumental]")
        self.assertTrue(_lyrics_are_instrumental(" [InSTrUMental] "))
        self.assertFalse(_lyrics_are_instrumental("verse"))

    def test_html_status_escapes_injected_markup(self):
        """Generated messages are always treated as text rather than HTML."""
        result = _build_status_html('<script>alert("x")</script>', False)
        self.assertNotIn("<script>", result)
        self.assertIn("&lt;script&gt;", result)

    def test_model_readiness_does_not_initialize_or_replace(self):
        """A previously loaded model remains untouched, including LM state."""
        dit = SimpleNamespace(model=object(), initialize_service=MagicMock())
        llm = SimpleNamespace(llm_initialized=False, initialize=MagicMock())
        update = _initialize_simple_ui_models(llm, dit)
        self.assertTrue(update["interactive"])
        dit.initialize_service.assert_not_called()
        llm.initialize.assert_not_called()

    def test_missing_model_disables_creation_without_loading(self):
        """Simple UI defers to advanced service setup when DiT is unavailable."""
        dit = SimpleNamespace(model=None, initialize_service=MagicMock())
        update = _initialize_simple_ui_models(None, dit)
        self.assertFalse(update["interactive"])
        dit.initialize_service.assert_not_called()

    def test_progress_contract_positions_remain_stable(self):
        """Advanced workflow still provides eight audio slots before status."""
        self.assertEqual(
            (AUDIO_PATHS_INDEX, GENERATION_INFO_INDEX, PROGRESS_STATUS_INDEX, SEED_VALUE_INDEX),
            (8, 9, 10, 11),
        )
        self.assertEqual(len(_start_generation()), 14)

    @patch("acestep.ui.gradio.events.wiring.simple_ui_generation_results.store_batch_in_queue")
    @patch("acestep.ui.gradio.events.wiring.simple_ui_generation_results._build_saved_params")
    def test_success_result_preserves_resolved_seed(self, build_params, store_batch):
        """The replay snapshot uses actual sample seed instead of random -1."""
        build_params.return_value = {"seed": "-1", "random_seed_checkbox": True}
        store_batch.return_value = {}
        data = {key: None for key in (
            "captions", "lyrics", "bpm", "key_scale", "time_signature", "vocal_language",
            "inference_steps", "guidance_scale", "random_seed_checkbox", "seed",
            "reference_audio", "audio_duration", "batch_size_input", "src_audio",
            "text2music_audio_code_string", "repainting_start", "repainting_end",
            "instruction_display_gen", "audio_cover_strength", "cover_noise_strength",
            "task_type", "no_fsq", "use_adg", "cfg_interval_start", "cfg_interval_end",
            "shift", "infer_method", "sampler_mode", "velocity_norm_threshold",
            "velocity_ema_factor", "dcw_enabled", "dcw_mode", "dcw_scaler",
            "dcw_high_scaler", "dcw_wavelet", "audio_format", "mp3_bitrate",
            "mp3_sample_rate", "lm_temperature", "think_checkbox", "lm_cfg_scale",
            "lm_top_k", "lm_top_p", "lm_negative_prompt", "use_cot_metas",
            "use_cot_caption", "use_cot_language", "constrained_decoding_debug",
            "allow_lm_batch", "auto_score", "auto_lrc", "score_scale",
            "lm_batch_chunk_size", "track_name", "complete_track_classes",
            "enable_normalization", "normalization_db", "fade_in_duration",
            "fade_out_duration", "latent_shift", "latent_rescale", "repaint_mode",
            "repaint_strength", "retake_variance", "retake_seed"
        )}
        data["audio_format"] = "wav"
        payload = tuple([None] * 8 + [
            ["first.wav", "first.json", "second.wav", "second.json"],
            "info", "Generation Complete", "1234,5678",
        ])
        output = list(_finish_simple_generation(payload, data, 0, 1, {}, {}))
        self.assertEqual(len(output[0]), 14)
        replay = store_batch.call_args.kwargs["generation_params"]
        self.assertEqual(replay["seed"], "1234,5678")
        self.assertEqual(store_batch.call_args.args[1], 1)
        self.assertFalse(replay["random_seed_checkbox"])

    def test_error_stream_null_does_not_discard_playable_audio(self):
        """An upstream null audio output must not clear a previous valid card."""
        import gradio as gr

        self.assertNotIn("value", _preserve_audio_on_null(None))
        self.assertNotIn("value", _preserve_audio_on_null(gr.update(value=None)))
        self.assertEqual(_preserve_audio_on_null("saved.wav"), "saved.wav")
        self.assertEqual(_preserve_audio_on_null(gr.update(value="new.wav"))["value"], "new.wav")

    def test_progress_skips_sentinels_and_escapes_text(self):
        """Intermediate Gradio skip payloads must not appear as user text."""
        from acestep.ui.gradio.events.wiring.simple_ui_helpers import (
            _simple_progress_update,
        )
        self.assertNotIn("value", _simple_progress_update(None))
        self.assertIn("&lt;error&gt;", _simple_progress_update("<error>")["value"])

    def test_failure_returns_fourteen_updates_and_keeps_history(self):
        """Failure moves to Done and preserves successful session batch state."""
        from acestep.ui.gradio.events.wiring.simple_ui_helpers import (
            _generation_failure_updates,
        )

        queue = {0: {"status": "completed"}}
        outputs = _generation_failure_updates("failed", 0, 1, queue, {})
        self.assertEqual(len(outputs), 14)
        self.assertFalse(outputs[4]["visible"])
        self.assertTrue(outputs[5]["visible"])
        self.assertEqual(outputs[12], queue)
        self.assertNotIn("value", outputs[8])
        self.assertNotIn("value", outputs[9])

    def test_empty_final_result_is_reported_as_failure(self):
        """An empty path list must not masquerade as a successful generation."""
        payload = tuple([None] * 8 + [[], "info", "Generation failed", ""])
        results = list(_finish_simple_generation(payload, {}, 0, 1, {}, {}))
        self.assertEqual(len(results), 1)
        self.assertEqual(len(results[0]), 14)
        self.assertIn("Generation failed", results[0][7]["value"])
        self.assertNotIn("value", results[0][0])
        self.assertNotIn("value", results[0][1])


if __name__ == "__main__":
    unittest.main()
