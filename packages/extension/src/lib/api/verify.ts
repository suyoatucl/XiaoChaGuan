/**
 * Verification API functions
 */

import type { VerificationResult } from '~/lib/types';
import logger from '~/lib/utils/logger';
import { generateId } from '~/lib/utils/hash';

import apiClient from './client';
import type { VerifyApiRequest, VerifyApiResponse, ApiResponse } from './types';

/**
 * Convert API response to internal format
 */
function convertResponse(response: VerifyApiResponse): VerificationResult {
  return {
    id: response.id,
    verdict: response.verdict,
    confidence: response.confidence,
    summary: response.summary,
    evidenceChain: response.evidence_chain.map((e) => ({
      id: e.id,
      source: e.source,
      sourceUrl: e.source_url,
      title: e.title,
      snippet: e.snippet,
      publishedAt: e.published_at,
      credibilityScore: e.credibility_score,
      language: e.language,
    })),
    originalClaim: response.original_claim,
    language: response.language,
    mistranslationDetected: response.mistranslation_detected,
    mistranslationDetails: response.mistranslation_details,
    originalSource: response.original_source,
    createdAt: response.created_at,
    cached: false,
  };
}

/**
 * Verify a claim via API
 */
export async function verifyClaim(
  text: string,
  language: string = 'zh-CN',
  options?: VerifyApiRequest['options']
): Promise<ApiResponse<VerificationResult>> {
  logger.info('Verifying claim', { text: text.substring(0, 50), language });

  const response = await apiClient.post<VerifyApiResponse>('/api/v1/verify', {
    text,
    language,
    options,
  });

  if (response.success && response.data) {
    return {
      success: true,
      data: convertResponse(response.data),
    };
  }

  return {
    success: false,
    error: response.error,
  };
}

/**
 * Mock verification for offline/development mode
 */
export function mockVerify(text: string, language: string = 'zh-CN'): VerificationResult {
  const verdicts: VerificationResult['verdict'][] = ['true', 'false', 'partly_true', 'unverified'];
  const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];

  return {
    id: generateId(),
    verdict: randomVerdict,
    confidence: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
    summary: `这是对"${text.substring(0, 30)}..."的模拟验证结果。`,
    evidenceChain: [
      {
        id: generateId(),
        source: '示例来源',
        sourceUrl: 'https://example.com',
        title: '示例证据',
        snippet: '这是一个模拟的证据摘要...',
        credibilityScore: 0.8,
        language,
      },
    ],
    originalClaim: text,
    language,
    mistranslationDetected: false,
    createdAt: new Date().toISOString(),
    cached: false,
  };
}
