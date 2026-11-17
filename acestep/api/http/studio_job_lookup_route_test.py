"""HTTP-level regression tests for authenticated ACE Studio task attachment."""

from __future__ import annotations

import unittest
from types import SimpleNamespace
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

from acestep.api.http.studio_job_lookup_route import (
    register_studio_job_lookup_route,
)


def _verify_key(authorization: str | None = Header(None)) -> None:
    """Authorize a fixed disposable token for route tests."""

    if authorization != "Bearer test-token":
        raise HTTPException(status_code=401, detail="Unauthorized")


def _wrap(data: Any) -> dict[str, Any]:
    """Encode a normal standalone API success envelope."""

    return {"code": 200, "error": None, "data": data}


class _SpyStore:
    """Support read-only lookups while detecting unexpected job mutations."""

    def __init__(self) -> None:
        """Initialize a known running job and mutation counters."""

        self.records = {"job-123": SimpleNamespace(status="running")}
        self.created = 0

    def get(self, task_id: str) -> Any:
        """Read an existing record without scheduling anything."""

        return self.records.get(task_id)

    def create(self) -> None:
        """Fail if this route ever attempts generation submission."""

        self.created += 1
        raise AssertionError("Attachment must never create a job")


class StudioJobLookupRouteTests(unittest.TestCase):
    """Verify read-only, authenticated existence checks."""

    def setUp(self) -> None:
        """Build an isolated FastAPI app without GPU or filesystem state."""

        self.store = _SpyStore()
        app = FastAPI()
        register_studio_job_lookup_route(app, _verify_key, _wrap, self.store)
        self.client = TestClient(app)

    def test_existing_job_is_reported_without_submission(self) -> None:
        """Return only opaque ID and phase of an existing server-owned job."""

        response = self.client.get(
            "/v1/studio/jobs/job-123",
            headers={"Authorization": "Bearer test-token"},
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual({"task_id": "job-123", "status": "running"},
                         response.json()["data"])
        self.assertEqual(0, self.store.created)

    def test_missing_and_malformed_ids_are_refused(self) -> None:
        """Do not pretend an unknown task is queued or use its ID as a path."""

        headers = {"Authorization": "Bearer test-token"}
        self.assertEqual(404, self.client.get(
            "/v1/studio/jobs/unknown-id", headers=headers
        ).status_code)
        self.assertEqual(400, self.client.get(
            "/v1/studio/jobs/invalid%20id", headers=headers
        ).status_code)
        self.assertEqual(0, self.store.created)

    def test_api_token_required_for_existing_and_unknown_jobs(self) -> None:
        """Do not expose task existence to unauthenticated clients."""

        for task_id in ("job-123", "unknown-id"):
            with self.subTest(task_id=task_id):
                self.assertEqual(401, self.client.get(
                    "/v1/studio/jobs/" + task_id
                ).status_code)
        self.assertEqual(0, self.store.created)


if __name__ == "__main__":
    unittest.main()
