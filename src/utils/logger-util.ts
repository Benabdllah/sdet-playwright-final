/**
 * ============================================================================
 * ULTIMATE SDET LOGGER (FINAL) +++++
 * ============================================================================
 * Comprehensive multi-format logging system with rotation, filtering, analytics
 * Features: Console, File, JSON, CSV logging; Colors, Emojis, Filters, Stats
 * Supports: Log levels, formatting, metrics, performance tracking, archiving
 * Production-ready with structured logging, context tracking, and visualization
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

// ============================================================================
// TYPES & ENUMS
// ============================================================================

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  DISABLED = 6,
}

export enum LogFormat {
  TEXT = 'text',
  JSON = 'json',
  CSV = 'csv',
  TABLE = 'table',
  MINIMAL = 'minimal',
}

export enum LogDestination {
  CONSOLE = 'console',
  FILE = 'file',
  BOTH = 'both',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: Record<string, any>;
  stackTrace?: string;
  duration?: number;
  metadata?: Record<string, any>;
  source?: string;
}

export interface LogConfig {
  level: LogLevel;
  format: LogFormat;
  destination: LogDestination;
  logDir: string;
  maxFileSize: number;
  maxFiles: number;
  enableColors: boolean;
  enableEmojis: boolean;
  enableTimestamp: boolean;
  enableContext: boolean;
  includeStackTrace: boolean;
  filters?: LogFilter[];
  metrics?: boolean;
}

export interface LogFilter {
  name: string;
  test: (entry: LogEntry) => boolean;
}

export interface LogMetrics {
  totalLogs: number;
  totalErrors: number;
  totalWarnings: number;
  averageMessageLength: number;
  logsPerSecond: number;
  startTime: number;
  endTime: number;
  duration: number;
  levelDistribution: Record<string, number>;
}

export interface ColorScheme {
  trace: string;
  debug: string;
  info: string;
  warn: string;
  error: string;
  fatal: string;
  timestamp: string;
  reset: string;
}

export interface LoggerContext {
  userId?: string;
  sessionId?: string;
  traceId?: string;
  testName?: string;
  testId?: string;
  [key: string]: any;
}

// ============================================================================
// COLOR CODES
// ============================================================================

const Colors = {
  TRACE: '\x1b[0;37m',
  DEBUG: '\x1b[0;36m',
  INFO: '\x1b[0;34m',
  WARN: '\x1b[1;33m',
  ERROR: '\x1b[0;31m',
  FATAL: '\x1b[0;35m',
  TIMESTAMP: '\x1b[0;90m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
};

const Emojis = {
  TRACE: '📝',
  DEBUG: '🔍',
  INFO: 'ℹ️ ',
  WARN: '⚠️ ',
  ERROR: '❌',
  FATAL: '💀',
};

// ============================================================================
// LOGGER CLASS
// ============================================================================

export class Logger extends EventEmitter {
  private config: LogConfig;
  private context: LoggerContext = {};
  private logs: LogEntry[] = [];
  private metrics: LogMetrics = {
    totalLogs: 0,
    totalErrors: 0,
    totalWarnings: 0,
    averageMessageLength: 0,
    logsPerSecond: 0,
    startTime: Date.now(),
    endTime: 0,
    duration: 0,
    levelDistribution: {},
  };

  private currentFile: string = '';
  private fileStream?: fs.WriteStream;
  private performanceMarkers: Map<string, number> = new Map();

  constructor(config: Partial<LogConfig> = {}) {
    super();

    this.config = {
      level: LogLevel.DEBUG,
      format: LogFormat.TEXT,
      destination: LogDestination.BOTH,
      logDir: path.resolve(process.cwd(), 'test-results/logs'),
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      enableColors: true,
      enableEmojis: true,
      enableTimestamp: true,
      enableContext: true,
      includeStackTrace: false,
      metrics: true,
      ...config,
    };

    this.initializeLogDirectory();
    this.initializeFileStream();
  }

  /**
   * Initialize log directory
   */
  private initializeLogDirectory(): void {
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  /**
   * Initialize file stream for logging
   */
  private initializeFileStream(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentFile = path.join(this.config.logDir, `sdet-${timestamp}.log`);

    this.fileStream = fs.createWriteStream(this.currentFile, { flags: 'a' });
    this.fileStream.on('error', (error) => console.error('Logger file stream error:', error));
  }

  /**
   * Set context for all subsequent logs
   */
  setContext(context: Partial<LoggerContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Get current context
   */
  getContext(): LoggerContext {
    return { ...this.context };
  }

  /**
   * Update context property
   */
  updateContext(key: string, value: any): void {
    this.context[key] = value;
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    // Check log level
    if (level < this.config.level) {
      return;
    }

    // Apply filters
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      message,
      context: this.config.enableContext ? this.context : undefined,
      metadata: meta,
    };

    if (this.config.filters && this.config.filters.some((f) => !f.test(entry))) {
      return;
    }

    // Add stack trace if enabled
    if (this.config.includeStackTrace && level >= LogLevel.WARN) {
      entry.stackTrace = new Error().stack;
    }

    // Store log entry
    this.logs.push(entry);

    // Update metrics
    this.updateMetrics(entry);

    // Output log
    this.output(entry);

    // Emit event
    this.emit('log', entry);
  }

  /**
   * Format log entry for output
   */
  private formatEntry(entry: LogEntry): string {
    switch (this.config.format) {
      case LogFormat.JSON:
        return JSON.stringify(entry);

      case LogFormat.CSV:
        return [entry.timestamp, entry.levelName, entry.message, JSON.stringify(entry.context)].join(',');

      case LogFormat.MINIMAL:
        return `[${entry.levelName}] ${entry.message}`;

      case LogFormat.TABLE:
        return this.formatAsTable(entry);

      case LogFormat.TEXT:
      default:
        return this.formatAsText(entry);
    }
  }

  /**
   * Format as colored text
   */
  private formatAsText(entry: LogEntry): string {
    let output = '';

    // Add emoji
    if (this.config.enableEmojis) {
      output += `${Emojis[entry.levelName as keyof typeof Emojis] || '•'} `;
    }

    // Add timestamp
    if (this.config.enableTimestamp) {
      const color = this.config.enableColors ? Colors.TIMESTAMP : '';
      const reset = this.config.enableColors ? Colors.RESET : '';
      output += `${color}[${entry.timestamp}]${reset} `;
    }

    // Add level with color
    const levelColor = this.config.enableColors ? Colors[entry.levelName as keyof typeof Colors] : '';
    const reset = this.config.enableColors ? Colors.RESET : '';
    output += `${levelColor}${entry.levelName}${reset}`;

    // Add message
    output += `: ${entry.message}`;

    // Add context
    if (this.config.enableContext && entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${JSON.stringify(entry.context)}`;
    }

    // Add metadata
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output += ` ${JSON.stringify(entry.metadata)}`;
    }

    // Add stack trace
    if (entry.stackTrace) {
      output += `\n${entry.stackTrace}`;
    }

    return output;
  }

  /**
   * Format as table
   */
  private formatAsTable(entry: LogEntry): string {
    const parts = [
      ['Timestamp', entry.timestamp],
      ['Level', entry.levelName],
      ['Message', entry.message],
    ];

    if (entry.context) {
      parts.push(['Context', JSON.stringify(entry.context)]);
    }

    if (entry.metadata) {
      parts.push(['Metadata', JSON.stringify(entry.metadata)]);
    }

    const colWidths = [15, 50];
    let output = '';

    parts.forEach(([key, value]) => {
      output += `${key.padEnd(colWidths[0])} | ${String(value).padEnd(colWidths[1])}\n`;
    });

    return output;
  }

  /**
   * Output log entry to console and/or file
   */
  private output(entry: LogEntry): void {
    const formatted = this.formatEntry(entry);

    // Console output
    if ([LogDestination.CONSOLE, LogDestination.BOTH].includes(this.config.destination)) {
      const logFn = entry.level >= LogLevel.ERROR ? console.error : console.log;
      logFn(this.config.enableColors ? formatted : this.stripColors(formatted));
    }

    // File output
    if ([LogDestination.FILE, LogDestination.BOTH].includes(this.config.destination)) {
      if (this.fileStream) {
        this.fileStream.write(this.stripColors(formatted) + '\n');
        this.checkFileRotation();
      }
    }
  }

  /**
   * Strip ANSI color codes
   */
  private stripColors(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Update metrics
   */
  private updateMetrics(entry: LogEntry): void {
    if (!this.config.metrics) {
      return;
    }

    this.metrics.totalLogs++;

    if (entry.level === LogLevel.ERROR) {
      this.metrics.totalErrors++;
    } else if (entry.level === LogLevel.WARN) {
      this.metrics.totalWarnings++;
    }

    this.metrics.levelDistribution[entry.levelName] = (this.metrics.levelDistribution[entry.levelName] || 0) + 1;
    this.metrics.averageMessageLength = (this.metrics.averageMessageLength * (this.metrics.totalLogs - 1) + entry.message.length) / this.metrics.totalLogs;

    const now = Date.now();
    this.metrics.endTime = now;
    this.metrics.duration = now - this.metrics.startTime;
    this.metrics.logsPerSecond = (this.metrics.totalLogs / this.metrics.duration) * 1000;
  }

  /**
   * Check if file needs rotation
   */
  private checkFileRotation(): void {
    try {
      const stats = fs.statSync(this.currentFile);
      if (stats.size > this.config.maxFileSize) {
        this.rotateFiles();
      }
    } catch (error) {
      // File may not exist yet
    }
  }

  /**
   * Rotate log files
   */
  private rotateFiles(): void {
    if (this.fileStream) {
      this.fileStream.end();
    }

    this.initializeFileStream();

    // Clean up old files
    const files = fs.readdirSync(this.config.logDir).filter((f) => f.startsWith('sdet-') && f.endsWith('.log'));

    if (files.length > this.config.maxFiles) {
      const filesToDelete = files.slice(this.config.maxFiles);
      filesToDelete.forEach((file) => {
        fs.unlinkSync(path.join(this.config.logDir, file));
      });
    }
  }

  /**
   * Public log methods
   */

  trace(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: Record<string, any> | Error): void {
    const metadata = meta instanceof Error ? { error: meta.message, stack: meta.stack } : meta;
    this.log(LogLevel.ERROR, message, metadata);
  }

  fatal(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, meta);
  }

  /**
   * Performance timing
   */

  startTimer(label: string): void {
    this.performanceMarkers.set(label, Date.now());
    this.debug(`Timer started: ${label}`);
  }

  endTimer(label: string): number {
    const start = this.performanceMarkers.get(label);
    if (!start) {
      this.warn(`Timer not found: ${label}`);
      return 0;
    }

    const duration = Date.now() - start;
    this.performanceMarkers.delete(label);
    this.debug(`Timer ended: ${label}`, { duration: `${duration}ms` });

    return duration;
  }

  /**
   * Get logs with filtering
   */
  getLogs(filter?: { level?: LogLevel; message?: string; context?: string }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level !== undefined) {
      filtered = filtered.filter((l) => l.level === filter.level);
    }

    if (filter?.message) {
      filtered = filtered.filter((l) => l.message.includes(filter.message!));
    }

    if (filter?.context) {
      filtered = filtered.filter((l) => JSON.stringify(l.context).includes(filter.context!));
    }

    return filtered;
  }

  /**
   * Get metrics
   */
  getMetrics(): LogMetrics {
    return { ...this.metrics };
  }

  /**
   * Print metrics report
   */
  printMetrics(): void {
    const metrics = this.getMetrics();

    console.log('\n' + Colors.BOLD + '='.repeat(70) + Colors.RESET);
    console.log(Colors.BOLD + 'LOG METRICS REPORT' + Colors.RESET);
    console.log(Colors.BOLD + '='.repeat(70) + Colors.RESET);
    console.log(`Total Logs: ${metrics.totalLogs}`);
    console.log(`Total Errors: ${metrics.totalErrors}`);
    console.log(`Total Warnings: ${metrics.totalWarnings}`);
    console.log(`Average Message Length: ${metrics.averageMessageLength.toFixed(2)} chars`);
    console.log(`Logs Per Second: ${metrics.logsPerSecond.toFixed(2)}`);
    console.log(`Duration: ${metrics.duration}ms`);
    console.log('\nLevel Distribution:');

    Object.entries(metrics.levelDistribution).forEach(([level, count]) => {
      const percentage = ((count / metrics.totalLogs) * 100).toFixed(1);
      console.log(`  ${level}: ${count} (${percentage}%)`);
    });

    console.log(Colors.BOLD + '='.repeat(70) + Colors.RESET + '\n');
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs to file
   */
  exportLogs(filePath: string, format: LogFormat = LogFormat.JSON): void {
    let content = '';

    if (format === LogFormat.JSON) {
      content = JSON.stringify(this.logs, null, 2);
    } else if (format === LogFormat.CSV) {
      content = 'Timestamp,Level,Message,Context\n';
      this.logs.forEach((log) => {
        content += `${log.timestamp},${log.levelName},"${log.message}","${JSON.stringify(log.context || {})}"\n`;
      });
    }

    fs.writeFileSync(filePath, content);
    this.info(`Logs exported to ${filePath}`);
  }

  /**
   * Flush and close logger
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.fileStream) {
        this.fileStream.end(() => resolve());
      } else {
        resolve();
      }
    });
  }
}

// ============================================================================
// DEFAULT LOGGER INSTANCE
// ============================================================================

export const logger = new Logger({
  level: LogLevel.DEBUG,
  format: LogFormat.TEXT,
  destination: LogDestination.BOTH,
  logDir: path.resolve(process.cwd(), 'test-results/logs'),
  enableColors: true,
  enableEmojis: true,
  enableTimestamp: true,
  metrics: true,
});

// ============================================================================
// EXPORT
// ============================================================================

export default Logger;
