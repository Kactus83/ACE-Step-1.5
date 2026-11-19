"""Non-destructive ACE Studio adapter export tests with temporary directories."""

from __future__ import annotations

import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from acestep.api.http.studio_adapter_export import (
    StudioExportValidationError,
    STUDIO_FILE_ROOTS_ENV,
    configured_studio_file_roots,
    export_adapter_without_overwrite,
    select_trained_adapter,
)


class StudioAdapterExportTests(unittest.TestCase):
    """Ensure the Studio route never deletes an existing destination."""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.allowed = self.root / "allowed"
        self.allowed.mkdir()
        self.training = self.allowed / "training" / "run1"
        self.adapter = self.training / "final"
        self.adapter.mkdir(parents=True)
        (self.adapter / "weights.safetensors").write_bytes(b"adapter")
        self.environment = patch.dict(
            os.environ, {STUDIO_FILE_ROOTS_ENV: str(self.allowed)}
        )
        self.environment.start()
        self.addCleanup(self.environment.stop)

    def test_copies_final_adapter_to_new_folder(self) -> None:
        """Copy all trained files while preserving the source."""
        destination = self.allowed / "export" / "adapter1"
        result = export_adapter_without_overwrite(
            str(self.training), str(destination)
        )
        self.assertEqual(result["export_path"], str(destination))
        self.assertEqual(
            (destination / "weights.safetensors").read_bytes(), b"adapter"
        )
        self.assertTrue((self.adapter / "weights.safetensors").exists())

    def test_existing_destination_is_untouched(self) -> None:
        """Never remove or replace an existing output folder."""
        destination = self.allowed / "export" / "adapter1"
        destination.mkdir(parents=True)
        (destination / "important.txt").write_text("keep", encoding="utf-8")
        with self.assertRaises(FileExistsError):
            export_adapter_without_overwrite(str(self.training), str(destination))
        self.assertEqual(
            (destination / "important.txt").read_text(encoding="utf-8"), "keep"
        )
        self.assertFalse((destination / "weights.safetensors").exists())

    def test_root_and_overlapping_destinations_are_rejected(self) -> None:
        """Reject destructive overlap, traversal and filesystem-root targets."""
        for target in (
            self.training / "nested",
            self.allowed / "training",
            Path("/"),
            self.allowed / "export" / ".." / "training",
        ):
            with self.subTest(target=str(target)):
                with self.assertRaises(StudioExportValidationError):
                    export_adapter_without_overwrite(
                        str(self.training), str(target)
                    )

    def test_empty_source_directory_is_rejected(self) -> None:
        """Never treat the current working directory as the training source."""
        destination = self.allowed / "export" / "empty-source"
        with self.assertRaises(StudioExportValidationError):
            export_adapter_without_overwrite("", str(destination))

    def test_source_symlink_is_rejected_before_copy(self) -> None:
        """Do not copy adapter symlinks pointing outside the trained weights."""
        outside = self.root / "secret.txt"
        outside.write_text("secret", encoding="utf-8")
        link = self.adapter / "external.txt"
        try:
            link.symlink_to(outside)
        except (OSError, NotImplementedError):
            self.skipTest("Filesystem does not support creating symlinks")
        destination = self.allowed / "export" / "adapter-with-link"
        with self.assertRaises(StudioExportValidationError):
            export_adapter_without_overwrite(str(self.training), str(destination))
        self.assertFalse(destination.exists())

    def test_latest_epoch_is_selected_without_final(self) -> None:
        """Use the highest numbered existing checkpoint, not lexical order."""
        (self.adapter / "weights.safetensors").unlink()
        self.adapter.rmdir()
        for epoch in (2, 10):
            checkpoint = self.training / "checkpoints" / f"epoch_{epoch}"
            checkpoint.mkdir(parents=True)
            (checkpoint / "weights.txt").write_text(str(epoch), encoding="utf-8")
        self.assertEqual(
            select_trained_adapter(
                str(self.training), configured_studio_file_roots()
            ).name,
            "epoch_10",
        )

    def test_export_is_disabled_without_explicit_server_roots(self) -> None:
        """Fail closed instead of granting arbitrary filesystem access."""
        destination = self.allowed / "export" / "disabled"
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(
                StudioExportValidationError, STUDIO_FILE_ROOTS_ENV
            ):
                export_adapter_without_overwrite(str(self.training), str(destination))

    def test_source_and_destination_must_stay_inside_allowed_roots(self) -> None:
        """Reject reads and writes outside operator-approved directories."""
        outside_training = self.root / "outside" / "training"
        outside_adapter = outside_training / "final"
        outside_adapter.mkdir(parents=True)
        (outside_adapter / "weights.safetensors").write_bytes(b"outside")
        inside_destination = self.allowed / "export" / "inside"
        outside_destination = self.root / "outside" / "export"

        with self.assertRaisesRegex(StudioExportValidationError, "outside configured"):
            export_adapter_without_overwrite(
                str(outside_training), str(inside_destination)
            )
        with self.assertRaisesRegex(StudioExportValidationError, "outside configured"):
            export_adapter_without_overwrite(
                str(self.training), str(outside_destination)
            )


if __name__ == "__main__":
    unittest.main()

