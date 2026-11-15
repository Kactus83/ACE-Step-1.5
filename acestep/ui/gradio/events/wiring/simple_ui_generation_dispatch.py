"""Bridge simple flow parameters to the upstream progress generator.

Maintain the positional signature in one reviewable location. This adapter
must be verified against the upstream progress contract after each rebase.
"""

from typing import Any

from acestep.ui.gradio.events.results.generation_progress import generate_with_progress
from .simple_ui_helpers import _ignore_progress


def _dispatch_existing_generation(
    dit_handler: Any,
    llm_handler: Any,
    params: dict[str, Any],
):
    """Return the existing Gradio generator without altering core inference."""
    return generate_with_progress(
        dit_handler, llm_handler,
        params["captions"], params["lyrics"], params["bpm"],
        params["key_scale"], params["time_signature"], params["vocal_language"],
        params["inference_steps"], params["guidance_scale"],
        params["random_seed_checkbox"], params["seed"],
        params["reference_audio"], params["audio_duration"],
        params["batch_size_input"], params["src_audio"],
        params["text2music_audio_code_string"],
        params["repainting_start"], params["repainting_end"],
        params["instruction_display_gen"],
        params["audio_cover_strength"], params["cover_noise_strength"],
        params["task_type"],
        params["no_fsq"], params["use_adg"],
        params["cfg_interval_start"], params["cfg_interval_end"],
        params["shift"], params["infer_method"], params["sampler_mode"],
        params["velocity_norm_threshold"], params["velocity_ema_factor"],
        params["dcw_enabled"], params["dcw_mode"],
        params["dcw_scaler"], params["dcw_high_scaler"], params["dcw_wavelet"],
        params["custom_timesteps"],
        params["audio_format"], params["mp3_bitrate"], params["mp3_sample_rate"],
        params["lm_temperature"],
        params["think_checkbox"], params["lm_cfg_scale"],
        params["lm_top_k"], params["lm_top_p"], params["lm_negative_prompt"],
        params["use_cot_metas"], params["use_cot_caption"], params["use_cot_language"],
        False,  # is_format_caption
        params["constrained_decoding_debug"],
        params["allow_lm_batch"], params["auto_score"], params["auto_lrc"],
        params["score_scale"], params["lm_batch_chunk_size"],
        params["enable_normalization"], params["normalization_db"],
        params["fade_in_duration"], params["fade_out_duration"],
        params["latent_shift"], params["latent_rescale"],
        params["repaint_mode"], params["repaint_strength"],
        params["retake_variance"], params["retake_seed"],
        progress=_ignore_progress,
    )
