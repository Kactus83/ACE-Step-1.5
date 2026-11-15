"""Non-destructive ACE Studio adapter export tests with temporary directories."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from acestep.api.http.studio_adapter_export import (
    StudioExportValidationError,
    export_adapter_without_overwrite,
    select_trained_adapter,
)


class StudioAdapterExportTests(unittest.TestCase):
    """Ensure the Studio route never deletes an existing destination."""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.training = self.root / "training" / "run1"
        self.adapter = self.training / "final"
        self.adapter.mkdir(parents=True)
        (self.adapter / "weights.safetensors").write_bytes(b"adapter")

    def test_copies_final_adapter_to_new_folder(self) -> None:
        """Copy all trained files while preserving the source."""
        destination = self.root / "export" / "adapter1"
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
        destination = self.root / "export" / "adapter1"
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
            self.root / "training",
            Path("/"),
            self.root / "export" / ".." / "training",
        ):
            with self.subTest(target=str(target)):
                with self.assertRaises(StudioExportValidationError):
                    export_adapter_without_overwrite(
                        str(self.training), str(target)
                    )

    def test_latest_epoch_is_selected_without_final(self) -> None:
        """Use the highest numbered existing checkpoint, not lexical order."""
        (self.adapter / "weights.safetensors").unlink()
        self.adapter.rmdir()
        for epoch in (2, 10):
            checkpoint = self.training / "checkpoints" / f"epoch_{epoch}"
            checkpoint.mkdir(parents=True)
            (checkpoint / "weights.txt").write_text(str(epoch), encoding="utf-8")
        self.assertEqual(
            select_trained_adapter(str(self.training)).name, "epoch_10"
        )


if __name__ == "__main__":
    unittest.main()

