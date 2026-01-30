/**
 * Cache manager for verification results
 */

import type { VerificationResult } from '~/lib/types';
import { generateCacheKey } from '~/lib/utils/hash';
import logger from '~/lib/utils/logger';

import { db } from './indexed-db';

const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheManagerStats {
  hits: number;
  misses: number;
}

class CacheManager {
  private stats: CacheManagerStats = {
    hits: 0,
    misses: 0,
  };

  /**
   * Get cached verification result
   */
  async get(claim: string, language: string): Promise<VerificationResult | null> {
    try {
      const cacheKey = await generateCacheKey(claim, language);

      const cached = await db.verifications
        .where('claimHash')
        .equals(cacheKey)
        .first();

      if (!cached) {
        this.stats.misses++;
        logger.debug('Cache miss', { claim: claim.substring(0, 50) });
        return null;
      }

      // Check expiration
      if (new Date(cached.expiresAt) < new Date()) {
        await db.verifications.delete(cached.id!);
        this.stats.misses++;
        logger.debug('Cache expired', { claim: claim.substring(0, 50) });
        return null;
      }

      // Update access count
      await db.verifications.update(cached.id!, {
        accessCount: cached.accessCount + 1,
      });

      this.stats.hits++;
      logger.debug('Cache hit', { claim: claim.substring(0, 50) });

      const result = JSON.parse(cached.result) as VerificationResult;
      return { ...result, cached: true };
    } catch (error) {
      logger.error('Cache get error', error);
      return null;
    }
  }

  /**
   * Store verification result in cache
   */
  async set(
    claim: string,
    language: string,
    result: VerificationResult,
    ttl: number = DEFAULT_TTL
  ): Promise<void> {
    try {
      const cacheKey = await generateCacheKey(claim, language);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl);

      // Remove existing entry if any
      await db.verifications.where('claimHash').equals(cacheKey).delete();

      // Add new entry
      await db.verifications.add({
        claimHash: cacheKey,
        result: JSON.stringify(result),
        language,
        createdAt: now,
        expiresAt,
        accessCount: 0,
      });

      logger.debug('Cache set', { claim: claim.substring(0, 50) });
    } catch (error) {
      logger.error('Cache set error', error);
    }
  }

  /**
   * Remove cached result
   */
  async remove(claim: string, language: string): Promise<void> {
    try {
      const cacheKey = await generateCacheKey(claim, language);
      await db.verifications.where('claimHash').equals(cacheKey).delete();
      logger.debug('Cache remove', { claim: claim.substring(0, 50) });
    } catch (error) {
      logger.error('Cache remove error', error);
    }
  }

  /**
   * Clear all cached results
   */
  async clear(): Promise<void> {
    try {
      await db.verifications.clear();
      this.stats = { hits: 0, misses: 0 };
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error', error);
    }
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    try {
      const now = new Date();
      const expiredCount = await db.verifications
        .where('expiresAt')
        .below(now)
        .delete();

      logger.info('Cache cleanup', { expiredCount });
      return expiredCount;
    } catch (error) {
      logger.error('Cache cleanup error', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheManagerStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      ...this.stats,
      hitRate,
    };
  }
}

export const cacheManager = new CacheManager();

export default cacheManager;
