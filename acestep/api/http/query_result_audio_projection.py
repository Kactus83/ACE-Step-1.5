"""Bounded audio-variant metadata projection for legacy task queries."""

from __future__ import annotations

import re
from typing import Any

_MODEL_NAME = re.compile(r"[A-Za-z0-9_.:-]{1,160}\Z")
_SEED = re.compile(r"[0-9]{1,16}\Z")
_MAX_INFO_LENGTH = 16000


def _variant_seeds(value: Any, count: int) -> list[str]:
    """Assign real seeds only when the server supplies one valid seed per audio file.

    Args:
        value: Generation's comma-separated seed_values from the job store.
        count: Number of returned audio paths in their server order.

    Returns:
        A list of exactly aligned seeds, or an empty list when ambiguous.
    """

    if count == 0 or count > 64 or not isinstance(value, str):
        return []
    seeds = value.split(",")
    if len(seeds) != count or not all(_SEED.fullmatch(seed) for seed in seeds):
        return []
    return seeds


def project_audio_variants(
    result: dict[str, Any],
    *,
    status_int: int,
    create_time: float,
    environment: str,
) -> list[dict[str, Any]]:
    """Project actual audio variants, model, seeds and summary without inference.

    Args:
        result: The already completed generation payload stored by ACE-Step.
        status_int: Existing integer task status for legacy consumers.
        create_time: Original job creation timestamp.
        environment: Existing server environment label.

    Returns:
        A legacy-compatible audio list with optional trustworthy metadata.

    Remarks:
        Missing, mismatched and malformed seeds are omitted rather than
        incorrectly attributed to an audio variant.
    """

    paths = result.get("audio_paths") or []
    if not isinstance(paths, list):
        paths = []
    metas = result.get("metas") or {}
    if not isinstance(metas, dict):
        metas = {}

    model = result.get("dit_model")
    reported_model = (
        {"dit_model": model}
        if isinstance(model, str) and _MODEL_NAME.fullmatch(model) else {}
    )
    info = result.get("generation_info")
    reported_info = (
        {"generation_info": info}
        if isinstance(info, str) and 0 < len(info) <= _MAX_INFO_LENGTH else {}
    )
    seeds = _variant_seeds(result.get("seed_value"), len(paths))
    metadata = {
        "bpm": metas.get("bpm"),
        "duration": metas.get("duration"),
        "genres": metas.get("genres", ""),
        "keyscale": metas.get("keyscale", ""),
        "timesignature": metas.get("timesignature", ""),
        **reported_model,
    }
    return [
        {
            "file": path,
            "wave": "",
            "status": status_int,
            "create_time": int(create_time),
            "env": environment,
            "prompt": metas.get("caption", ""),
            "lyrics": metas.get("lyrics", ""),
            "metas": metadata.copy(),
            **({"seed_value": seeds[index]} if seeds else {}),
            **reported_info,
        }
        for index, path in enumerate(paths if paths else [""])
    ]
