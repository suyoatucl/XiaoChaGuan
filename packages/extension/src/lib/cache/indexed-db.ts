/**
 * IndexedDB wrapper using Dexie.js
 */

import Dexie, { type Table } from 'dexie';

import type { HistoryEntry, VerificationCache } from '~/lib/types';

export class XiaoChaGuanDB extends Dexie {
  verifications!: Table<VerificationCache>;
  history!: Table<HistoryEntry>;

  constructor() {
    super('xiaochaguan');

    this.version(1).stores({
      verifications: '++id, claimHash, language, createdAt, expiresAt',
      history: '++id, claim, verdict, createdAt',
    });
  }
}

export const db = new XiaoChaGuanDB();

/**
 * Initialize database
 */
export async function initDB(): Promise<void> {
  try {
    await db.open();
    console.log('[XCG] Database initialized');
  } catch (error) {
    console.error('[XCG] Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Clear all data from database
 */
export async function clearAllData(): Promise<void> {
  await db.verifications.clear();
  await db.history.clear();
}

/**
 * Get database statistics
 */
export async function getDBStats(): Promise<{
  verificationCount: number;
  historyCount: number;
  estimatedSize: number;
}> {
  const verificationCount = await db.verifications.count();
  const historyCount = await db.history.count();

  // Estimate size (rough calculation)
  const verifications = await db.verifications.toArray();
  const history = await db.history.toArray();
  const estimatedSize =
    JSON.stringify(verifications).length + JSON.stringify(history).length;

  return {
    verificationCount,
    historyCount,
    estimatedSize,
  };
}
