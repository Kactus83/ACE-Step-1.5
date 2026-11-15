"""Run the simplified creation flow using the existing progress generator."""

import html
from typing import Any

import gradio as gr
from loguru import logger

from acestep.inference import create_sample
from acestep.ui.gradio.i18n import t
from acestep.ui.gradio.events.generation.validation import clamp_duration_to_gpu_limit
from acestep.ui.gradio.events.results.batch_management_helpers import _apply_param_defaults
from acestep.ui.gradio.events.results.generation_progress import generate_with_progress
from acestep.ui.gradio.interfaces.simple_ui_markup import _step_indicator_html
from .simple_ui_helpers import _build_status_html, _ignore_progress, _resolve_simple_lyrics
from .simple_ui_generation_results import _finish_simple_generation
from .simple_ui_contracts import PROGRESS_STATUS_INDEX


def _simple_generate_wrapper(
    dit_handler: Any,
    llm_handler: Any,
    song_style: str,
    lyrics: str,
    instrumental: bool,
    src_audio: str | None,
    current_batch_index: int,
    total_batches: int,
    batch_queue: dict,
    generation_params_state: dict,
):
    """Generate music and stream progress through steps 4 and 5."""
    if dit_handler is None or getattr(dit_handler, "model", None) is None:
        raise gr.Error(t("simple_flow.models_unavailable"))

    task_type = "cover" if src_audio else "text2music"
    captions = song_style or ""
    final_lyrics = _resolve_simple_lyrics(lyrics, instrumental)
    audio_duration_val = -1

    if song_style and not final_lyrics and not src_audio and llm_handler and llm_handler.llm_initialized:
        yield (
            gr.skip(),  # 0: audio_1
            gr.skip(),  # 1: audio_2
            gr.skip(),  # 2: step indicator
            gr.skip(),  # 3: step 3 (no change)
            gr.skip(),  # 4: step 4 (no change)
            gr.skip(),  # 5: step 5 (no change)
            gr.update(value='<div class="simple-progress-status">Generating lyrics...</div>'),  # 6
            gr.skip(), gr.skip(), gr.skip(),  # 7-9: gen_info, metadata_1, metadata_2
            gr.skip(), gr.skip(), gr.skip(), gr.skip(),  # 10-13: batch state
        )
        result = create_sample(
            llm_handler=llm_handler,
            query=song_style,
            instrumental=instrumental,
            vocal_language="unknown",
            temperature=0.85,
            top_k=0,
            top_p=0.9,
            use_constrained_decoding=True,
            constrained_decoding_debug=False,
        )
        if result.success:
            captions = result.caption or song_style
            final_lyrics = result.lyrics or ""
            clamped = clamp_duration_to_gpu_limit(result.duration, llm_handler)
            audio_duration_val = clamped if clamped and clamped > 0 else -1
        else:
            logger.warning(f"Sample creation failed: {result.status_message}")

    yield (
        gr.skip(),  # 0: audio_1
        gr.skip(),  # 1: audio_2
        gr.skip(),  # 2: step indicator
        gr.skip(),  # 3: step 3
        gr.skip(),  # 4: step 4
        gr.skip(),  # 5: step 5
        gr.update(value='<div class="simple-progress-status">Creating your music...</div>'),  # 6
        gr.skip(), gr.skip(), gr.skip(),  # 7-9: gen_info, metadata_1, metadata_2
        gr.skip(), gr.skip(), gr.skip(), gr.skip(),  # 10-13: batch state
    )

    params: dict[str, Any] = {}
    _apply_param_defaults(params)
    params.update({
        "captions": captions,
        "lyrics": final_lyrics,
        "src_audio": src_audio,
        "task_type": task_type,
        "audio_format": "flac",
        "mp3_bitrate": "128k",
        "mp3_sample_rate": 48000,
        "think_checkbox": True,
        "auto_score": False,
        "auto_lrc": False,
        "audio_duration": audio_duration_val,
        "batch_size_input": 2,
    })
    if src_audio:
        params["audio_cover_strength"] = 1.0

    if not llm_handler or not llm_handler.llm_initialized:
        params["think_checkbox"] = False
        params["use_cot_metas"] = False
        params["use_cot_caption"] = False
        params["use_cot_language"] = False

    logger.info(
        f"Simple UI → generate_with_progress: "
        f"captions={params['captions'][:80]!r}, "
        f"lyrics={params['lyrics'][:80]!r}, "
        f"lm_negative_prompt={params['lm_negative_prompt']!r}, "
        f"think={params['think_checkbox']}, "
        f"task_type={params['task_type']}"
    )

    gen = generate_with_progress(
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

    final_result = None
    for partial in gen:
        final_result = partial
        yield (
            partial[0] if len(partial) > 0 else gr.skip(),   # 0: audio_1
            partial[1] if len(partial) > 1 else gr.skip(),   # 1: audio_2
            gr.skip(),                                         # 2: step indicator
            gr.skip(),                                         # 3: step 3
            gr.skip(),                                         # 4: step 4
            gr.skip(),                                         # 5: step 5
            gr.update(
                value='<div class="simple-progress-status">'
                + html.escape(str(
                    partial[PROGRESS_STATUS_INDEX]
                    if len(partial) > PROGRESS_STATUS_INDEX
                    else "Creating..."
                ))
                + '</div>'
            ),                                # 6: progress
            gr.skip(),                                         # 7: gen info
            gr.skip(),                                         # 8: metadata 1
            gr.skip(),                                         # 9: metadata 2
            gr.skip(), gr.skip(), gr.skip(), gr.skip(),        # 10-13: batch state
        )

    if final_result is None:
        yield (
            gr.update(value=None),  # 0: audio_1
            gr.update(value=None),  # 1: audio_2
            gr.update(value=_step_indicator_html(5)),  # 2
            gr.update(visible=False),  # 3: step 3 hide
            gr.update(visible=False),  # 4: step 4 hide
            gr.update(visible=True),  # 5: step 5 show
            gr.skip(),  # 6: progress
            gr.update(value=_build_status_html("Generation failed. Please try again.", False)),  # 7
            gr.skip(), gr.skip(),  # 8-9: metadata_1, metadata_2
            current_batch_index, total_batches, batch_queue, generation_params_state,  # 10-13
        )
        return

    yield from _finish_simple_generation(
        final_result, params, current_batch_index, total_batches, batch_queue,
        generation_params_state,
    )

