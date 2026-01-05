/**
 * AssertionHelper – Ultimative Ultra SDET +++++ Final Version
 *
 * High-End Assertion Framework für Playwright
 *
 * @version 1.0.0
 * @license MIT
 */

import { Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '../utils/logger-util';
import { SpanManager } from '../utils/trace-util';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AssertionResult {
  passed: boolean;
  message: string;
  actual: any;
  expected: any;
  duration: number;
  timestamp: Date;
  stackTrace?: string;
  screenshot?: string;
}

export interface CustomMatcher<T = any> {
  name: string;
  description: string;
  validator: (actual: T, expected?: any) => boolean | Promise<boolean>;
  message: (actual: T, expected: any, passed: boolean) => string;
  tags?: string[];
}

export interface AssertionConfig {
  timeout?: number;
  autoScreenshot?: boolean;
  screenshotDir?: string;
  locale?: 'de' | 'en';
  verbose?: boolean;
  throwOnFailure?: boolean;
  customMatchers?: CustomMatcher[];
}

export interface SnapshotOptions {
  threshold?: number;
  updateSnapshot?: boolean;
}

export interface AssertionStats {
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  successRate: number;
  averageDuration: number;
  slowestAssertion: { name: string; duration: number };
  fastestAssertion: { name: string; duration: number };
}

// ============================================================================
// ASSERTION HELPER
// ============================================================================

export class AssertionHelper {
  private readonly page: Page;
  private readonly logger = new Logger();
  private readonly tracer = new SpanManager();
  private readonly config: Required<AssertionConfig>;

  private readonly customMatchers = new Map<string, CustomMatcher>();
  private readonly results: AssertionResult[] = [];

  private readonly stats: AssertionStats = {
    totalAssertions: 0,
    passedAssertions: 0,
    failedAssertions: 0,
    successRate: 0,
    averageDuration: 0,
    slowestAssertion: { name: '', duration: 0 },
    fastestAssertion: { name: '', duration: Infinity }
  };

  constructor(page: Page, config: AssertionConfig = {}) {
    this.page = page;

    this.config = {
      timeout: config.timeout ?? 5000,
      autoScreenshot: config.autoScreenshot ?? true,
      screenshotDir: config.screenshotDir ?? './screenshots/assertions',
      locale: config.locale ?? 'de',
      verbose: config.verbose ?? false,
      throwOnFailure: config.throwOnFailure ?? true,
      customMatchers: config.customMatchers ?? []
    };

    this.config.customMatchers.forEach(m => this.registerCustomMatcher(m));
    this.ensureScreenshotDir();
  }

  // ========================================================================
  // CORE ASSERTIONS
  // ========================================================================

  async assertElementExists(selector: string, message?: string) {
    return this.run('assertElementExists', message, async () => {
      const count = await this.page.locator(selector).count();
      return { passed: count > 0, actual: count, expected: '>=1' };
    });
  }

  async assertElementVisible(selector: string, message?: string) {
    return this.run('assertElementVisible', message, async () => {
      const visible = await this.page.locator(selector).isVisible();
      return { passed: visible, actual: visible, expected: true };
    });
  }

  async assertTextEquals(selector: string, expected: string, message?: string) {
    return this.run('assertTextEquals', message, async () => {
      const text = (await this.page.locator(selector).textContent())?.trim();
      return { passed: text === expected, actual: text, expected };
    });
  }

  async assertUrl(pattern: string | RegExp, message?: string) {
    return this.run('assertUrl', message, async () => {
      const url = this.page.url();
      const passed = pattern instanceof RegExp ? pattern.test(url) : url.includes(pattern);
      return { passed, actual: url, expected: pattern.toString() };
    });
  }

  // ========================================================================
  // VALUE ASSERTIONS
  // ========================================================================

  async assertEqual(actual: any, expected: any, message?: string) {
    return this.run('assertEqual', message, async () => ({
      passed: actual === expected,
      actual,
      expected
    }));
  }

  async assertTrue(value: boolean, message?: string) {
    return this.assertEqual(value, true, message);
  }

  async assertFalse(value: boolean, message?: string) {
    return this.assertEqual(value, false, message);
  }

  // ========================================================================
  // PERFORMANCE ASSERTIONS
  // ========================================================================

  async assertResponseTime(fn: () => Promise<any>, maxMs: number, message?: string) {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;

    return this.recordResult({
      passed: duration <= maxMs,
      message: message ?? `Response ≤ ${maxMs}ms`,
      actual: Math.round(duration),
      expected: maxMs,
      duration
    });
  }

  // ========================================================================
  // VISUAL ASSERTIONS
  // ========================================================================

  async assertVisualSnapshot(selector: string | null, name: string) {
    const file = path.join(this.config.screenshotDir, `${name}.png`);
    if (selector) {
      await this.page.locator(selector).screenshot({ path: file, animations: 'disabled' });
    } else {
      await this.page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
    }

    return this.recordResult({
      passed: true,
      message: `Snapshot "${name}" erstellt`,
      actual: file,
      expected: file,
      duration: 0,
      screenshot: file
    });
  }

  // ========================================================================
  // CUSTOM MATCHERS
  // ========================================================================

  registerCustomMatcher(matcher: CustomMatcher) {
    this.customMatchers.set(matcher.name, matcher);
    this.logger.info(`Custom Matcher registriert: ${matcher.name}`);
  }

  async assertCustom(name: string, actual: any, expected?: any) {
    const matcher = this.customMatchers.get(name);
    if (!matcher) throw new Error(`Custom Matcher "${name}" nicht gefunden`);

    const passed = await matcher.validator(actual, expected);
    return this.recordResult({
      passed,
      message: matcher.message(actual, expected, passed),
      actual,
      expected,
      duration: 0
    });
  }

  // ========================================================================
  // CORE ENGINE
  // ========================================================================

  private async run(
    name: string,
    message: string | undefined,
    fn: () => Promise<{ passed: boolean; actual: any; expected: any }>
  ) {
    const start = performance.now();
    const span = this.tracer.createSpan(name);

    try {
      const r = await fn();
      return this.recordResult({
        ...r,
        message: message ?? name,
        duration: performance.now() - start
      });
    } catch (e: any) {
      return this.handleError(e, name);
    } finally {
      this.tracer.endSpan(span);
    }
  }

  private recordResult(result: Omit<AssertionResult, 'timestamp'>): AssertionResult {
    const full: AssertionResult = { ...result, timestamp: new Date() };
    this.results.push(full);
    this.updateStats(full);

    full.passed
      ? this.logger.info(`✓ ${full.message}`)
      : this.logger.error(`✗ ${full.message}`, full);

    if (!full.passed && this.config.throwOnFailure) {
      throw new Error(`${full.message}\nActual: ${full.actual}\nExpected: ${full.expected}`);
    }

    return full;
  }

  private async handleError(error: any, name: string): Promise<AssertionResult> {
    const result: AssertionResult = {
      passed: false,
      message: `${name} fehlgeschlagen`,
      actual: error?.message,
      expected: 'no error',
      duration: 0,
      timestamp: new Date(),
      stackTrace: error?.stack
    };

    if (this.config.autoScreenshot) {
      const file = path.join(this.config.screenshotDir, `failure_${Date.now()}.png`);
      await this.page.screenshot({ path: file, fullPage: true });
      result.screenshot = file;
    }

    return this.recordResult(result);
  }

  private updateStats(r: AssertionResult) {
    this.stats.totalAssertions++;
    r.passed ? this.stats.passedAssertions++ : this.stats.failedAssertions++;
    this.stats.successRate = this.stats.passedAssertions / this.stats.totalAssertions;
    this.stats.averageDuration =
      (this.stats.averageDuration * (this.stats.totalAssertions - 1) + r.duration) /
      this.stats.totalAssertions;
  }

  private ensureScreenshotDir() {
    if (!fs.existsSync(this.config.screenshotDir)) {
      fs.mkdirSync(this.config.screenshotDir, { recursive: true });
    }
  }

  // ========================================================================
  // REPORTING
  // ========================================================================

  getStats() {
    return { ...this.stats };
  }

  getAllResults() {
    return [...this.results];
  }

  getReport(): string {
    return [
      '══════════════════════════════════',
      'ASSERTION REPORT',
      '══════════════════════════════════',
      `Total: ${this.stats.totalAssertions}`,
      `Passed: ${this.stats.passedAssertions}`,
      `Failed: ${this.stats.failedAssertions}`,
      `Success: ${(this.stats.successRate * 100).toFixed(2)}%`,
      '══════════════════════════════════'
    ].join('\n');
  }
}

export default AssertionHelper;
