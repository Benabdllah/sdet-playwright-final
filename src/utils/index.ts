/**
 * ============================================================================
 * ULTIMATE SDET UTILITIES INDEX (FINAL) +++++
 * ============================================================================
 * Central export point for all SDET utility modules
 * Features: Organized re-exports, barrel imports, utility aggregation
 * Supports: TypeScript tree-shaking, named & default imports
 * Production-ready with comprehensive utility library ecosystem
 * ============================================================================
 */

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

export {
  DateUtil,
  TimeUnit,
  DateFormat,
  DayOfWeek,
  Month,
  type DateRange,
  type DateDifference,
  type TimezoneMeta,
  type QuarterInfo,
  type WeekInfo,
} from './date-util';

// ============================================================================
// STRING UTILITIES
// ============================================================================

export {
  StringUtil,
  CaseFormat,
  StringPadding,
  StringSearchMode,
  type StringSimilarityResult,
  type StringMetrics,
  type StringValidationResult,
} from './string-util';

// ============================================================================
// ARRAY & COLLECTION UTILITIES
// ============================================================================

export {
  ArrayUtil,
  type ArrayChunkOptions,
  type ArrayGroupResult,
  type ArrayFlattenOptions,
  type ArrayDiffResult,
  type ArrayStatistics,
} from './array';

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

export {
  ObjectUtil,
  type ObjectDiffOptions,
  type ObjectDiffResult,
  type ObjectFlattenOptions,
  type ObjectMergeOptions,
  type ObjectSearchResult,
} from './object';

// ============================================================================
// FILE & FILESYSTEM UTILITIES
// ============================================================================

export {
  FileUtil,
  FileType,
  FileEncoding,
  type FileMetadata,
  type FileSearchOptions,
  type FileSearchResult,
  type FileComparisonResult,
} from './file';

// ============================================================================
// HTTP & NETWORK UTILITIES
// ============================================================================

export {
  HttpUtil,
  HttpMethod,
  HttpStatus,
  type HttpConfig,
  type HttpResponse,
  type HttpRequestOptions,
  type CacheConfig,
} from './http';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export {
  ValidatorUtil,
  ValidationRule,
  type ValidationResult,
  type ValidationSchema,
  type ValidationError,
  type ValidationOptions,
} from './validator';

// ============================================================================
// ENCRYPTION & SECURITY UTILITIES
// ============================================================================

export {
  CryptoUtil,
  EncryptionAlgorithm,
  HashAlgorithm,
  type CryptoConfig,
  type EncryptedData,
  type KeyDerivationOptions,
} from './crypto';

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

export {
  Logger,
  LogLevel,
  LogFormat,
  type LogConfig,
  type LogEntry,
  type LogMetrics,
  type LogFilter,
} from './logger-util';

// ============================================================================
// PERFORMANCE & METRICS UTILITIES
// ============================================================================

export {
  PerformanceUtil,
  type PerformanceMetrics,
  type PerformanceBenchmark,
  type MemoryUsage,
  type TimingMetrics,
} from './performance';

// ============================================================================
// RETRY & ERROR HANDLING UTILITIES
// ============================================================================

export {
  RetryUtil,
  BackoffStrategy,
  type RetryOptions,
  type RetryResult,
  type CircuitBreakerConfig,
  type BackoffConfig,
} from './retry-util';

// ============================================================================
// RANDOM & GENERATION UTILITIES
// ============================================================================

export {
  RandomUtil,
  type RandomGeneratorOptions,
  type RandomDataSet,
  type RandomPersona,
} from './random-util';

// ============================================================================
// COMPARISON & ASSERTION UTILITIES
// ============================================================================

export {
  ComparisonUtil,
  type ComparisonOptions,
  type ComparisonResult,
  type AssertionOptions,
} from './comparison';

// ============================================================================
// PAGINATION & DATA HANDLING UTILITIES
// ============================================================================

export {
  PaginationUtil,
  type PaginationConfig,
  type PaginatedResult,
  type PageMetadata,
} from './pagination';

// ============================================================================
// TEMPLATE & FORMAT UTILITIES
// ============================================================================

export {
  TemplateUtil,
  type TemplateContext,
  type TemplateOptions,
  type TemplateCompileOptions,
} from './template';

// ============================================================================
// CACHING UTILITIES
// ============================================================================

export {
  CacheUtil,
  CacheStrategy,
  type CacheConfig,
  type CacheEntry,
  type CacheStatistics,
} from './cache';

// ============================================================================
// WAIT & POLLING UTILITIES
// ============================================================================

export {
  WaitUtil,
  WaitStrategy,
  type WaitCondition,
  type WaitOptions,
  type PollingResult,
} from './wait-util';

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

export {
  ConversionUtil,
  type ConversionOptions,
  type ConversionResult,
} from './conversion';

