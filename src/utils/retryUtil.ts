/**
 * ============================================================================
 * ULTIMATIVES SDET RETRY & ERROR HANDLING (FINAL) +++++
 * ============================================================================
 * Umfassende Retry-Logik mit Circuit Breaker und Backoff-Strategien
 * Features: Exponentieller Backoff, Jitter, Circuit Breaker, Error Tracking
 * Unterstützt: Custom Retry Prädikte, Fallbacks, Timeouts, Metriken
 * Production-Ready mit Resilience Patterns und detaillierten Analytics
 * ============================================================================
 */

// ============================================================================
// TYPEN & ENUMS
// ============================================================================

export enum BackoffStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  EXPONENTIAL_RANDOM = 'exponential_random',
  FIBONACCI = 'fibonacci',
  POLYNOMIAL = 'polynomial',
}

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  strategy: BackoffStrategy;
  factor: number;
  jitter: boolean;
  jitterFactor: number;
  timeoutMs: number;
  retryableErrors: (new (...args: any[]) => Error)[];
  onRetry?: (attempt: number, error: Error, delay: number) => void;
  onSuccess?: (result: any, attempts: number) => void;
  onFailure?: (error: Error, attempts: number) => void;
}

export interface BackoffConfig {
  strategy: BackoffStrategy;
  initialDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitter: boolean;
  jitterFactor: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDurationMs: number;
  lastAttemptTime: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  halfOpenMaxRequests: number;
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  totalAttempts: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  openedAt?: number;
  halfOpenAttempts: number;
}

export interface RetryStatistics {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  totalDurationMs: number;
  averageDurationMs: number;
  averageAttemptsPerSuccess: number;
  errorDistribution: Map<string, number>;
  backoffDelays: number[];
}

// ============================================================================
// BACKOFF-RECHNER
// ============================================================================

export class BackoffCalculator {
  /**
   * Berechne Backoff-Verzögerung basierend auf Strategie
   */
  static calculate(attempt: number, config: BackoffConfig): number {
    let delay = 0;

    switch (config.strategy) {
      case BackoffStrategy.FIXED:
        delay = config.initialDelayMs;
        break;

      case BackoffStrategy.LINEAR:
        delay = config.initialDelayMs + attempt * config.factor;
        break;

      case BackoffStrategy.EXPONENTIAL:
        delay = config.initialDelayMs * Math.pow(config.factor, attempt);
        break;

      case BackoffStrategy.EXPONENTIAL_RANDOM:
        delay = config.initialDelayMs * Math.pow(config.factor, attempt);
        delay = delay * (0.5 + Math.random() * 0.5);
        break;

      case BackoffStrategy.FIBONACCI:
        delay = this.fibonacciDelay(attempt, config.initialDelayMs);
        break;

      case BackoffStrategy.POLYNOMIAL:
        delay = config.initialDelayMs * Math.pow(attempt, config.factor);
        break;

      default:
        delay = config.initialDelayMs;
    }

    // Apply jitter
    if (config.jitter) {
      const jitterAmount = delay * config.jitterFactor * Math.random();
      delay += jitterAmount;
    }

    // Cap at maximum delay
    return Math.min(Math.max(delay, 0), config.maxDelayMs);
  }

  /**
   * Calculate Fibonacci-based delay
   */
  private static fibonacciDelay(attempt: number, base: number): number {
    const fib = [1, 1];
    for (let i = 2; i <= attempt; i++) {
      fib[i] = fib[i - 1] + fib[i - 2];
    }
    return fib[Math.min(attempt, fib.length - 1)] * base;
  }

