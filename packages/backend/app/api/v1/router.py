"""
API v1 router - aggregates all v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1 import health, verify, search

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(verify.router, prefix="/verify", tags=["Verification"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
