"""
Chinese tokenizer using jieba.
"""

from typing import List

import jieba
import jieba.posseg as pseg


def tokenize_chinese(text: str) -> List[str]:
    """
    Tokenize Chinese text using jieba.

    Args:
        text: Input Chinese text

    Returns:
        List of tokens
    """
    return list(jieba.cut(text))


def tokenize_with_pos(text: str) -> List[tuple]:
    """
    Tokenize Chinese text with part-of-speech tags.

    Args:
        text: Input Chinese text

    Returns:
        List of (word, pos_tag) tuples
    """
    return [(word, flag) for word, flag in pseg.cut(text)]


def extract_keywords(text: str, top_k: int = 10) -> List[tuple]:
    """
    Extract keywords from Chinese text.

    Args:
        text: Input Chinese text
        top_k: Number of keywords to extract

    Returns:
        List of (keyword, weight) tuples
    """
    import jieba.analyse

    return jieba.analyse.extract_tags(text, topK=top_k, withWeight=True)


def extract_noun_phrases(text: str) -> List[str]:
    """
    Extract noun phrases from Chinese text.

    Args:
        text: Input Chinese text

    Returns:
        List of noun phrases
    """
    # Simplified noun phrase extraction based on POS tags
    noun_tags = {"n", "nr", "ns", "nt", "nz", "ng"}
    tokens = tokenize_with_pos(text)

    phrases = []
    current_phrase = []

    for word, tag in tokens:
        if tag in noun_tags:
            current_phrase.append(word)
        else:
            if current_phrase:
                phrases.append("".join(current_phrase))
                current_phrase = []

    if current_phrase:
        phrases.append("".join(current_phrase))

    return phrases
