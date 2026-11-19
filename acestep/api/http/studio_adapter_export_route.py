"""Additive, authenticated safe export route exclusive to ACE Studio clients."""

from __future__ import annotations

from typing import Any, Callable

from fastapi import Depends, FastAPI, HTTPException

from acestep.api.http.studio_adapter_export import (
    StudioExportValidationError,
    export_adapter_without_overwrite,
)
from acestep.api.train_api_models import ExportLoRARequest


def register_studio_adapter_export_route(
    app: FastAPI,
    verify_api_key: Callable[..., Any],
    wrap_response: Callable[..., Any],
) -> None:
    """Register non-destructive adapter export without altering legacy semantics."""

    @app.post("/v1/studio/training/export")
    async def export_adapter_safe(
        request: ExportLoRARequest, _: None = Depends(verify_api_key)
    ) -> Any:
        try:
            data = export_adapter_without_overwrite(
                request.lora_output_dir, request.export_path
            )
            return wrap_response(data)
        except FileExistsError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except StudioExportValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except OSError as exc:
            raise HTTPException(
                status_code=500, detail="Adapter export failed on the backend."
            ) from exc

