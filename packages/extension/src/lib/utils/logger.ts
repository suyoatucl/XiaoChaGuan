/**
 * Logger utility for consistent logging across the extension
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private prefix: string;
  private minLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor(prefix: string = 'XCG', minLevel: LogLevel = 'debug') {
    this.prefix = prefix;
    this.minLevel = process.env.NODE_ENV === 'production' ? 'info' : minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${this.prefix}] [${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private addToHistory(level: LogLevel, message: string, data?: unknown): void {
    this.logs.push({
      level,
      message,
      timestamp: new Date(),
      data,
    });

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return;
    this.addToHistory('debug', message, data);
    console.debug(this.formatMessage('debug', message), data ?? '');
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return;
    this.addToHistory('info', message, data);
    console.info(this.formatMessage('info', message), data ?? '');
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return;
    this.addToHistory('warn', message, data);
    console.warn(this.formatMessage('warn', message), data ?? '');
  }

  error(message: string, data?: unknown): void {
    if (!this.shouldLog('error')) return;
    this.addToHistory('error', message, data);
    console.error(this.formatMessage('error', message), data ?? '');
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger('XCG');

export default logger;
