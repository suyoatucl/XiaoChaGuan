/**
 * Cache key generation utilities
 */

import { normalizeText, sha256 } from '~/lib/utils/hash';

export const CACHE_PREFIXES = {
  verification: 'verify',
  search: 'search',
  translation: 'translate',
  embedding: 'embed',
} as const;

/**
 * Generate verification cache key
 */
export async function verificationKey(claim: string, language: string): Promise<string> {
  const normalized = normalizeText(claim);
  const hash = await sha256(`${normalized}:${language}`);
  return `${CACHE_PREFIXES.verification}:${hash.substring(0, 16)}`;
}

/**
 * Generate search cache key
 */
export async function searchKey(query: string, sources: string[]): Promise<string> {
  const normalized = normalizeText(query);
  const sourcesStr = sources.sort().join(',');
  const hash = await sha256(`${normalized}:${sourcesStr}`);
  return `${CACHE_PREFIXES.search}:${hash.substring(0, 16)}`;
}

/**
 * Generate translation cache key
 */
export async function translationKey(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const normalized = normalizeText(text);
  const hash = await sha256(`${normalized}:${sourceLang}:${targetLang}`);
  return `${CACHE_PREFIXES.translation}:${hash.substring(0, 16)}`;
}
