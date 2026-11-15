"""Optional, non-overwriting adapter export for ACE Studio.

This module never deletes, replaces or moves an existing destination. It
reuses the training output written by the existing ACE-Step engine.
"""

from __future__ import annotations

import os
import re
import shutil
from pathlib import Path


class StudioExportValidationError(ValueError):
    """The requested source or target violates non-destructive export policy."""


def select_trained_adapter(training_directory: str) -> Path:
    """Choose the final adapter, or the highest numbered epoch checkpoint."""
    if not training_directory.strip():
        raise StudioExportValidationError("A training output directory is required.")
    source_root = Path(training_directory.strip()).expanduser().resolve(strict=True)
    if not source_root.is_dir():
        raise StudioExportValidationError("Training output must be a directory.")

    final = source_root / "final"
    if final.is_dir():
        candidate = final
    else:
        checkpoints = source_root / "checkpoints"
        if not checkpoints.is_dir():
            raise FileNotFoundError("No final adapter or checkpoints found.")
        choices = [
            (int(match.group(1)), child)
            for child in checkpoints.iterdir()
            if child.is_dir()
            if (match := re.fullmatch(r"epoch_(\d+)", child.name))
        ]
        if not choices:
            raise FileNotFoundError("No numbered epoch checkpoints found.")
        candidate = max(choices, key=lambda item: item[0])[1]

    resolved = candidate.resolve(strict=True)
    if not resolved.is_relative_to(source_root) or not resolved.is_dir():
        raise StudioExportValidationError("Adapter source escapes its training directory.")
    return resolved


def export_adapter_without_overwrite(
    training_directory: str, export_directory: str
) -> dict[str, str]:
    """Copy trained weights into a new server directory, refusing any overwrite.

    Raises:
        FileNotFoundError: no trained adapter is available.
        FileExistsError: the target already exists, including as a dangling link.
        StudioExportValidationError: invalid, overlapping or unsafe directories.
        OSError: the server cannot create the target directory.
    """
    target_text = export_directory.strip()
    if not target_text or any(ord(char) < 32 for char in target_text):
        raise StudioExportValidationError("A valid export directory is required.")
    raw_target = Path(target_text).expanduser()
    if ".." in raw_target.parts:
        raise StudioExportValidationError("Parent-directory traversal is forbidden.")

    source_root = Path(training_directory.strip()).expanduser().resolve(strict=True)
    source = select_trained_adapter(training_directory)
    for item in source.rglob("*"):
        if item.is_symlink():
            raise StudioExportValidationError(
                "Adapter export refuses symbolic links inside trained weights."
            )
    target = raw_target.resolve(strict=False)
    if len(target.parts) < 3:
        raise StudioExportValidationError("Cannot export to a filesystem root.")
    if (target == source_root or target in source_root.parents
            or source_root in target.parents
            or target == source or target in source.parents
            or source in target.parents):
        raise StudioExportValidationError("Export directory overlaps training output.")
    if os.path.lexists(raw_target):
        raise FileExistsError("Export destination already exists; no files were replaced.")

    raw_target.parent.mkdir(parents=True, exist_ok=True)
    # copytree's default dirs_exist_ok=False is the final non-overwrite guard.
    shutil.copytree(source, raw_target, symlinks=False, dirs_exist_ok=False)
    return {
        "message": "Adapter copied to a new directory without overwriting existing data.",
        "source": str(source),
        "export_path": str(raw_target),
    }

