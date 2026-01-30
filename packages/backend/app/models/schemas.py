"""
Pydantic schemas for data validation.
"""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ClaimBase(BaseModel):
    """Base claim model."""

    text: str
    language: str = "zh-CN"


class Claim(ClaimBase):
    """Extracted claim with metadata."""

    id: str
    type: Literal["factual", "opinion", "prediction", "quote"]
    entities: List[str] = []
    confidence: float = Field(ge=0, le=1)


class EvidenceBase(BaseModel):
    """Base evidence model."""

    source: str
    source_url: str
    title: str
    snippet: str


class Evidence(EvidenceBase):
    """Evidence with full metadata."""

    id: str
    published_at: Optional[datetime] = None
    credibility_score: float = Field(ge=0, le=1)
    language: str


class VerificationBase(BaseModel):
    """Base verification model."""

    claim: str
    language: str = "zh-CN"


class VerificationResult(BaseModel):
    """Complete verification result."""

    id: str
    verdict: Literal["true", "false", "partly_true", "unverified"]
    confidence: float
    summary: str
    evidence_chain: List[Evidence]
    original_claim: str
    language: str
    mistranslation_detected: bool = False
    mistranslation_details: Optional[str] = None
    created_at: datetime


class CacheEntry(BaseModel):
    """Cache entry for verification results."""

    key: str
    value: str  # JSON serialized
    created_at: datetime
    expires_at: datetime
    access_count: int = 0
