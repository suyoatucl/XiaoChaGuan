"""
Language detection utilities.
"""

import re
from typing import Dict, List, Tuple

# Unicode ranges for different scripts
SCRIPT_RANGES = {
    "chinese": (0x4E00, 0x9FFF),  # CJK Unified Ideographs
    "japanese_hiragana": (0x3040, 0x309F),
    "japanese_katakana": (0x30A0, 0x30FF),
    "korean": (0xAC00, 0xD7AF),
    "arabic": (0x0600, 0x06FF),
    "cyrillic": (0x0400, 0x04FF),
    "latin": (0x0041, 0x007A),  # Basic Latin letters
}

# Language code mapping
LANGUAGE_CODES = {
    "chinese": "zh-CN",
    "japanese": "ja",
    "korean": "ko",
    "arabic": "ar",
    "russian": "ru",
    "english": "en",
}


def count_script_chars(text: str) -> Dict[str, int]:
    """
    Count characters belonging to different scripts.

    Args:
        text: Input text

    Returns:
        Dictionary mapping script names to character counts
    """
    counts = {script: 0 for script in SCRIPT_RANGES}

    for char in text:
        code_point = ord(char)
        for script, (start, end) in SCRIPT_RANGES.items():
            if start <= code_point <= end:
                counts[script] += 1
                break

    return counts


def detect_language(text: str) -> Tuple[str, float]:
    """
    Detect the primary language of the text.

    Args:
        text: Input text

    Returns:
        Tuple of (language_code, confidence)
    """
    if not text or not text.strip():
        return "unknown", 0.0

    counts = count_script_chars(text)
    total_chars = sum(counts.values())

    if total_chars == 0:
        # Assume English for purely ASCII text
        return "en", 0.5

    # Calculate percentages
    percentages = {script: count / total_chars for script, count in counts.items()}

    # Determine primary language
    if percentages["chinese"] > 0.3:
        # Could be Chinese or Japanese (which uses Chinese characters)
        if percentages["japanese_hiragana"] + percentages["japanese_katakana"] > 0.1:
            return "ja", percentages["japanese_hiragana"] + percentages["japanese_katakana"] + percentages["chinese"]
        return "zh-CN", percentages["chinese"]

    if percentages["japanese_hiragana"] + percentages["japanese_katakana"] > 0.1:
        return "ja", percentages["japanese_hiragana"] + percentages["japanese_katakana"]

    if percentages["korean"] > 0.3:
        return "ko", percentages["korean"]

    if percentages["arabic"] > 0.3:
        return "ar", percentages["arabic"]

    if percentages["cyrillic"] > 0.3:
        return "ru", percentages["cyrillic"]

    # Default to English for Latin script
    if percentages["latin"] > 0.3:
        return "en", percentages["latin"]

    return "unknown", 0.0


def detect_multiple_languages(text: str) -> List[Tuple[str, float]]:
    """
    Detect all languages present in the text.

    Args:
        text: Input text

    Returns:
        List of (language_code, percentage) tuples, sorted by percentage
    """
    counts = count_script_chars(text)
    total_chars = sum(counts.values())

    if total_chars == 0:
        return [("en", 1.0)]

    languages = []

    percentages = {script: count / total_chars for script, count in counts.items()}

    # Map scripts to languages
    script_to_lang = {
        "chinese": "zh-CN",
        "japanese_hiragana": "ja",
        "japanese_katakana": "ja",
        "korean": "ko",
        "arabic": "ar",
        "cyrillic": "ru",
        "latin": "en",
    }

    lang_percentages: Dict[str, float] = {}
    for script, pct in percentages.items():
        if pct > 0.05:  # Threshold for inclusion
            lang = script_to_lang.get(script, "unknown")
            lang_percentages[lang] = lang_percentages.get(lang, 0) + pct

    # Sort by percentage
    sorted_langs = sorted(lang_percentages.items(), key=lambda x: x[1], reverse=True)

    return sorted_langs


def is_translation_content(text: str) -> bool:
    """
    Check if text appears to be translated content.

    Heuristics:
    - Contains multiple languages
    - Contains translation markers
    - Has awkward phrasing patterns

    Args:
        text: Input text

    Returns:
        True if text appears to be translated
    """
    # Check for multiple languages
    languages = detect_multiple_languages(text)
    if len([l for l, p in languages if p > 0.1]) > 1:
        return True

    # Check for translation markers
    translation_markers = [
        r"据.*?外媒",
        r"据.*?报道",
        r"翻译自",
        r"原文来自",
        r"(英|日|韩|法|德|俄)媒",
    ]

    for pattern in translation_markers:
        if re.search(pattern, text):
            return True

    return False
