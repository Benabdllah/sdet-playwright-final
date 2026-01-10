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
} from "./date-util";

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
} from "./string-util";

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
} from "./array";

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
} from "./object";

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
} from "./file";

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
} from "./http";

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
} from "./validator";

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
} from "./crypto";

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
} from "./logger-util";

// ============================================================================
// PERFORMANCE & METRICS UTILITIES
// ============================================================================

export {
  PerformanceUtil,
  type PerformanceMetrics,
  type PerformanceBenchmark,
  type MemoryUsage,
  type TimingMetrics,
} from "./performance";

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
} from "./retry-util";

// ============================================================================
// RANDOM & GENERATION UTILITIES
// ============================================================================

export {
  RandomUtil,
  type RandomGeneratorOptions,
  type RandomDataSet,
  type RandomPersona,
} from "./random-util";

// ============================================================================
// COMPARISON & ASSERTION UTILITIES
// ============================================================================

export {
  ComparisonUtil,
  type ComparisonOptions,
  type ComparisonResult,
  type AssertionOptions,
} from "./comparison";

// ============================================================================
// PAGINATION & DATA HANDLING UTILITIES
// ============================================================================

export {
  PaginationUtil,
  type PaginationConfig,
  type PaginatedResult,
  type PageMetadata,
} from "./pagination";

// ============================================================================
// TEMPLATE & FORMAT UTILITIES
// ============================================================================

export {
  TemplateUtil,
  type TemplateContext,
  type TemplateOptions,
  type TemplateCompileOptions,
} from "./template";

// ============================================================================
// CACHING UTILITIES
// ============================================================================

export {
  CacheUtil,
  CacheStrategy,
  type CacheConfig,
  type CacheEntry,
  type CacheStatistics,
} from "./cache";

// ============================================================================
// WAIT & POLLING UTILITIES
// ============================================================================

export {
  WaitUtil,
  WaitStrategy,
  type WaitCondition,
  type WaitOptions,
  type PollingResult,
} from "./wait-util";

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

export {
  ConversionUtil,
  type ConversionOptions,
  type ConversionResult,
} from "./conversion";

// ============================================================================
// BATCH PROCESSING UTILITIES
// ============================================================================

export {
  BatchUtil,
  type BatchOptions,
  type BatchProcessResult,
  type BatchStatistics,
} from "./batch";

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
    // Dynamische Imports für ESM-Kompatibilität
    return {
      date: (await import("./date")).DateUtil,
      string: (await import("./string")).StringUtil,
      array: (await import("./array")).ArrayUtil,
      object: (await import("./object")).ObjectUtil,
      file: (await import("./file")).FileUtil,
      http: (await import("./http")).HttpUtil,
      validator: (await import("./validator")).ValidatorUtil,
      crypto: (await import("./crypto")).CryptoUtil,
      logger: (await import("./logger")).Logger,
      performance: (await import("./performance")).PerformanceUtil,
      retry: (await import("./retry")).RetryUtil,
      random: (await import("./random")).RandomUtil,
      comparison: (await import("./comparison")).ComparisonUtil,
      pagination: (await import("./pagination")).PaginationUtil,
      template: (await import("./template")).TemplateUtil,
      cache: (await import("./cache")).CacheUtil,
      wait: (await import("./wait")).WaitUtil,
      conversion: (await import("./conversion")).ConversionUtil,
      batch: (await import("./batch")).BatchUtil,
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
      name: "ULTIMATE SDET UTILITIES LIBRARY",
      version: "1.0.0",
      description: "Comprehensive utility library for SDET automation testing",
      author: "SDET Team",
      license: "MIT",
      utilities: this.listAvailable().length,
      categories: [
        "Date & Time",
        "String",
        "Array & Collection",
        "Object",
        "File & Filesystem",
        "HTTP & Network",
        "Validation",
        "Encryption & Security",
        "Logging",
        "Performance & Metrics",
        "Retry & Error Handling",
        "Random & Generation",
        "Comparison & Assertion",
        "Pagination & Data Handling",
        "Template & Format",
        "Caching",
        "Wait & Polling",
        "Conversion",
        "Batch Processing",
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
// Dynamische Utils-Factory für ESM
export const Utils = {
  Date: async () => (await import("./date")).DateUtil,
  String: async () => (await import("./string")).StringUtil,
  Array: async () => (await import("./array")).ArrayUtil,
  Object: async () => (await import("./object")).ObjectUtil,
  File: async () => (await import("./file")).FileUtil,
  Http: async () => (await import("./http")).HttpUtil,
  Validator: async () => (await import("./validator")).ValidatorUtil,
  Crypto: async () => (await import("./crypto")).CryptoUtil,
  Logger: async () => (await import("./logger")).Logger,
  Performance: async () => (await import("./performance")).PerformanceUtil,
  Retry: async () => (await import("./retry")).RetryUtil,
  Random: async () => (await import("./random")).RandomUtil,
  Comparison: async () => (await import("./comparison")).ComparisonUtil,
  Pagination: async () => (await import("./pagination")).PaginationUtil,
  Template: async () => (await import("./template")).TemplateUtil,
  Cache: async () => (await import("./cache")).CacheUtil,
  Wait: async () => (await import("./wait")).WaitUtil,
  Conversion: async () => (await import("./conversion")).ConversionUtil,
  Batch: async () => (await import("./batch")).BatchUtil,
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
  name: "@sdet/utilities",
  version: "1.0.0",
  description: "Ultimate SDET automation testing utilities library",
  main: "src/utils/index.ts",
  exports: {
    ".": "./index.ts",
    "./date": "./date.ts",
    "./string": "./string.ts",
    "./array": "./array.ts",
    "./object": "./object.ts",
    "./file": "./file.ts",
    "./http": "./http.ts",
    "./validator": "./validator.ts",
    "./crypto": "./crypto.ts",
    "./logger": "./logger.ts",
    "./performance": "./performance.ts",
    "./retry": "./retry.ts",
    "./random": "./random.ts",
    "./comparison": "./comparison.ts",
    "./pagination": "./pagination.ts",
    "./template": "./template.ts",
    "./cache": "./cache.ts",
    "./wait": "./wait.ts",
    "./conversion": "./conversion.ts",
    "./batch": "./batch.ts",
  },
  keywords: [
    "sdet",
    "automation",
    "testing",
    "playwright",
    "utilities",
    "helpers",
    "typescript",
    "production-ready",
  ],
  author: "SDET Team",
  license: "MIT",
  repository: {
    type: "git",
    url: "https://github.com/sdet-team/sdet-pw-practice",
  },
} as const;
