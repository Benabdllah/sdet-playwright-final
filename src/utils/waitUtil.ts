/**
 * ============================================================================
 * ULTIMATIVES SDET WAIT & POLLING (FINAL) +++++
 * ============================================================================
 * Umfassendes Wait/Polling-System mit mehreren Strategien und Bedingungen
 * Features: Exponentieller Backoff, Timeout-Handling, Bedingungserfüllung
 * Unterstützt: DOM-Warten, Custom-Bedingungen, Stabilität-Checks, Retries
 * Production-Ready mit Metriken, Callbacks und detaillierten Status-Reports
 * ============================================================================
 */

import { Page, Locator, ElementHandle } from '@playwright/test';

// ============================================================================
// TYPEN & ENUMS
// ============================================================================

export enum WaitStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  FIBONACCI = 'fibonacci',
  AGGRESSIVE = 'aggressive',
}

export enum WaitTarget {
  ELEMENT = 'element',
  CONDITION = 'condition',
  NAVIGATION = 'navigation',
  NETWORK = 'network',
  STABILITY = 'stability',
  VISIBILITY = 'visibility',
  CLICKABLE = 'clickable',
  CUSTOM = 'custom',
}

export interface WaitCondition {
  name: string;
  test: () => Promise<boolean> | boolean;
  timeout?: number;
  interval?: number;
}

export interface WaitOptions {
  timeout: number;
  interval: number;
  strategy: WaitStrategy;
  factor: number;
  maxInterval: number;
  throwOnTimeout: boolean;
  verbose: boolean;
  onWait?: (elapsed: number, attempt: number) => void;
  onSuccess?: (result: any, elapsed: number) => void;
  onTimeout?: (elapsed: number) => void;
}

export interface PollingResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  elapsedMs: number;
  lastCheckTime: number;
  conditionName?: string;
}

export interface WaitMetrics {
  totalWaits: number;
  successfulWaits: number;
  failedWaits: number;
  totalWaitTime: number;
  averageWaitTime: number;
  longestWait: number;
  shortestWait: number;
  timeoutCount: number;
  averageAttempts: number;
}

export interface StabilityConfig {
  minDuration: number;
  checkInterval: number;
  maxChecks: number;
}

// ============================================================================
// WAIT UTILITIES KLASSE
// ============================================================================

export class WaitUtil {
  private static metrics: WaitMetrics = {
    totalWaits: 0,
    successfulWaits: 0,
    failedWaits: 0,
    totalWaitTime: 0,
    averageWaitTime: 0,
    longestWait: 0,
    shortestWait: Infinity,
    timeoutCount: 0,
    averageAttempts: 0,
  };

  private static readonly defaultOptions: WaitOptions = {
    timeout: 30000,
    interval: 500,
    strategy: WaitStrategy.EXPONENTIAL,
    factor: 1.5,
    maxInterval: 5000,
    throwOnTimeout: false,
    verbose: false,
  };

  /**
   * Warte auf Bedingung mit Custom-Prädikat
   */
  static async waitFor<T>(
    condition: WaitCondition,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<T>> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let attempt = 0;
    let lastError: Error | null = null;
    let lastInterval = opts.interval;

    while (Date.now() - startTime < opts.timeout) {
      try {
        attempt++;
        opts.onWait?.(Date.now() - startTime, attempt);

        const result = await Promise.resolve(condition.test());

        if (result) {
          const elapsedMs = Date.now() - startTime;
          this.updateMetrics(true, elapsedMs, attempt);

          opts.onSuccess?.(true, elapsedMs);

          return {
            success: true,
            result: true as any,
            attempts: attempt,
            elapsedMs,
            lastCheckTime: Date.now(),
            conditionName: condition.name,
          };
        }
      } catch (error) {
        lastError = error as Error;
        if (opts.verbose) {
          console.log(`[${condition.name}] Fehler bei Versuch ${attempt}: ${lastError.message}`);
        }
      }

      // Berechne nächste Wartezeit
      lastInterval = this.calculateInterval(attempt, opts);
      await this.sleep(lastInterval);
    }

    // Timeout erreicht
    const elapsedMs = Date.now() - startTime;
    this.metrics.timeoutCount++;
    this.updateMetrics(false, elapsedMs, attempt);

    opts.onTimeout?.(elapsedMs);

    const error = new Error(`Timeout beim Warten auf: ${condition.name} (${elapsedMs}ms)`);

    if (opts.throwOnTimeout) {
      throw error;
    }

    return {
      success: false,
      error,
      attempts: attempt,
      elapsedMs,
      lastCheckTime: Date.now(),
      conditionName: condition.name,
    };
  }

