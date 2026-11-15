"""Project simplified generation outputs into the existing batch/result contracts."""

from typing import Any

import gradio as gr
from loguru import logger

from acestep.ui.gradio.events.results.batch_management_helpers import _build_saved_params
from acestep.ui.gradio.events.results.batch_queue import store_batch_in_queue
from acestep.ui.gradio.interfaces.simple_ui_markup import _step_indicator_html
from .simple_ui_helpers import _build_metadata_html, _build_status_html, _completion_message
from .simple_ui_contracts import (
    AUDIO_PATHS_INDEX,
    GENERATION_INFO_INDEX,
    PROGRESS_STATUS_INDEX,
    SEED_VALUE_INDEX,
)


def _finish_simple_generation(
    final_result: tuple,
    params: dict[str, Any],
    current_batch_index: int,
    total_batches: int,
    batch_queue: dict,
    generation_params_state: dict,
):
    """Stream final status and persist batch metadata without truncating advanced slots."""
    _ = generation_params_state
    all_audio_paths = final_result[AUDIO_PATHS_INDEX] if len(final_result) > AUDIO_PATHS_INDEX else None
    generation_info_text = final_result[GENERATION_INFO_INDEX] if len(final_result) > GENERATION_INFO_INDEX else ""
    gen_status_message = final_result[PROGRESS_STATUS_INDEX] if len(final_result) > PROGRESS_STATUS_INDEX else ""
    if not isinstance(all_audio_paths, list) or not any(all_audio_paths[::2]):
        err_msg = gen_status_message or generation_info_text or "Generation produced no output"
        logger.warning(f"Simple UI: generation result had no audio paths. Status: {gen_status_message}")
        yield (
            gr.update(value=None),  # 0: audio_1
            gr.update(value=None),  # 1: audio_2
            gr.update(value=_step_indicator_html(5)),  # 2
            gr.update(visible=False),  # 3: step 3 hide
            gr.update(visible=False),  # 4: step 4 hide
            gr.update(visible=True),  # 5: step 5 show
            gr.skip(),  # 6: progress
            gr.update(value=_build_status_html(str(err_msg), False)),  # 7
            gr.skip(), gr.skip(),  # 8-9: metadata_1, metadata_2
            current_batch_index, total_batches, batch_queue, generation_params_state,  # 10-13
        )
        return

    saved_params = _build_saved_params(
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
        params["audio_format"], params["mp3_bitrate"], params["mp3_sample_rate"],
        params["lm_temperature"],
        params["think_checkbox"], params["lm_cfg_scale"],
        params["lm_top_k"], params["lm_top_p"], params["lm_negative_prompt"],
        params["use_cot_metas"], params["use_cot_caption"], params["use_cot_language"],
        params["constrained_decoding_debug"], params["allow_lm_batch"],
        params["auto_score"], params["auto_lrc"],
        params["score_scale"], params["lm_batch_chunk_size"],
        params["track_name"], params["complete_track_classes"],
        params["enable_normalization"], params["normalization_db"],
        params["fade_in_duration"], params["fade_out_duration"],
        params["latent_shift"], params["latent_rescale"],
        repaint_mode=params["repaint_mode"],
        repaint_strength=params["repaint_strength"],
        retake_variance=params["retake_variance"],
        retake_seed=params["retake_seed"],
    )

    # Preserve the effective seed for replay rather than a fresh random input.
    resolved_seed = (
        final_result[SEED_VALUE_INDEX]
        if len(final_result) > SEED_VALUE_INDEX
        else None
    )
    if isinstance(resolved_seed, (str, int)) and str(resolved_seed).strip():
        saved_params["seed"] = str(resolved_seed)
        saved_params["random_seed_checkbox"] = False

    # Append a new independent session batch; do not overwrite a previous song.
    next_batch_index = max(current_batch_index, total_batches)
    batch_queue = store_batch_in_queue(
        batch_queue, next_batch_index,
        all_audio_paths, generation_info_text,
        final_result[SEED_VALUE_INDEX] if len(final_result) > SEED_VALUE_INDEX else "",
        scores=[""] * 8,
        codes=[""] * 8,
        allow_lm_batch=False,
        batch_size=2,
        generation_params=saved_params,
        status="completed",
    )

    total_batches = max(total_batches, next_batch_index + 1)

    # all_audio_paths alternates [audio, json, audio, json, ...]
    # Use every-other index to skip JSON sidecar paths
    audio_paths_list = all_audio_paths if isinstance(all_audio_paths, list) else []
    audio_1 = audio_paths_list[0] if len(audio_paths_list) >= 1 else None
    audio_2 = audio_paths_list[2] if len(audio_paths_list) >= 3 else None

    # A degraded MP3 export may have produced WAV files; display actual formats.
    meta_1 = _build_metadata_html(0, audio_1.rsplit(".", 1)[-1] if audio_1 else "")
    meta_2 = _build_metadata_html(0, audio_2.rsplit(".", 1)[-1] if audio_2 else "")

    # Surface real export degradation rather than claiming a fully successful export.
    displayed_status = (
        gen_status_message
        if str(gen_status_message).startswith("Generation Complete (WAV)")
        else _completion_message()
    )
    gen_status = _build_status_html(displayed_status, True)

    yield (
        gr.update(value=audio_1),  # 0
        gr.update(value=audio_2),  # 1
        gr.update(value=_step_indicator_html(5)),  # 2
        gr.update(visible=False),  # 3: step 3 hide
        gr.update(visible=False),  # 4: step 4 hide
        gr.update(visible=True),  # 5: step 5 show
        gr.skip(),  # 6: progress
        gr.update(value=gen_status),  # 7
        gr.update(value=meta_1),  # 8
        gr.update(value=meta_2),  # 9
        next_batch_index,  # 10
        total_batches,  # 11
        batch_queue,  # 12
        saved_params,  # 13
    )


