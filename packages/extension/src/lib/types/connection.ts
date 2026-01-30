/**
 * Connection and network-related type definitions
 */

export type ConnectionLayer = 'direct' | 'shadowsocks' | 'vmess' | 'tor' | 'offline';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface ConnectionStatus {
  layer: ConnectionLayer;
  state: ConnectionState;
  latency: number;
  lastSuccess: Date | null;
  failureCount: number;
  isHealthy: boolean;
  errorMessage?: string;
}

export interface ProxyConfig {
  type: 'shadowsocks' | 'vmess' | 'tor';
  server: string;
  port: number;
  password?: string;
  method?: string;
  enabled: boolean;
}

export interface NetworkConfig {
  apiUrl: string;
  timeout: number;
  retryCount: number;
  proxies: ProxyConfig[];
  preferredLayer: ConnectionLayer;
}

export interface HealthCheckResult {
  layer: ConnectionLayer;
  success: boolean;
  latency: number;
  timestamp: Date;
  error?: string;
}
