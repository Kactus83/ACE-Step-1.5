"""Optional, non-overwriting adapter export for ACE Studio.

This module never deletes, replaces or moves an existing destination. It
reuses the training output written by the existing ACE-Step engine.
"""

from __future__ import annotations

import os
import re
import shutil
from pathlib import Path

STUDIO_FILE_ROOTS_ENV = "ACESTEP_STUDIO_FILE_ROOTS"


class StudioExportValidationError(ValueError):
    """The requested source or target violates non-destructive export policy."""


def configured_studio_file_roots() -> tuple[Path, ...]:
    """Resolve operator-approved roots for Studio filesystem operations.

    Returns:
        Existing directories configured in ``ACESTEP_STUDIO_FILE_ROOTS``.

    Raises:
        StudioExportValidationError: no usable root was explicitly configured.
    """
    values = [
        value.strip()
        for value in os.getenv(STUDIO_FILE_ROOTS_ENV, "").split(os.pathsep)
    ]
    roots: list[Path] = []
    for value in values:
        if not value:
            continue
        root = Path(value).expanduser().resolve(strict=True)
        if not root.is_dir():
            raise StudioExportValidationError(
                "Studio filesystem roots must be directories."
            )
        roots.append(root)
    if not roots:
        raise StudioExportValidationError(
            f"Set {STUDIO_FILE_ROOTS_ENV} to explicit server directories before Studio export."
        )
    return tuple(roots)


def _resolve_allowed_path(value: str, roots: tuple[Path, ...], strict: bool) -> Path:
    """Resolve one request path and require containment in an approved root."""
    if not value.strip() or any(ord(char) < 32 for char in value):
        raise StudioExportValidationError("A valid server directory is required.")
    # The canonical path is rejected below unless contained in an operator root.
    # codeql[py/path-injection]
    raw = Path(value.strip()).expanduser()
    if ".." in raw.parts:
        raise StudioExportValidationError("Parent-directory traversal is forbidden.")
    resolved = raw.resolve(strict=strict)
    if not any(resolved == root or resolved.is_relative_to(root) for root in roots):
        raise StudioExportValidationError(
            "Server directory is outside configured Studio roots."
        )
    return resolved


def select_trained_adapter(training_directory: str, roots: tuple[Path, ...]) -> Path:
    """Choose the final adapter, or the highest numbered epoch checkpoint."""
    source_root = _resolve_allowed_path(training_directory, roots, strict=True)
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
    roots = configured_studio_file_roots()
    source_root = _resolve_allowed_path(training_directory, roots, strict=True)
    source = select_trained_adapter(training_directory, roots)
    for item in source.rglob("*"):
        if item.is_symlink():
            raise StudioExportValidationError(
                "Adapter export refuses symbolic links inside trained weights."
            )
    target = _resolve_allowed_path(export_directory, roots, strict=False)
    if len(target.parts) < 3:
        raise StudioExportValidationError("Cannot export to a filesystem root.")
    if (target == source_root or target in source_root.parents
            or source_root in target.parents
            or target == source or target in source.parents
            or source in target.parents):
        raise StudioExportValidationError("Export directory overlaps training output.")
    if os.path.lexists(target):
        raise FileExistsError("Export destination already exists; no files were replaced.")

    target.parent.mkdir(parents=True, exist_ok=True)
    # copytree's default dirs_exist_ok=False is the final non-overwrite guard.
    shutil.copytree(source, target, symlinks=False, dirs_exist_ok=False)
    return {
        "message": "Adapter copied to a new directory without overwriting existing data.",
        "source": str(source),
        "export_path": str(target),
    }

