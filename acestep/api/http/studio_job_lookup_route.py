"""Read-only ACE Studio job existence lookup; never schedules inference."""

from __future__ import annotations

import re
from typing import Any, Callable

from fastapi import Depends, FastAPI, HTTPException

_TASK_ID = re.compile(r"[A-Za-z0-9_.:-]{1,160}\Z")


def register_studio_job_lookup_route(
    app: FastAPI,
    verify_api_key: Callable[..., Any],
    wrap_response: Callable[..., Any],
    store: Any,
) -> None:
    """Register an authenticated, side-effect-free lookup for current-store jobs.

    Args:
        app: Existing standalone FastAPI application.
        verify_api_key: Existing API authorization dependency.
        wrap_response: Standard response envelope factory.
        store: Current server-process job store exposing get(task_id).

    The route never accepts prompts, uploads, or generation settings. A job
    retained only in the legacy cache is intentionally not asserted to exist.
    """

    @app.get("/v1/studio/jobs/{task_id}")
    async def lookup_studio_job(
        task_id: str, _: None = Depends(verify_api_key)
    ) -> Any:
        """Report whether a known current-server job exists and its phase.

        Args:
            task_id: Opaque task identifier received from /release_task.

        Returns:
            An envelope with task_id and authoritative current-store status.

        Raises:
            HTTPException: For malformed (400) or unknown (404) identifiers.
        """

        if _TASK_ID.fullmatch(task_id) is None:
            raise HTTPException(status_code=400, detail="Invalid job identifier.")
        record = store.get(task_id)
        if record is None:
            raise HTTPException(status_code=404, detail="Job not found on this server.")
        return wrap_response({"task_id": task_id, "status": record.status})
