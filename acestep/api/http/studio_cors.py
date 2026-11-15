"""Optional, narrowly-scoped CORS support for ACE Studio's packaged Tauri webview.

Disabled by default. This is an additive presentation integration only; it does
not modify job inference, model initialization, authentication, or CLI behavior.
"""

from __future__ import annotations

import os


def optional_studio_origins() -> list[str]:
    """Return fixed Tauri origins only when the operator explicitly enables them.

    Returns:
        Supported local Tauri origins when ACESTEP_ENABLE_STUDIO_DESKTOP_CORS
        is true, or an empty list otherwise.

    The setting never trusts arbitrary values or wildcard origins. API auth is
    unaffected; a CORS allowlist does not authorize unauthenticated clients.
    """
    enabled = os.getenv("ACESTEP_ENABLE_STUDIO_DESKTOP_CORS", "").strip().lower()
    if enabled not in {"1", "true", "yes", "on"}:
        return []
    return [
        "tauri://localhost",  # Linux and macOS custom-protocol origin
        "http://tauri.localhost",  # Windows WebView2 production origin
    ]
