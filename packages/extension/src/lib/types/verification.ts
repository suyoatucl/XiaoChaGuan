/**
 * Verification-related type definitions
 */

export type Verdict = 'true' | 'false' | 'partly_true' | 'unverified';

export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

export interface Evidence {
  id: string;
  source: string;
  sourceUrl: string;
  title: string;
  snippet: string;
  publishedAt?: string;
  credibilityScore: number;
  language: string;
}

export interface VerificationResult {
  id: string;
  verdict: Verdict;
  confidence: number;
  summary: string;
  evidenceChain: Evidence[];
  originalClaim: string;
  language: string;
  mistranslationDetected: boolean;
  mistranslationDetails?: string;
  originalSource?: {
    url: string;
    title: string;
    language: string;
    excerpt: string;
  };
  createdAt: string;
  cached: boolean;
}

export interface VerificationRequest {
  text: string;
  language?: string;
  options?: {
    crossLingual?: boolean;
    maxSources?: number;
    forceRefresh?: boolean;
  };
}

export interface Claim {
  id: string;
  text: string;
  type: 'factual' | 'opinion' | 'prediction' | 'quote';
  entities: string[];
  language: string;
  confidence: number;
}

export interface DetectedClaim extends Claim {
  position: {
    start: number;
    end: number;
  };
  riskLevel: RiskLevel;
  element?: HTMLElement;
}
