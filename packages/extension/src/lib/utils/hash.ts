/**
 * Hash utilities for cache key generation
 */

/**
 * Generate a simple hash from a string (djb2 algorithm)
 */
export function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Generate a SHA-256 hash using Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalize text for consistent hashing
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u4e00-\u9fff]/g, '');
}

/**
 * Generate a cache key for a claim
 */
export async function generateCacheKey(claim: string, language: string): Promise<string> {
  const normalized = normalizeText(claim);
  const hash = await sha256(`${normalized}:${language}`);
  return `verify:${hash.substring(0, 16)}`;
}

/**
 * Generate a short ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
