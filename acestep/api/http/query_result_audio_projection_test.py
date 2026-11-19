"""Regression tests for lossless, unambiguous legacy audio provenance."""

from __future__ import annotations

import unittest

from acestep.api.http.query_result_audio_projection import project_audio_variants


class AudioVariantProjectionTests(unittest.TestCase):
    """Verify existing result shape plus one-to-one seed provenance."""

    def test_preserves_each_real_seed_and_generation_summary(self) -> None:
        """Return individual seeds in the exact ordering of generated audio paths."""

        rows = project_audio_variants(
            {
                "audio_paths": ["/v1/audio?path=one", "/v1/audio?path=two"],
                "seed_value": "11,22",
                "generation_info": "Backend inference: 8 steps",
                "dit_model": "acestep-v15-turbo",
                "metas": {"caption": "Ambient", "lyrics": "[inst]", "bpm": 117},
            },
            status_int=1, create_time=123.0, environment="development",
        )
        self.assertEqual(["11", "22"], [row["seed_value"] for row in rows])
        self.assertEqual(["/v1/audio?path=one", "/v1/audio?path=two"],
                         [row["file"] for row in rows])
        self.assertEqual("Backend inference: 8 steps", rows[1]["generation_info"])
        self.assertEqual("acestep-v15-turbo", rows[0]["metas"]["dit_model"])
        self.assertEqual(117, rows[1]["metas"]["bpm"])

    def test_never_assigns_an_ambiguous_batch_seed(self) -> None:
        """If seed count differs from variant count, do not invent correspondence."""

        rows = project_audio_variants(
            {"audio_paths": ["first.wav", "second.wav"], "seed_value": "77",
             "dit_model": "invalid/path", "generation_info": "x" * 20000,
             "metas": {"caption": "Music"}},
            status_int=1, create_time=0.0, environment="development",
        )
        self.assertEqual(2, len(rows))
        for row in rows:
            self.assertNotIn("seed_value", row)
            self.assertNotIn("generation_info", row)
            self.assertNotIn("dit_model", row["metas"])

    def test_preserves_legacy_no_audio_success_shape(self) -> None:
        """A completed job without audio stays one empty-file legacy record."""

        rows = project_audio_variants(
            {"audio_paths": [], "seed_value": "11", "metas": {}},
            status_int=1, create_time=123.0, environment="production",
        )
        self.assertEqual(1, len(rows))
        self.assertEqual("", rows[0]["file"])
        self.assertEqual("production", rows[0]["env"])
        self.assertNotIn("seed_value", rows[0])

    def test_rejects_non_numeric_and_misaligned_seeds(self) -> None:
        """Malicious, negative and oversized seed strings are not presented as facts."""

        for raw in ("11,-2", "11,22,33", "11, bad", "11,12345678901234567"):
            with self.subTest(seed=raw):
                rows = project_audio_variants(
                    {"audio_paths": ["a", "b"], "seed_value": raw},
                    status_int=1, create_time=1.0, environment="development",
                )
                self.assertTrue(all("seed_value" not in row for row in rows))


if __name__ == "__main__":
    unittest.main()
