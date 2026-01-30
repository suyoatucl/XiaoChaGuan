/**
 * Cache-related type definitions
 */

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
}

export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxEntries?: number;
  maxSize?: number; // Max size in bytes
}

export interface VerificationCache {
  id?: number;
  claimHash: string;
  result: string; // JSON stringified VerificationResult
  language: string;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
}

export interface HistoryEntry {
  id?: number;
  claim: string;
  verdict: string;
  confidence: number;
  summary: string;
  url: string;
  createdAt: Date;
}
