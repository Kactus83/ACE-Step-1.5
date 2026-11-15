"""Unit tests for optional ACE Studio Tauri origins without importing FastAPI."""

from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from acestep.api.http.studio_cors import optional_studio_origins, studio_api_cors_methods


class TestOptionalStudioOrigins(unittest.TestCase):
    """Ensure desktop-origin allowances are explicit and strictly bounded."""

    def test_disabled_by_default(self) -> None:
        """No special Tauri origins are trusted without operator opt-in."""
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(optional_studio_origins(), [])

    def test_enabled_has_only_local_fixed_origins(self) -> None:
        """Windows and Unix Tauri origins are permitted exactly."""
        with patch.dict(os.environ, {"ACESTEP_ENABLE_STUDIO_DESKTOP_CORS": "true"}):
            self.assertEqual(
                optional_studio_origins(),
                ["tauri://localhost", "http://tauri.localhost"],
            )

    def test_dataset_update_put_method_is_allowed(self) -> None:
        """Browsers can preflight the real PUT sample metadata route."""
        methods = studio_api_cors_methods()
        self.assertIn("PUT", methods)
        self.assertEqual(methods, ["GET", "POST", "PUT", "OPTIONS"])
        self.assertNotIn("DELETE", methods)

    def test_arbitrary_values_cannot_set_origin(self) -> None:
        """Never transform arbitrary input into allowed origins."""
        with patch.dict(os.environ, {"ACESTEP_ENABLE_STUDIO_DESKTOP_CORS": "https://evil.test"}):
            self.assertEqual(optional_studio_origins(), [])


if __name__ == "__main__":
    unittest.main()