  /**
   * Warte auf Element sichtbar
   */
  static async waitForElement(
    page: Page,
    selector: string,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<ElementHandle>> {
    const opts = { ...this.defaultOptions, timeout: 10000, ...options };

    return this.waitFor<ElementHandle>(
      {
        name: `Element: ${selector}`,
        test: async () => {
          try {
            const element = await page.$(selector);
            if (!element) return false;

            const isVisible = await page.evaluate((sel) => {
              const el = document.querySelector(sel);
              if (!el) return false;
              const style = window.getComputedStyle(el);
              return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            }, selector);

            return isVisible;
          } catch {
            return false;
          }
        },
      },
      opts,
    );
  }

  /**
   * Warte auf Locator sichtbar
   */
  static async waitForLocator(
    locator: Locator,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<boolean>> {
    const opts = { ...this.defaultOptions, timeout: 10000, ...options };

    return this.waitFor<boolean>(
      {
        name: `Locator: ${locator}`,
        test: async () => {
          try {
            return await locator.isVisible();
          } catch {
            return false;
          }
        },
      },
      opts,
    );
  }

  /**
   * Warte auf Navigation
   */
  static async waitForNavigation(
    page: Page,
    action: () => Promise<void>,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<boolean>> {
    const opts = { ...this.defaultOptions, timeout: 30000, ...options };

    const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle' });

    try {
      await action();
      await navigationPromise;

      return {
        success: true,
        result: true,
        attempts: 1,
        elapsedMs: 0,
        lastCheckTime: Date.now(),
        conditionName: 'Navigation',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        attempts: 1,
        elapsedMs: 0,
        lastCheckTime: Date.now(),
        conditionName: 'Navigation',
      };
    }
  }

  /**
   * Warte auf Netzwerk idle
   */
  static async waitForNetworkIdle(
    page: Page,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<boolean>> {
    const opts = { ...this.defaultOptions, timeout: 30000, ...options };
    const startTime = Date.now();

    try {
      await page.waitForLoadState('networkidle');

      return {
        success: true,
        result: true,
        attempts: 1,
        elapsedMs: Date.now() - startTime,
        lastCheckTime: Date.now(),
        conditionName: 'Network Idle',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        attempts: 1,
        elapsedMs: Date.now() - startTime,
        lastCheckTime: Date.now(),
        conditionName: 'Network Idle',
      };
    }
  }

  /**
   * Warte auf Funktion erfolgreich
   */
  static async waitForFunction<T>(
    fn: () => Promise<T>,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<T>> {
    const opts = { ...this.defaultOptions, ...options };

    return this.waitFor<T>(
      {
        name: 'Custom Funktion',
        test: fn,
      },
      opts,
    );
  }

  /**
   * Warte auf Wert änderung
   */
  static async waitForValueChange<T>(
    getter: () => Promise<T>,
    initialValue: T,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<T>> {
    const opts = { ...this.defaultOptions, ...options };

    return this.waitFor<T>(
      {
        name: 'Wert-Änderung',
        test: async () => {
          const currentValue = await getter();
          return currentValue !== initialValue;
        },
      },
      opts,
    );
  }

  /**
   * Warte auf Element entfernt
   */
  static async waitForElementRemoved(
    page: Page,
    selector: string,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<boolean>> {
    const opts = { ...this.defaultOptions, timeout: 10000, ...options };

    return this.waitFor<boolean>(
      {
        name: `Element entfernt: ${selector}`,
        test: async () => {
          const element = await page.$(selector);
          return element === null;
        },
      },
      opts,
    );
  }

  /**
   * Warte auf Text in Element
   */
  static async waitForText(
    page: Page,
    selector: string,
    text: string,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<boolean>> {
    const opts = { ...this.defaultOptions, timeout: 10000, ...options };

    return this.waitFor<boolean>(
      {
        name: `Text in ${selector}: "${text}"`,
        test: async () => {
          try {
            const content = await page.textContent(selector);
            return content?.includes(text) || false;
          } catch {
            return false;
          }
        },
      },
      opts,
    );
  }

  /**
   * Warte auf URL
   */
  static async waitForUrl(
    page: Page,
    urlPattern: string | RegExp,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<boolean>> {
    const opts = { ...this.defaultOptions, timeout: 10000, ...options };

    return this.waitFor<boolean>(
      {
        name: `URL: ${urlPattern}`,
        test: () => {
          const currentUrl = page.url();
          if (typeof urlPattern === 'string') {
            return currentUrl.includes(urlPattern);
          }
          return urlPattern.test(currentUrl);
        },
      },
      opts,
    );
  }

  /**
   * Warte auf Stabilität (Wert ändert sich nicht)
   */
  static async waitForStability<T>(
    getter: () => Promise<T>,
    config: Partial<StabilityConfig> = {},
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<T>> {
    const stabilityConfig = {
      minDuration: 500,
      checkInterval: 100,
      maxChecks: 10,
      ...config,
    };

    const opts = { ...this.defaultOptions, timeout: 30000, ...options };
    const startTime = Date.now();
    let lastValue: T | undefined;
    let stableCount = 0;

    return this.waitFor<T>(
      {
        name: 'Wert-Stabilität',
        test: async () => {
          const currentValue = await getter();

          if (lastValue === currentValue) {
            stableCount++;
          } else {
            stableCount = 0;
            lastValue = currentValue;
          }

          return stableCount >= stabilityConfig.maxChecks;
        },
      },
      opts,
    );
  }

  /**
   * Warte auf Bedingung mit Retry
   */
  static async waitWithRetry<T>(
    condition: WaitCondition,
    maxAttempts: number = 3,
    options: Partial<WaitOptions> = {},
  ): Promise<PollingResult<T>> {
    const opts = { ...this.defaultOptions, ...options };

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.waitFor<T>(condition, opts);

      if (result.success) {
        return result;
      }

      if (attempt < maxAttempts) {
        await this.sleep(opts.interval * attempt);
      }
    }

    return {
      success: false,
      error: new Error(`Fehler nach ${maxAttempts} Versuchen`),
      attempts: maxAttempts,
      elapsedMs: 0,
      lastCheckTime: Date.now(),
      conditionName: condition.name,
    };
  }

  /**
   * Schlaf/Verzögerung
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Berechne Wartezeitintervall basierend auf Strategie
   */
  private static calculateInterval(attempt: number, options: WaitOptions): number {
    let interval = options.interval;

    switch (options.strategy) {
      case WaitStrategy.FIXED:
        interval = options.interval;
        break;

      case WaitStrategy.LINEAR:
        interval = options.interval + attempt * options.factor;
        break;

      case WaitStrategy.EXPONENTIAL:
        interval = options.interval * Math.pow(options.factor, attempt - 1);
        break;

      case WaitStrategy.FIBONACCI:
        interval = this.fibonacciValue(attempt) * options.interval;
        break;

      case WaitStrategy.AGGRESSIVE:
        interval = Math.min(options.interval / attempt, options.maxInterval);
        break;

      default:
        interval = options.interval;
    }

    return Math.min(interval, options.maxInterval);
  }

  /**
   * Fibonacci-Wert berechnen
   */
  private static fibonacciValue(n: number): number {
    if (n <= 1) return 1;
    let a = 1,
      b = 1;
    for (let i = 2; i < n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  /**
   * Update Metriken
   */
  private static updateMetrics(success: boolean, elapsedMs: number, attempts: number): void {
    this.metrics.totalWaits++;

    if (success) {
      this.metrics.successfulWaits++;
    } else {
      this.metrics.failedWaits++;
    }

    this.metrics.totalWaitTime += elapsedMs;
    this.metrics.averageWaitTime = this.metrics.totalWaitTime / this.metrics.totalWaits;
    this.metrics.longestWait = Math.max(this.metrics.longestWait, elapsedMs);
    this.metrics.shortestWait = Math.min(this.metrics.shortestWait, elapsedMs);
    this.metrics.averageAttempts = (this.metrics.averageAttempts + attempts) / 2;
  }

  /**
   * Hole Metriken
   */
  static getMetrics(): WaitMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset Metriken
   */
  static resetMetrics(): void {
    this.metrics = {
      totalWaits: 0,
      successfulWaits: 0,
      failedWaits: 0,
      totalWaitTime: 0,
      averageWaitTime: 0,
      longestWait: 0,
      shortestWait: Infinity,
      timeoutCount: 0,
      averageAttempts: 0,
    };
  }

  /**
   * Drucke Metriken-Report
   */
  static printMetrics(): void {
    const metrics = this.getMetrics();

    console.log('\n' + '='.repeat(70));
    console.log('WAIT METRIKEN REPORT');
    console.log('='.repeat(70));
    console.log(`Total Waits: ${metrics.totalWaits}`);
    console.log(`Erfolgreich: ${metrics.successfulWaits}`);
    console.log(`Fehlgeschlagen: ${metrics.failedWaits}`);
    console.log(`Timeouts: ${metrics.timeoutCount}`);
    console.log(`Erfolgsrate: ${((metrics.successfulWaits / metrics.totalWaits) * 100).toFixed(2)}%`);
    console.log(`Durchschnittliche Wartezeit: ${metrics.averageWaitTime.toFixed(2)}ms`);
    console.log(`Längste Wartezeit: ${metrics.longestWait}ms`);
    console.log(`Kürzeste Wartezeit: ${metrics.shortestWait === Infinity ? 'N/A' : metrics.shortestWait + 'ms'}`);
    console.log(`Durchschnittliche Versuche: ${metrics.averageAttempts.toFixed(2)}`);
    console.log('='.repeat(70) + '\n');
  }
}

// ============================================================================
// STANDARD-EXPORT
// ============================================================================

export default WaitUtil;
