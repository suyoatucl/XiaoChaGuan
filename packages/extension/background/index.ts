/**
 * Background Service Worker
 *
 * Handles:
 * - Extension lifecycle events
 * - Message routing between components
 * - Context menu management
 * - Periodic tasks (cache cleanup, health checks)
 */

import { initDB } from '~/lib/cache/indexed-db';
import cacheManager from '~/lib/cache/cache-manager';
import logger from '~/lib/utils/logger';

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  logger.info('Extension installed', { reason: details.reason });

  // Initialize database
  await initDB();

  // Create context menu
  chrome.contextMenus.create({
    id: 'verify-selection',
    title: '用小查馆验证 "%s"',
    contexts: ['selection'],
  });

  // Set up periodic cache cleanup
  chrome.alarms.create('cache-cleanup', {
    periodInMinutes: 60, // Every hour
  });

  // Set up periodic health check
  chrome.alarms.create('health-check', {
    periodInMinutes: 5, // Every 5 minutes
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'verify-selection' && info.selectionText && tab?.id) {
    logger.info('Context menu verify', { text: info.selectionText.substring(0, 50) });

    // Send message to content script to handle verification
    chrome.tabs.sendMessage(tab.id, {
      type: 'VERIFY_SELECTION',
      payload: {
        text: info.selectionText,
      },
    });
  }
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case 'cache-cleanup':
      logger.debug('Running cache cleanup');
      const cleaned = await cacheManager.cleanup();
      logger.info('Cache cleanup complete', { entriesRemoved: cleaned });
      break;

    case 'health-check':
      logger.debug('Running health check');
      // Health check logic will be handled by connection manager
      break;
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.debug('Message received', { type: message.type, from: sender.tab?.id || 'popup' });

  // Handle async response
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      logger.error('Message handling error', error);
      sendResponse({ success: false, error: error.message });
    });

  // Return true to indicate async response
  return true;
});

/**
 * Handle incoming messages
 */
async function handleMessage(
  message: { type: string; payload?: unknown },
  _sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case 'GET_CACHE_STATS':
      return cacheManager.getStats();

    case 'CLEAR_CACHE':
      await cacheManager.clear();
      return { success: true };

    case 'VERIFY_CLAIM':
      // This will be handled by the API module
      const { text, language } = message.payload as { text: string; language?: string };
      // For now, return mock data (will implement full verification later)
      return {
        success: true,
        message: `Verification requested for: ${text.substring(0, 50)}...`,
      };

    default:
      logger.warn('Unknown message type', { type: message.type });
      return { success: false, error: 'Unknown message type' };
  }
}

// Log startup
logger.info('Background service worker started');