  /**
   * Get backoff sequence for visualization
   */
  static getSequence(config: BackoffConfig, maxAttempts: number = 5): number[] {
    const sequence: number[] = [];
    for (let i = 0; i < maxAttempts; i++) {
      sequence.push(this.calculate(i, config));
    }
    return sequence;
  }
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private openedAt?: number;
  private halfOpenAttempts: number = 0;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000, // 60 seconds
      halfOpenMaxRequests: 1,
      ...config,
    };
  }

  /**
   * Record successful request
   */
  recordSuccess(): void {
    this.lastSuccessTime = Date.now();

    if (this.state === CircuitBreakerState.CLOSED) {
      this.failureCount = 0;
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.close();
      }
    }
  }

  /**
   * Record failed request
   */
  recordFailure(): void {
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.CLOSED) {
      this.failureCount++;

      if (this.failureCount >= this.config.failureThreshold) {
        this.open();
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.open();
    }
  }

  /**
   * Check if request is allowed
   */
  canExecute(): boolean {
    if (this.state === CircuitBreakerState.CLOSED) {
      return true;
    }

    if (this.state === CircuitBreakerState.OPEN) {
      // Check if timeout has passed
      if (Date.now() - (this.openedAt || 0) > this.config.timeout) {
        this.halfOpen();
        return true;
      }
      return false;
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      return this.halfOpenAttempts < this.config.halfOpenMaxRequests;
    }

    return false;
  }

  /**
   * Open circuit
   */
  private open(): void {
    this.state = CircuitBreakerState.OPEN;
    this.openedAt = Date.now();
    this.successCount = 0;
  }

  /**
   * Transition to half-open
   */
  private halfOpen(): void {
    this.state = CircuitBreakerState.HALF_OPEN;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenAttempts = 0;
  }

  /**
   * Close circuit
   */
  private close(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.openedAt = undefined;
  }

  /**
   * Get metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    const totalAttempts = this.failureCount + this.successCount;
    const successRate = totalAttempts > 0 ? (this.successCount / totalAttempts) * 100 : 0;

    return {
      state: this.state,
      totalAttempts,
      successCount: this.successCount,
      failureCount: this.failureCount,
      successRate,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      openedAt: this.openedAt,
      halfOpenAttempts: this.halfOpenAttempts,
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.openedAt = undefined;
    this.halfOpenAttempts = 0;
  }
}

// ============================================================================
// RETRY UTILITY
// ============================================================================

export class RetryUtil {
  private static statistics: RetryStatistics = {
    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0,
    totalDurationMs: 0,
    averageDurationMs: 0,
    averageAttemptsPerSuccess: 0,
    errorDistribution: new Map(),
    backoffDelays: [],
  };

  /**
   * Execute function with retry logic
   */
  static async execute<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {},
  ): Promise<RetryResult<T>> {
    const opts: RetryOptions = {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 10000,
      strategy: BackoffStrategy.EXPONENTIAL,
      factor: 2,
      jitter: true,
      jitterFactor: 0.1,
      timeoutMs: 30000,
      retryableErrors: [Error],
      ...options,
    };

    let lastError: Error | null = null;
    const startTime = Date.now();
    let attempt = 0;

    for (attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        // Apply timeout
        const result = await Promise.race([
          fn(),
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), opts.timeoutMs),
          ),
        ]);

        // Success
        this.statistics.successfulAttempts++;
        opts.onSuccess?.(result, attempt + 1);

        return {
          success: true,
          data: result,
          attempts: attempt + 1,
          totalDurationMs: Date.now() - startTime,
          lastAttemptTime: Date.now(),
        };
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        const isRetryable = opts.retryableErrors.some((ErrorClass) => error instanceof ErrorClass);

        if (!isRetryable || attempt === opts.maxRetries) {
          // Not retryable or max retries reached
          this.statistics.failedAttempts++;
          const errorName = (error as any)?.constructor?.name || 'Error';
          this.statistics.errorDistribution.set(
            errorName,
            (this.statistics.errorDistribution.get(errorName) || 0) + 1,
          );

          opts.onFailure?.(lastError, attempt + 1);

          return {
            success: false,
            error: lastError,
            attempts: attempt + 1,
            totalDurationMs: Date.now() - startTime,
            lastAttemptTime: Date.now(),
          };
        }

        // Calculate backoff delay
        const backoffConfig: BackoffConfig = {
          strategy: opts.strategy,
          initialDelayMs: opts.initialDelayMs,
          maxDelayMs: opts.maxDelayMs,
          factor: opts.factor,
          jitter: opts.jitter,
          jitterFactor: opts.jitterFactor,
        };

        const delay = BackoffCalculator.calculate(attempt, backoffConfig);
        this.statistics.backoffDelays.push(delay);
        this.statistics.totalAttempts++;

        opts.onRetry?.(attempt + 1, lastError, delay);

        // Wait before retry
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Execute sync function with retry logic
   */
  static executeSync<T>(fn: () => T, options: Partial<RetryOptions> = {}): RetryResult<T> {
    const opts: RetryOptions = {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 10000,
      strategy: BackoffStrategy.EXPONENTIAL,
      factor: 2,
      jitter: true,
      jitterFactor: 0.1,
      timeoutMs: 30000,
      retryableErrors: [Error],
      ...options,
    };

    let lastError: Error | null = null;
    const startTime = Date.now();

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        const result = fn();
        this.statistics.successfulAttempts++;
        opts.onSuccess?.(result, attempt + 1);

        return {
          success: true,
          data: result,
          attempts: attempt + 1,
          totalDurationMs: Date.now() - startTime,
          lastAttemptTime: Date.now(),
        };
      } catch (error) {
        lastError = error as Error;

        const isRetryable = opts.retryableErrors.some((ErrorClass) => error instanceof ErrorClass);

        if (!isRetryable || attempt === opts.maxRetries) {
          this.statistics.failedAttempts++;
          opts.onFailure?.(lastError, attempt + 1);

          return {
            success: false,
            error: lastError,
            attempts: attempt + 1,
            totalDurationMs: Date.now() - startTime,
            lastAttemptTime: Date.now(),
          };
        }

        const backoffConfig: BackoffConfig = {
          strategy: opts.strategy,
          initialDelayMs: opts.initialDelayMs,
          maxDelayMs: opts.maxDelayMs,
          factor: opts.factor,
          jitter: opts.jitter,
          jitterFactor: opts.jitterFactor,
        };

        const delay = BackoffCalculator.calculate(attempt, backoffConfig);
        this.statistics.backoffDelays.push(delay);
        this.statistics.totalAttempts++;

        opts.onRetry?.(attempt + 1, lastError, delay);

        // Sync sleep (busy wait)
        const endTime = Date.now() + delay;
        while (Date.now() < endTime) {
          // Busy wait
        }
      }
    }

    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts: opts.maxRetries + 1,
      totalDurationMs: Date.now() - startTime,
      lastAttemptTime: Date.now(),
    };
  }

  /**
   * Execute with circuit breaker
   */
  static async executeWithCircuitBreaker<T>(
    fn: () => Promise<T>,
    circuitBreaker: CircuitBreaker,
    retryOptions?: Partial<RetryOptions>,
  ): Promise<RetryResult<T>> {
    if (!circuitBreaker.canExecute()) {
      return {
        success: false,
        error: new Error('Circuit breaker is open'),
        attempts: 0,
        totalDurationMs: 0,
        lastAttemptTime: Date.now(),
      };
    }

    try {
      const result = await this.execute(fn, retryOptions);

      if (result.success) {
        circuitBreaker.recordSuccess();
      } else {
        circuitBreaker.recordFailure();
      }

      return result;
    } catch (error) {
      circuitBreaker.recordFailure();
      throw error;
    }
  }

  /**
   * Execute with fallback
   */
  static async executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: () => Promise<T>,
    options?: Partial<RetryOptions>,
  ): Promise<T> {
    try {
      const result = await this.execute(fn, options);
      if (result.success) {
        return result.data!;
      }
      return fallback();
    } catch (error) {
      return fallback();
    }
  }

  /**
   * Execute all with retry (Promise.all with retry)
   */
  static async executeAll<T>(
    fns: Array<() => Promise<T>>,
    options?: Partial<RetryOptions>,
  ): Promise<T[]> {
    const promises = fns.map((fn) => this.execute(fn, options));
    const results = await Promise.all(promises);
    return results.map((r) => {
      if (!r.success) throw r.error;
      return r.data!;
    });
  }

  /**
   * Execute with race (first success)
   */
  static async executeRace<T>(
    fns: Array<() => Promise<T>>,
    options?: Partial<RetryOptions>,
  ): Promise<T> {
    const promises = fns.map((fn) => this.execute(fn, options));
    const result = await Promise.race(promises);
    if (!result.success) throw result.error;
    return result.data!;
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics
   */
  static getStatistics(): RetryStatistics {
    const totalAttempts = this.statistics.totalAttempts || 1;

    return {
      ...this.statistics,
      averageDurationMs: this.statistics.totalDurationMs / totalAttempts,
      averageAttemptsPerSuccess: this.statistics.successfulAttempts > 0
        ? this.statistics.totalAttempts / this.statistics.successfulAttempts
        : 0,
    };
  }

  /**
   * Reset statistics
   */
  static resetStatistics(): void {
    this.statistics = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      totalDurationMs: 0,
      averageDurationMs: 0,
      averageAttemptsPerSuccess: 0,
      errorDistribution: new Map(),
      backoffDelays: [],
    };
  }

  /**
   * Print statistics report
   */
  static printStatistics(): void {
    const stats = this.getStatistics();

    console.log('\n' + '='.repeat(70));
    console.log('RETRY STATISTICS REPORT');
    console.log('='.repeat(70));
    console.log(`Total Attempts: ${stats.totalAttempts}`);
    console.log(`Successful: ${stats.successfulAttempts}`);
    console.log(`Failed: ${stats.failedAttempts}`);
    console.log(`Average Duration: ${stats.averageDurationMs.toFixed(2)}ms`);
    console.log(`Average Attempts per Success: ${stats.averageAttemptsPerSuccess.toFixed(2)}`);

    if (stats.errorDistribution.size > 0) {
      console.log('\nError Distribution:');
      stats.errorDistribution.forEach((count, error) => {
        console.log(`  ${error}: ${count}`);
      });
    }

    if (stats.backoffDelays.length > 0) {
      const avgDelay = stats.backoffDelays.reduce((a, b) => a + b, 0) / stats.backoffDelays.length;
      console.log(`\nAverage Backoff Delay: ${avgDelay.toFixed(2)}ms`);
      console.log(`Max Backoff Delay: ${Math.max(...stats.backoffDelays).toFixed(2)}ms`);
    }

    console.log('='.repeat(70) + '\n');
  }
}

// ============================================================================
// DECORATORS
// ============================================================================

/**
 * Retry decorator for methods
 */
export function Retry(options?: Partial<RetryOptions>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await RetryUtil.execute(() => originalMethod.apply(this, args), options);

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    };

    return descriptor;
  };
}

/**
 * CircuitBreaker decorator
 */
export function WithCircuitBreaker(config?: Partial<CircuitBreakerConfig>) {
  const breaker = new CircuitBreaker(config);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await RetryUtil.executeWithCircuitBreaker(
        () => originalMethod.apply(this, args),
        breaker,
      );

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    };

    return descriptor;
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default RetryUtil;
