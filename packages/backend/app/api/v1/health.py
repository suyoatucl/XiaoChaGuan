"""
Health check endpoints.
"""

import time
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Track startup time
_startup_time = time.time()


class ServiceStatus(BaseModel):
    """Individual service status."""

    llm: bool = False
    vector_db: bool = False
    cache: bool = False


class HealthResponse(BaseModel):
    """Health check response model."""

    status: Literal["healthy", "degraded", "unhealthy"]
    version: str
    uptime: float
    services: ServiceStatus


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Check API health status.

    Returns the current health status of the API and its dependent services.
    """
    # Calculate uptime
    uptime = time.time() - _startup_time

    # Check services (placeholder - will implement actual checks)
    services = ServiceStatus(
        llm=True,  # TODO: Actual LLM health check
        vector_db=True,  # TODO: Actual Pinecone health check
        cache=True,  # TODO: Actual Redis health check
    )

    # Determine overall status
    all_healthy = all([services.llm, services.vector_db, services.cache])
    any_healthy = any([services.llm, services.vector_db, services.cache])

    if all_healthy:
        status = "healthy"
    elif any_healthy:
        status = "degraded"
    else:
        status = "unhealthy"

    return HealthResponse(
        status=status,
        version="0.1.0",
        uptime=uptime,
        services=services,
    )


@router.get("/ping")
async def ping() -> dict:
    """Simple ping endpoint for quick availability checks."""
    return {"ping": "pong"}
