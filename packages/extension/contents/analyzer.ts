/**
 * Content Script: Page Analyzer
 *
 * Responsibilities:
 * - Extract text content from web pages
 * - Detect potential claims for verification
 * - Inject verification UI elements
 * - Handle user interactions
 */

import type { PlasmoCSConfig } from 'plasmo';

import type { DetectedClaim } from '~/lib/types';
import logger from '~/lib/utils/logger';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  run_at: 'document_idle',
};

// Minimum text length to consider for claim detection
const MIN_TEXT_LENGTH = 20;
const MAX_TEXT_LENGTH = 500;

// Patterns that might indicate verifiable claims
const CLAIM_PATTERNS = [
  /据.*?报道/,
  /根据.*?(显示|表明|证明)/,
  /研究(表明|发现|显示)/,
  /专家(称|说|表示)/,
  /官方(表示|宣布|声明)/,
  /数据(显示|表明)/,
  /\d+%/,
  /\d+(万|亿|千|百)/,
  /去年|今年|上个月|本月/,
];

/**
 * Extract text nodes from an element
 */
function extractTextNodes(element: Element): Text[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const text = node.textContent?.trim() || '';
      if (text.length < MIN_TEXT_LENGTH) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  let node: Text | null;

  while ((node = walker.nextNode() as Text)) {
    textNodes.push(node);
  }

  return textNodes;
}

/**
 * Check if text might contain a verifiable claim
 */
function mightContainClaim(text: string): boolean {
  return CLAIM_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Simple claim detection (will be enhanced with NLP later)
 */
function detectClaims(text: string): DetectedClaim[] {
  const claims: DetectedClaim[] = [];

  // For MVP, use simple pattern matching
  if (!mightContainClaim(text)) {
    return claims;
  }

  // Split into sentences (simplified)
  const sentences = text.split(/[。！？\.\!\?]/);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length >= MIN_TEXT_LENGTH && trimmed.length <= MAX_TEXT_LENGTH) {
      if (mightContainClaim(trimmed)) {
        claims.push({
          id: `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: trimmed,
          type: 'factual',
          entities: [],
          language: 'zh-CN', // Will be detected properly later
          confidence: 0.5, // Placeholder confidence
          position: {
            start: text.indexOf(trimmed),
            end: text.indexOf(trimmed) + trimmed.length,
          },
          riskLevel: 'medium',
        });
      }
    }
  }

  return claims;
}

/**
 * Analyze page content
 */
function analyzePage(): DetectedClaim[] {
  const allClaims: DetectedClaim[] = [];

  // Get main content area (heuristic)
  const contentSelectors = ['article', 'main', '.content', '.post', '.entry', '#content'];

  let contentArea: Element | null = null;
  for (const selector of contentSelectors) {
    contentArea = document.querySelector(selector);
    if (contentArea) break;
  }

  // Fallback to body
  if (!contentArea) {
    contentArea = document.body;
  }

  // Extract and analyze text
  const textNodes = extractTextNodes(contentArea);

  for (const node of textNodes) {
    const text = node.textContent || '';
    const claims = detectClaims(text);
    allClaims.push(...claims);
  }

  logger.info('Page analysis complete', { claimsFound: allClaims.length });

  return allClaims;
}

/**
 * Handle verification request from context menu
 */
function handleVerifySelection(text: string): void {
  logger.info('Verify selection requested', { text: text.substring(0, 50) });

  // Open popup or show inline verification
  // For MVP, send to background for processing
  chrome.runtime.sendMessage({
    type: 'VERIFY_CLAIM',
    payload: { text, language: 'zh-CN' },
  });
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'VERIFY_SELECTION':
      handleVerifySelection(message.payload.text);
      sendResponse({ success: true });
      break;

    case 'ANALYZE_PAGE':
      const claims = analyzePage();
      sendResponse({ success: true, claims });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true;
});

// Run initial analysis after page load
if (document.readyState === 'complete') {
  setTimeout(() => {
    const claims = analyzePage();
    if (claims.length > 0) {
      logger.debug('Initial analysis found claims', { count: claims.length });
    }
  }, 1000);
} else {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const claims = analyzePage();
      if (claims.length > 0) {
        logger.debug('Initial analysis found claims', { count: claims.length });
      }
    }, 1000);
  });
}

// Inject styles for highlighting
const style = document.createElement('style');
style.textContent = `
  .xcg-claim-highlight {
    position: relative;
    cursor: pointer;
  }

  .xcg-claim-highlight::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    opacity: 0.7;
  }

  .xcg-claim-highlight:hover::after {
    opacity: 1;
  }

  .xcg-verified-false {
    background: linear-gradient(to bottom, transparent 60%, rgba(255, 0, 0, 0.15) 60%);
    border-bottom: 2px solid #ef4444;
  }

  .xcg-verified-partly {
    background: linear-gradient(to bottom, transparent 60%, rgba(255, 165, 0, 0.15) 60%);
    border-bottom: 2px solid #f59e0b;
  }

  .xcg-verified-true {
    background: linear-gradient(to bottom, transparent 60%, rgba(0, 255, 0, 0.15) 60%);
    border-bottom: 2px solid #10b981;
  }

  .xcg-verified-unknown {
    background: linear-gradient(to bottom, transparent 60%, rgba(128, 128, 128, 0.15) 60%);
    border-bottom: 2px solid #6b7280;
  }
`;
document.head.appendChild(style);

logger.info('Content script loaded');

export {};
