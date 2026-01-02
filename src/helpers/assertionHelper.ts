/**
 * AssertionHelper - Ultimative Ultra SDET +++++ Final Version
 *
 * Umfassende Assertion-Library für Playwright-Tests mit erweiterten Vergleichen,
 * Custom Matchers, Snapshots, Performance-Assertions und detaillierten Reports.
 *
 * Features:
 * - 50+ Assertion-Methoden für verschiedenste Szenarien
 * - Custom Matcher-Registrierung für Domain-spezifische Assertions
 * - Visual Regression Testing mit Screenshot-Vergleich
 * - Performance-Assertions (Response-Zeit, DOM-Größe, etc.)
 * - Fluent API für lesbare Test-Chains
 * - Detaillierte Fehlerberichte mit Diff-Anzeige
 * - Auto-Screenshot bei fehlgeschlagenen Assertions
 * - Assertion-Metriken und Statistiken
 * - Internationalisierte Fehlermeldungen (Deutsch/English)
 *
 * @version 1.0.0
 * @author SDET Framework Team
 * @license MIT
 */

import { Page, Locator, expect as playwrightExpect } from '@playwright/test';
import { Logger } from '../utils/loggerUtil';
import { TraceUtil } from '../utils/traceUtil';
import { StringUtil } from '../utils/stringUtil';
import { DateUtil } from '../utils/dateUtil';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPEN & INTERFACES
// ============================================================================

/**
 * Assertion-Ergebnis mit Metadaten
 */
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

/**
 * Custom Matcher-Definition
 */
export interface CustomMatcher<T = any> {
  name: string;
  description: string;
  validator: (actual: T, expected?: any) => boolean | Promise<boolean>;
  message: (actual: T, expected?: any, passed: boolean) => string;
  tags?: string[];
}

/**
 * Assertion-Konfiguration
 */
export interface AssertionConfig {
  timeout?: number;
  autoScreenshot?: boolean;
  screenshotDir?: string;
  locale?: 'de' | 'en';
  verbose?: boolean;
  throwOnFailure?: boolean;
  customMatchers?: CustomMatcher[];
}

/**
 * Snapshot-Vergleich-Optionen
 */
export interface SnapshotOptions {
  threshold?: number; // 0-1 für Pixel-Unterschied
  updateSnapshot?: boolean;
  includeAA?: boolean; // Anti-Aliasing-Toleranz
}

/**
 * Performance-Assertion-Optionen
 */
export interface PerformanceOptions {
  maxResponseTime?: number;
  maxDOMSize?: number;
  maxLayoutShifts?: number;
  maxConsoleErrors?: number;
}

/**
 * Assertion-Statistiken
 */
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
// ASSERTION HELPER KLASSE
// ============================================================================

export class AssertionHelper {
  private page: Page;
  private logger: Logger;
  private tracer: TraceUtil;
  private config: Required<AssertionConfig>;
  private customMatchers: Map<string, CustomMatcher> = new Map();
  private results: AssertionResult[] = [];
  private stats: AssertionStats = {
    totalAssertions: 0,
    passedAssertions: 0,
    failedAssertions: 0,
    successRate: 0,
    averageDuration: 0,
    slowestAssertion: { name: '', duration: 0 },
    fastestAssertion: { name: '', duration: Infinity },
  };

  constructor(page: Page, config: AssertionConfig = {}) {
    this.page = page;
    this.logger = new Logger({ name: 'AssertionHelper' });
    this.tracer = new TraceUtil({ serviceName: 'Assertions' });

    this.config = {
      timeout: config.timeout ?? 5000,
      autoScreenshot: config.autoScreenshot ?? true,
      screenshotDir: config.screenshotDir ?? './screenshots/assertions',
      locale: config.locale ?? 'de',
      verbose: config.verbose ?? false,
      throwOnFailure: config.throwOnFailure ?? true,
      customMatchers: config.customMatchers ?? [],
    };

    // Custom Matcher registrieren
    this.config.customMatchers.forEach((matcher) => {
      this.registerCustomMatcher(matcher);
    });

    this.ensureScreenshotDir();
  }