// ============================================================================
// BATCH PROCESSING UTILITIES
// ============================================================================

export {
  BatchUtil,
  type BatchOptions,
  type BatchProcessResult,
  type BatchStatistics,
} from './batch';

// ============================================================================
// UTILITY AGGREGATOR CLASS
// ============================================================================

/**
 * Central utility aggregator providing access to all SDET utilities
 * Usage: const utils = new UtilityAggregator();
 */
export class UtilityAggregator {
  /**
   * Get all available utility classes
   */
  static getAll() {
    return {
      date: require('./date').DateUtil,
      string: require('./string').StringUtil,
      array: require('./array').ArrayUtil,
      object: require('./object').ObjectUtil,
      file: require('./file').FileUtil,
      http: require('./http').HttpUtil,
      validator: require('./validator').ValidatorUtil,
      crypto: require('./crypto').CryptoUtil,
      logger: require('./logger').Logger,
      performance: require('./performance').PerformanceUtil,
      retry: require('./retry').RetryUtil,
      random: require('./random').RandomUtil,
      comparison: require('./comparison').ComparisonUtil,
      pagination: require('./pagination').PaginationUtil,
      template: require('./template').TemplateUtil,
      cache: require('./cache').CacheUtil,
      wait: require('./wait').WaitUtil,
      conversion: require('./conversion').ConversionUtil,
      batch: require('./batch').BatchUtil,
    };
  }

  /**
   * Get specific utility class
   */
  static get<T>(name: keyof ReturnType<typeof UtilityAggregator.getAll>): T {
    const all = this.getAll();
    return all[name] as T;
  }

  /**
   * List all available utilities
   */
  static listAvailable(): string[] {
    return Object.keys(this.getAll());
  }

  /**
   * Get utility info
   */
  static getInfo() {
    return {
      name: 'ULTIMATE SDET UTILITIES LIBRARY',
      version: '1.0.0',
      description: 'Comprehensive utility library for SDET automation testing',
      author: 'SDET Team',
      license: 'MIT',
      utilities: this.listAvailable().length,
      categories: [
        'Date & Time',
        'String',
        'Array & Collection',
        'Object',
        'File & Filesystem',
        'HTTP & Network',
        'Validation',
        'Encryption & Security',
        'Logging',
        'Performance & Metrics',
        'Retry & Error Handling',
        'Random & Generation',
        'Comparison & Assertion',
        'Pagination & Data Handling',
        'Template & Format',
        'Caching',
        'Wait & Polling',
        'Conversion',
        'Batch Processing',
      ],
    };
  }
}

// ============================================================================
// UTILITY ALIASES FOR CONVENIENCE
// ============================================================================

/**
 * Quick access utility aliases
 */
export const Utils = {
  Date: require('./date').DateUtil,
  String: require('./string').StringUtil,
  Array: require('./array').ArrayUtil,
  Object: require('./object').ObjectUtil,
  File: require('./file').FileUtil,
  Http: require('./http').HttpUtil,
  Validator: require('./validator').ValidatorUtil,
  Crypto: require('./crypto').CryptoUtil,
  Logger: require('./logger').Logger,
  Performance: require('./performance').PerformanceUtil,
  Retry: require('./retry').RetryUtil,
  Random: require('./random').RandomUtil,
  Comparison: require('./comparison').ComparisonUtil,
  Pagination: require('./pagination').PaginationUtil,
  Template: require('./template').TemplateUtil,
  Cache: require('./cache').CacheUtil,
  Wait: require('./wait').WaitUtil,
  Conversion: require('./conversion').ConversionUtil,
  Batch: require('./batch').BatchUtil,
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default UtilityAggregator;

// ============================================================================
// PACKAGE METADATA
// ============================================================================

/**
 * SDET Utilities Package Metadata
 */
export const PACKAGE_INFO = {
  name: '@sdet/utilities',
  version: '1.0.0',
  description: 'Ultimate SDET automation testing utilities library',
  main: 'src/utils/index.ts',
  exports: {
    '.': './index.ts',
    './date': './date.ts',
    './string': './string.ts',
    './array': './array.ts',
    './object': './object.ts',
    './file': './file.ts',
    './http': './http.ts',
    './validator': './validator.ts',
    './crypto': './crypto.ts',
    './logger': './logger.ts',
    './performance': './performance.ts',
    './retry': './retry.ts',
    './random': './random.ts',
    './comparison': './comparison.ts',
    './pagination': './pagination.ts',
    './template': './template.ts',
    './cache': './cache.ts',
    './wait': './wait.ts',
    './conversion': './conversion.ts',
    './batch': './batch.ts',
  },
  keywords: [
    'sdet',
    'automation',
    'testing',
    'playwright',
    'utilities',
    'helpers',
    'typescript',
    'production-ready',
  ],
  author: 'SDET Team',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/sdet-team/sdet-pw-practice',
  },
} as const;
