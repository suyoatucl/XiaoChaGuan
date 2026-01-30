"""
Claim extraction from text.
"""

import re
import uuid
from typing import List, Literal

from pydantic import BaseModel

from app.nlp.tokenizer import extract_keywords, extract_noun_phrases


class ExtractedClaim(BaseModel):
    """Extracted claim model."""

    id: str
    text: str
    type: Literal["factual", "opinion", "prediction", "quote"]
    entities: List[str]
    language: str
    confidence: float


# Patterns that indicate verifiable claims
CLAIM_PATTERNS = [
    (r"据.*?报道", "factual", 0.7),
    (r"根据.*?(显示|表明|证明)", "factual", 0.8),
    (r"研究(表明|发现|显示)", "factual", 0.8),
    (r"专家(称|说|表示)", "quote", 0.6),
    (r"官方(表示|宣布|声明)", "factual", 0.8),
    (r"数据(显示|表明)", "factual", 0.8),
    (r"\d+%", "factual", 0.7),
    (r"\d+(万|亿|千|百)", "factual", 0.6),
    (r"(去年|今年|上个月|本月|明年)", "factual", 0.5),
    (r"将(会|要|于)", "prediction", 0.5),
    (r"(我认为|我觉得|在我看来)", "opinion", 0.4),
]


def detect_claim_type(text: str) -> tuple:
    """
    Detect the type of claim and confidence.

    Returns:
        Tuple of (claim_type, confidence)
    """
    for pattern, claim_type, confidence in CLAIM_PATTERNS:
        if re.search(pattern, text):
            return claim_type, confidence

    return "factual", 0.5  # Default


def split_sentences(text: str) -> List[str]:
    """
    Split text into sentences.

    Args:
        text: Input text

    Returns:
        List of sentences
    """
    # Chinese sentence delimiters
    delimiters = r"[。！？\.\!\?]"
    sentences = re.split(delimiters, text)
    return [s.strip() for s in sentences if s.strip() and len(s.strip()) >= 10]


def extract_claims(
    text: str,
    language: str = "zh-CN",
    min_length: int = 10,
    max_length: int = 500,
) -> List[ExtractedClaim]:
    """
    Extract verifiable claims from text.

    Args:
        text: Input text
        language: Language code
        min_length: Minimum claim length
        max_length: Maximum claim length

    Returns:
        List of extracted claims
    """
    claims = []
    sentences = split_sentences(text)

    for sentence in sentences:
        # Skip if too short or too long
        if len(sentence) < min_length or len(sentence) > max_length:
            continue

        # Detect claim type and confidence
        claim_type, confidence = detect_claim_type(sentence)

        # Skip low-confidence claims
        if confidence < 0.4:
            continue

        # Extract entities (simplified - using noun phrases)
        entities = extract_noun_phrases(sentence)

        # Extract keywords for additional context
        keywords = extract_keywords(sentence, top_k=5)
        keyword_texts = [k[0] for k in keywords]

        # Combine entities and keywords, remove duplicates
        all_entities = list(set(entities + keyword_texts))

        claim = ExtractedClaim(
            id=str(uuid.uuid4()),
            text=sentence,
            type=claim_type,
            entities=all_entities[:10],  # Limit to 10 entities
            language=language,
            confidence=confidence,
        )
        claims.append(claim)

    return claims