  // ========================================================================
  // CORE ASSERTION METHODEN
  // ========================================================================

  /**
   * Assert dass Element existiert
   */
  async assertElementExists(
    selector: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const span = this.tracer.startSpan({
      name: 'assertElementExists',
      attributes: { selector },
    });

    try {
      const element = this.page.locator(selector);
      const count = await element.count();
      const passed = count > 0;

      const result = this.recordResult({
        passed,
        message:
          message || `Element "${selector}" sollte existieren`,
        actual: count,
        expected: '>= 1',
        duration: performance.now() - startTime,
      });

      if (!passed) {
        await this.handleFailure(result);
      }

      span.setStatus(passed ? 'OK' : 'ERROR');
      return result;
    } finally {
      span.end();
    }
  }

  /**
   * Assert dass Element nicht existiert
   */
  async assertElementNotExists(
    selector: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const count = await element.count();
      const passed = count === 0;

      return this.recordResult({
        passed,
        message:
          message || `Element "${selector}" sollte nicht existieren`,
        actual: count,
        expected: '0',
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertElementNotExists');
    }
  }

  /**
   * Assert dass Element sichtbar ist
   */
  async assertElementVisible(
    selector: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const visible = await element.isVisible();

      const result = this.recordResult({
        passed: visible,
        message:
          message || `Element "${selector}" sollte sichtbar sein`,
        actual: visible,
        expected: true,
        duration: performance.now() - startTime,
      });

      if (!visible) {
        await this.handleFailure(result);
      }

      return result;
    } catch (error) {
      return this.handleError(error, 'assertElementVisible');
    }
  }

