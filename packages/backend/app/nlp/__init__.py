"""NLP processing module."""

from app.nlp.claim_extractor import extract_claims
from app.nlp.language_detector import detect_language
from app.nlp.tokenizer import tokenize_chinese

__all__ = ["extract_claims", "detect_language", "tokenize_chinese"]
