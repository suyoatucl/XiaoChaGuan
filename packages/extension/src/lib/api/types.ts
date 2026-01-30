/**
 * API type definitions
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface VerifyApiRequest {
  text: string;
  language?: string;
  options?: {
    cross_lingual?: boolean;
    max_sources?: number;
    force_refresh?: boolean;
  };
}

export interface VerifyApiResponse {
  id: string;
  verdict: 'true' | 'false' | 'partly_true' | 'unverified';
  confidence: number;
  summary: string;
  evidence_chain: Array<{
    id: string;
    source: string;
    source_url: string;
    title: string;
    snippet: string;
    published_at?: string;
    credibility_score: number;
    language: string;
  }>;
  original_claim: string;
  language: string;
  mistranslation_detected: boolean;
  mistranslation_details?: string;
  original_source?: {
    url: string;
    title: string;
    language: string;
    excerpt: string;
  };
  created_at: string;
}

export interface SearchApiRequest {
  query: string;
  languages?: string[];
  sources?: string[];
  limit?: number;
}

export interface SearchApiResponse {
  results: Array<{
    id: string;
    title: string;
    snippet: string;
    url: string;
    source: string;
    language: string;
    published_at?: string;
    relevance_score: number;
  }>;
  total: number;
}

export interface HealthApiResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    llm: boolean;
    vector_db: boolean;
    cache: boolean;
  };
}