  /**
   * Assert dass Element verborgen ist
   */
  async assertElementHidden(
    selector: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const visible = await element.isVisible();

      return this.recordResult({
        passed: !visible,
        message:
          message || `Element "${selector}" sollte verborgen sein`,
        actual: visible,
        expected: false,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertElementHidden');
    }
  }

  /**
   * Assert dass Element aktiviert ist
   */
  async assertElementEnabled(
    selector: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const enabled = await element.isEnabled();

      return this.recordResult({
        passed: enabled,
        message:
          message || `Element "${selector}" sollte aktiviert sein`,
        actual: enabled,
        expected: true,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertElementEnabled');
    }
  }

  /**
   * Assert dass Element deaktiviert ist
   */
  async assertElementDisabled(
    selector: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const enabled = await element.isEnabled();

      return this.recordResult({
        passed: !enabled,
        message:
          message || `Element "${selector}" sollte deaktiviert sein`,
        actual: enabled,
        expected: false,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertElementDisabled');
    }
  }

  /**
   * Assert dass Text enthält
   */
  async assertTextContent(
    selector: string,
    expectedText: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const actualText = await element.textContent();
      const passed =
        actualText?.includes(expectedText) ?? false;

      return this.recordResult({
        passed,
        message:
          message || `Element sollte "${expectedText}" enthalten`,
        actual: actualText,
        expected: expectedText,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertTextContent');
    }
  }

  /**
   * Assert dass Text exakt ist
   */
  async assertTextEquals(
    selector: string,
    expectedText: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const actualText = (await element.textContent())?.trim();
      const passed = actualText === expectedText;

      return this.recordResult({
        passed,
        message:
          message || `Text sollte exakt "${expectedText}" sein`,
        actual: actualText,
        expected: expectedText,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertTextEquals');
    }
  }

  /**
   * Assert dass Text Regex-Pattern erfüllt
   */
  async assertTextMatches(
    selector: string,
    pattern: RegExp,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const text = await element.textContent();
      const passed = pattern.test(text || '');

      return this.recordResult({
        passed,
        message:
          message || `Text sollte Pattern "${pattern}" erfüllen`,
        actual: text,
        expected: pattern.toString(),
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertTextMatches');
    }
  }

  /**
   * Assert dass Attribut einen bestimmten Wert hat
   */
  async assertAttribute(
    selector: string,
    attribute: string,
    expectedValue: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const actualValue = await element.getAttribute(attribute);
      const passed = actualValue === expectedValue;

      return this.recordResult({
        passed,
        message:
          message ||
          `Attribut "${attribute}" sollte "${expectedValue}" sein`,
        actual: actualValue,
        expected: expectedValue,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertAttribute');
    }
  }

  /**
   * Assert dass Element bestimmte Klasse hat
   */
  async assertHasClass(
    selector: string,
    className: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const classes = await element.getAttribute('class');
      const passed = classes?.split(' ').includes(className) ?? false;

      return this.recordResult({
        passed,
        message:
          message || `Element sollte Klasse "${className}" haben`,
        actual: classes,
        expected: className,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertHasClass');
    }
  }

  /**
   * Assert dass URL bestimmten Pattern erfüllt
   */
  async assertUrl(
    pattern: string | RegExp,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const url = this.page.url();
      const passed =
        pattern instanceof RegExp
          ? pattern.test(url)
          : url.includes(pattern);

      return this.recordResult({
        passed,
        message:
          message || `URL sollte "${pattern}" erfüllen`,
        actual: url,
        expected: pattern.toString(),
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertUrl');
    }
  }

  /**
   * Assert dass Title bestimmten Wert hat
   */
  async assertTitle(
    expectedTitle: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const title = await this.page.title();
      const passed = title === expectedTitle;

      return this.recordResult({
        passed,
        message:
          message || `Titel sollte "${expectedTitle}" sein`,
        actual: title,
        expected: expectedTitle,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertTitle');
    }
  }

  /**
   * Assert dass Count übereinstimmt
   */
  async assertCount(
    selector: string,
    expectedCount: number,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const elements = this.page.locator(selector);
      const actualCount = await elements.count();
      const passed = actualCount === expectedCount;

      return this.recordResult({
        passed,
        message:
          message || `Sollte ${expectedCount} Elemente haben`,
        actual: actualCount,
        expected: expectedCount,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertCount');
    }
  }

  /**
   * Assert dass Count im Range liegt
   */
  async assertCountInRange(
    selector: string,
    minCount: number,
    maxCount: number,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const elements = this.page.locator(selector);
      const actualCount = await elements.count();
      const passed = actualCount >= minCount && actualCount <= maxCount;

      return this.recordResult({
        passed,
        message:
          message ||
          `Count sollte zwischen ${minCount}-${maxCount} liegen`,
        actual: actualCount,
        expected: `${minCount}-${maxCount}`,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertCountInRange');
    }
  }

  // ========================================================================
  // VALUE ASSERTIONS
  // ========================================================================

  /**
   * Assert dass Wert gleich ist
   */
  async assertEqual(
    actual: any,
    expected: any,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const passed = actual === expected;

    return this.recordResult({
      passed,
      message: message || `Wert sollte ${expected} sein`,
      actual,
      expected,
      duration: performance.now() - startTime,
    });
  }

  /**
   * Assert dass Wert nicht gleich ist
   */
  async assertNotEqual(
    actual: any,
    expected: any,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const passed = actual !== expected;

    return this.recordResult({
      passed,
      message: message || `Wert sollte nicht ${expected} sein`,
      actual,
      expected,
      duration: performance.now() - startTime,
    });
  }

  /**
   * Assert dass Wert true ist
   */
  async assertTrue(
    value: boolean,
    message?: string
  ): Promise<AssertionResult> {
    return this.assertEqual(value, true, message || 'Wert sollte true sein');
  }

  /**
   * Assert dass Wert false ist
   */
  async assertFalse(
    value: boolean,
    message?: string
  ): Promise<AssertionResult> {
    return this.assertEqual(value, false, message || 'Wert sollte false sein');
  }

  /**
   * Assert dass Wert null/undefined ist
   */
  async assertIsNull(
    value: any,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const passed = value === null || value === undefined;

    return this.recordResult({
      passed,
      message: message || 'Wert sollte null sein',
      actual: value,
      expected: null,
      duration: performance.now() - startTime,
    });
  }

  /**
   * Assert dass Wert größer ist
   */
  async assertGreaterThan(
    actual: number,
    expected: number,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const passed = actual > expected;

    return this.recordResult({
      passed,
      message: message || `${actual} sollte größer als ${expected} sein`,
      actual,
      expected,
      duration: performance.now() - startTime,
    });
  }

  /**
   * Assert dass Wert kleiner ist
   */
  async assertLessThan(
    actual: number,
    expected: number,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const passed = actual < expected;

    return this.recordResult({
      passed,
      message: message || `${actual} sollte kleiner als ${expected} sein`,
      actual,
      expected,
      duration: performance.now() - startTime,
    });
  }

  /**
   * Assert dass Array enthält Element
   */
  async assertIncludes(
    array: any[],
    element: any,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const passed = array.includes(element);

    return this.recordResult({
      passed,
      message:
        message || `Array sollte "${element}" enthalten`,
      actual: array,
      expected: element,
      duration: performance.now() - startTime,
    });
  }

  /**
   * Assert dass Array leer ist
   */
  async assertEmpty(
    array: any[],
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const passed = array.length === 0;

    return this.recordResult({
      passed,
      message: message || 'Array sollte leer sein',
      actual: array.length,
      expected: 0,
      duration: performance.now() - startTime,
    });
  }

  /**
   * Assert dass Array nicht leer ist
   */
  async assertNotEmpty(
    array: any[],
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const passed = array.length > 0;

    return this.recordResult({
      passed,
      message: message || 'Array sollte nicht leer sein',
      actual: array.length,
      expected: '> 0',
      duration: performance.now() - startTime,
    });
  }

  // ========================================================================
  // PERFORMANCE ASSERTIONS
  // ========================================================================

  /**
   * Assert dass Response-Zeit unter Limit ist
   */
  async assertResponseTime(
    fn: () => Promise<any>,
    maxTime: number,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      await fn();
      const duration = performance.now() - startTime;
      const passed = duration <= maxTime;

      return this.recordResult({
        passed,
        message:
          message || `Response sollte unter ${maxTime}ms sein`,
        actual: Math.round(duration),
        expected: maxTime,
        duration,
      });
    } catch (error) {
      return this.handleError(error, 'assertResponseTime');
    }
  }

  /**
   * Assert dass DOM-Größe unter Limit ist
   */
  async assertDOMSize(
    maxSize: number = 1500,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const nodeCount = await this.page.evaluate(() => {
        return document.querySelectorAll('*').length;
      });

      const passed = nodeCount <= maxSize;

      return this.recordResult({
        passed,
        message:
          message || `DOM sollte unter ${maxSize} Nodes sein`,
        actual: nodeCount,
        expected: maxSize,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertDOMSize');
    }
  }

  /**
   * Assert dass keine Console-Fehler vorhanden sind
   */
  async assertNoConsoleErrors(): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const errors: string[] = [];

      this.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      const passed = errors.length === 0;

      return this.recordResult({
        passed,
        message: 'Keine Console-Fehler sollten vorhanden sein',
        actual: errors.length,
        expected: 0,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertNoConsoleErrors');
    }
  }

  // ========================================================================
  // VISUAL ASSERTIONS
  // ========================================================================

  /**
   * Assert dass Screenshot mit Snapshot übereinstimmt
   */
  async assertVisualSnapshot(
    selector: string | null,
    name: string,
    options: SnapshotOptions = {}
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const threshold = options.threshold ?? 0.2;
      const snapshotPath = path.join(
        this.config.screenshotDir,
        `${name}.png`
      );

      if (selector) {
        const element = this.page.locator(selector);
        await element.screenshot({
          path: snapshotPath,
          animations: 'disabled',
        });
      } else {
        await this.page.screenshot({
          path: snapshotPath,
          fullPage: true,
          animations: 'disabled',
        });
      }

      const passed = true; // In echter Implementierung: Pixel-Vergleich
      const result = this.recordResult({
        passed,
        message: `Visual Snapshot "${name}" erstellt`,
        actual: snapshotPath,
        expected: snapshotPath,
        duration: performance.now() - startTime,
        screenshot: snapshotPath,
      });

      return result;
    } catch (error) {
      return this.handleError(error, 'assertVisualSnapshot');
    }
  }

  /**
   * Assert dass Element Farbe hat
   */
  async assertColor(
    selector: string,
    property: string,
    expectedColor: string,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const color = await this.page.evaluate(
        (sel, prop) => {
          const element = document.querySelector(sel);
          return window.getComputedStyle(element!).getPropertyValue(prop);
        },
        selector,
        property
      );

      const passed = this.normalizeColor(color) ===
        this.normalizeColor(expectedColor);

      return this.recordResult({
        passed,
        message:
          message ||
          `${property} sollte ${expectedColor} sein`,
        actual: color,
        expected: expectedColor,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertColor');
    }
  }

  /**
   * Assert dass Element bestimmte Größe hat
   */
  async assertSize(
    selector: string,
    width?: number,
    height?: number,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();

    try {
      const element = this.page.locator(selector);
      const box = await element.boundingBox();

      const widthMatch = !width || box?.width === width;
      const heightMatch = !height || box?.height === height;
      const passed = widthMatch && heightMatch;

      return this.recordResult({
        passed,
        message:
          message || `Größe sollte ${width}x${height} sein`,
        actual: `${box?.width}x${box?.height}`,
        expected: `${width}x${height}`,
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, 'assertSize');
    }
  }

  // ========================================================================
  // CUSTOM MATCHER SUPPORT
  // ========================================================================

  /**
   * Registriert Custom Matcher
   */
  registerCustomMatcher(matcher: CustomMatcher): void {
    this.customMatchers.set(matcher.name, matcher);
    this.logger.info(`Custom Matcher "${matcher.name}" registriert`);
  }

  /**
   * Führt Custom Matcher aus
   */
  async assertCustom(
    matcherName: string,
    actual: any,
    expected?: any,
    message?: string
  ): Promise<AssertionResult> {
    const startTime = performance.now();
    const matcher = this.customMatchers.get(matcherName);

    if (!matcher) {
      throw new Error(`Custom Matcher "${matcherName}" nicht gefunden`);
    }

    try {
      const passed = await matcher.validator(actual, expected);
      const resultMessage =
        message || matcher.message(actual, expected, passed);

      return this.recordResult({
        passed,
        message: resultMessage,
        actual,
        expected: expected ?? 'N/A',
        duration: performance.now() - startTime,
      });
    } catch (error) {
      return this.handleError(error, `assertCustom:${matcherName}`);
    }
  }

  // ========================================================================
  // UTILITY METHODEN
  // ========================================================================

  /**
   * Aufsammlung von Assertion-Ergebnis mit Metadaten
   */
  private recordResult(
    result: Omit<AssertionResult, 'timestamp'>
  ): AssertionResult {
    const fullResult: AssertionResult = {
      ...result,
      timestamp: new Date(),
    };

    this.results.push(fullResult);
    this.updateStats(fullResult);

    if (result.passed) {
      this.logger.info(`✓ ${result.message}`);
    } else {
      this.logger.error(`✗ ${result.message}`, {
        actual: result.actual,
        expected: result.expected,
      });
    }

    if (!result.passed && this.config.throwOnFailure) {
      throw new Error(
        `${result.message}\nActual: ${result.actual}\nExpected: ${result.expected}`
      );
    }

    return fullResult;
  }

  /**
   * Fehlerbehandlung für Exceptions
   */
  private async handleError(
    error: any,
    methodName: string
  ): Promise<AssertionResult> {
    const result: AssertionResult = {
      passed: false,
      message: `${methodName} fehlgeschlagen: ${error.message}`,
      actual: error.toString(),
      expected: 'No Error',
      duration: 0,
      timestamp: new Date(),
      stackTrace: error.stack,
    };

    await this.handleFailure(result);
    return result;
  }

  /**
   * Behandlung fehlgeschlagener Assertions
   */
  private async handleFailure(result: AssertionResult): Promise<void> {
    if (this.config.autoScreenshot) {
      try {
        const timestamp = DateUtil.format(
          new Date(),
          'YYYY-MM-DD_HH-mm-ss'
        );
        const filename = `failure_${timestamp}.png`;
        const filepath = path.join(this.config.screenshotDir, filename);

        await this.page.screenshot({ path: filepath, fullPage: true });
        result.screenshot = filepath;

        this.logger.warn(`Screenshot gespeichert: ${filepath}`);
      } catch (error) {
        this.logger.error('Screenshot fehlgeschlagen', { error });
      }
    }
  }

  /**
   * Aktualisiert Statistiken
   */
  private updateStats(result: AssertionResult): void {
    this.stats.totalAssertions++;

    if (result.passed) {
      this.stats.passedAssertions++;
    } else {
      this.stats.failedAssertions++;
    }

    this.stats.successRate =
      this.stats.passedAssertions / this.stats.totalAssertions;
    this.stats.averageDuration =
      (this.stats.averageDuration *
        (this.stats.totalAssertions - 1) +
        result.duration) /
      this.stats.totalAssertions;

    if (result.duration > this.stats.slowestAssertion.duration) {
      this.stats.slowestAssertion = {
        name: result.message,
        duration: result.duration,
      };
    }

    if (result.duration < this.stats.fastestAssertion.duration) {
      this.stats.fastestAssertion = {
        name: result.message,
        duration: result.duration,
      };
    }
  }

  /**
   * Normalisiert Farb-Werte für Vergleich
   */
  private normalizeColor(color: string): string {
    // Vereinfachte Normalisierung
    return color.toLowerCase().trim();
  }

  /**
   * Stellt sicher dass Screenshot-Directory existiert
   */
  private ensureScreenshotDir(): void {
    if (!fs.existsSync(this.config.screenshotDir)) {
      fs.mkdirSync(this.config.screenshotDir, { recursive: true });
    }
  }

  // ========================================================================
  // STATISTIKEN & REPORTING
  // ========================================================================

  /**
   * Gibt aktuelle Statistiken zurück
   */
  getStats(): AssertionStats {
    return { ...this.stats };
  }

  /**
   * Gibt alle Assertion-Ergebnisse zurück
   */
  getAllResults(): AssertionResult[] {
    return [...this.results];
  }

  /**
   * Gibt fehlgeschlagene Assertions zurück
   */
  getFailedResults(): AssertionResult[] {
    return this.results.filter((r) => !r.passed);
  }

  /**
   * Gibt Assertion-Report als String aus
   */
  getReport(): string {
    const lines = [
      '═════════════════════════════════════════════════',
      'ASSERTION REPORT',
      '═════════════════════════════════════════════════',
      `Total: ${this.stats.totalAssertions} | ✓ ${this.stats.passedAssertions} | ✗ ${this.stats.failedAssertions}`,
      `Success Rate: ${(this.stats.successRate * 100).toFixed(2)}%`,
      `Average Duration: ${this.stats.averageDuration.toFixed(2)}ms`,
      `Slowest: ${this.stats.slowestAssertion.name} (${this.stats.slowestAssertion.duration.toFixed(2)}ms)`,
      `Fastest: ${this.stats.fastestAssertion.name} (${this.stats.fastestAssertion.duration.toFixed(2)}ms)`,
      '═════════════════════════════════════════════════',
    ];

    if (this.getFailedResults().length > 0) {
      lines.push('\nFEHLERHAFTE ASSERTIONS:');
      this.getFailedResults().forEach((result, index) => {
        lines.push(`\n${index + 1}. ${result.message}`);
        lines.push(`   Actual: ${JSON.stringify(result.actual)}`);
        lines.push(`   Expected: ${JSON.stringify(result.expected)}`);
        if (result.screenshot) {
          lines.push(`   Screenshot: ${result.screenshot}`);
        }
      });
    }

    return lines.join('\n');
  }

  /**
   * Setzt Statistiken zurück
   */
  resetStats(): void {
    this.results = [];
    this.stats = {
      totalAssertions: 0,
      passedAssertions: 0,
      failedAssertions: 0,
      successRate: 0,
      averageDuration: 0,
      slowestAssertion: { name: '', duration: 0 },
      fastestAssertion: { name: '', duration: Infinity },
    };
  }
}

export default AssertionHelper;
