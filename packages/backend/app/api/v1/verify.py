"""
Verification API endpoints.
"""

from datetime import datetime
from typing import List, Literal, Optional
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class VerifyOptions(BaseModel):
    """Verification options."""

    cross_lingual: bool = True
    max_sources: int = Field(default=5, ge=1, le=20)
    force_refresh: bool = False


class VerifyRequest(BaseModel):
    """Verification request model."""

    text: str = Field(..., min_length=10, max_length=2000)
    language: str = Field(default="zh-CN")
    options: Optional[VerifyOptions] = None


class Evidence(BaseModel):
    """Evidence source model."""

    id: str
    source: str
    source_url: str
    title: str
    snippet: str
    published_at: Optional[str] = None
    credibility_score: float = Field(ge=0, le=1)
    language: str


class OriginalSource(BaseModel):
    """Original source for mistranslation detection."""

    url: str
    title: str
    language: str
    excerpt: str


class VerifyResponse(BaseModel):
    """Verification response model."""

    id: str
    verdict: Literal["true", "false", "partly_true", "unverified"]
    confidence: float = Field(ge=0, le=1)
    summary: str
    evidence_chain: List[Evidence]
    original_claim: str
    language: str
    mistranslation_detected: bool
    mistranslation_details: Optional[str] = None
    original_source: Optional[OriginalSource] = None
    created_at: str


@router.post("", response_model=VerifyResponse)
async def verify_claim(request: VerifyRequest) -> VerifyResponse:
    """
    Verify a claim using RAG-powered fact-checking.

    This endpoint:
    1. Extracts claims from the input text
    2. Generates embeddings for semantic search
    3. Retrieves relevant evidence from multiple sources
    4. Analyzes the claim using LLM
    5. Returns a verdict with supporting evidence
    """
    # TODO: Implement actual RAG pipeline
    # For MVP, return mock response

    # Generate unique ID
    verification_id = str(uuid.uuid4())

    # Mock evidence
    mock_evidence = [
        Evidence(
            id=str(uuid.uuid4()),
            source="示例新闻网",
            source_url="https://example.com/news/1",
            title="相关新闻报道",
            snippet="这是一个示例证据摘要，展示了相关的事实信息...",
            credibility_score=0.85,
            language=request.language,
        ),
    ]

    # Mock response
    response = VerifyResponse(
        id=verification_id,
        verdict="unverified",
        confidence=0.65,
        summary=f"该声明目前无法完全验证。输入文本：'{request.text[:50]}...'",
        evidence_chain=mock_evidence,
        original_claim=request.text,
        language=request.language,
        mistranslation_detected=False,
        created_at=datetime.utcnow().isoformat(),
    )

    return response


@router.get("/{verification_id}", response_model=VerifyResponse)
async def get_verification(verification_id: str) -> VerifyResponse:
    """
    Get a previous verification result by ID.
    """
    # TODO: Implement cache/database lookup
    raise HTTPException(
        status_code=404,
        detail=f"Verification {verification_id} not found",
    )
