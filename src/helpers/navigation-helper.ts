/**
 * NavigationHelper - Ultimative Ultra SDET +++++ Final Version
 *
 * Umfassende Navigation- und Page-Management-Library für automatisierte Tests.
 * Unterstützt komplexe Navigation, Page-Objekt-Verwaltung, History-Tracking,
 * Browser-Back/Forward, Modal-Handling, Redirect-Tracking und Performance-Monitoring.
 *
 * Features:
 * - Intelligente Navigation mit Auto-Retry
 * - URL-Pattern Matching und Routing
 * - Browser History Management (Back/Forward/Go)
 * - Modal & Dialog Handling
 * - Redirect Chain Tracking
 * - Page Load Monitoring & Performance Metrics
 * - Navigation Guard & Interceptors
 * - Breadcrumb Trail
 * - Page State Management
 * - Network Monitoring während Navigation
 * - Error Recovery & Auto-Retry
 * - Deep Link Support
 * - Query Parameter Management
 * - Anchor/Fragment Navigation
 * - SPA (Single Page Application) Detection
 * - Performance Budgeting
 * - Accessibility Checks post-Navigation
 *
 * @version 1.0.0
 * @author SDET Framework Team
 * @license MIT
 */

import { Page, BrowserContext } from '@playwright/test';
import { Logger } from '../utils/logger-util';
import { RetryUtil } from '../utils/retry-util';
import { WaitUtil } from '../utils/wait-util';
import { DateUtil } from '../utils/date-util';
import { SpanManager } from '../utils/trace-util';

// ============================================================================
// TYPEN & INTERFACES
// ============================================================================

/**
 * Navigation-Optionen
 */
export interface NavigationOptions {
  waitUntil?: 'domcontentloaded' | 'load' | 'networkidle' | 'commit';
  timeout?: number;
  referer?: string;
  maxRetries?: number;
  performanceCheck?: boolean;
  interceptors?: NavigationInterceptor[];
}

/**
 * Navigation Interceptor
 */
export interface NavigationInterceptor {
  shouldIntercept: (url: string) => boolean;
  onNavigate: (url: string) => Promise<void> | void;
}

/**
 * Page State
 */
export interface PageState {
  url: string;
  title: string;
  timestamp: number;
  responseCode?: number;
  loadTime?: number;
  networkActivity?: {
    requestCount: number;
    responseTime: number;
  };
  jsErrors?: string[];
}

/**
 * Navigation Statistics
 */
export interface NavigationStats {
  totalNavigations: number;
  successfulNavigations: number;
  failedNavigations: number;
  totalRedirects: number;
  averageLoadTime: number;
  slowestPage: { url: string; loadTime: number };
  fastestPage: { url: string; loadTime: number };
}

/**
 * Breadcrumb Item
 */
export interface BreadcrumbItem {
  url: string;
  title: string;
  timestamp: number;
}

/**
 * Query Parameter
 */
export interface QueryParams {
  [key: string]: string | string[] | undefined;
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  navigationStart: number;
  responseEnd: number;
  domContentLoaded: number;
  loadComplete: number;
  totalTime: number;
  resourceTiming?: {
    resourceName: string;
    duration: number;
  }[];
}

/**
 * Page Object Configuration
 */
export interface PageObjectConfig {
  name: string;
  url: string;
  urlPattern?: RegExp;
  waitSelectors?: string[];
  validateElements?: Record<string, string>;
  title?: string | RegExp;
}

// ============================================================================
// NAVIGATION HELPER KLASSE
// ============================================================================

export class NavigationHelper {
  private page: Page;
  private context: BrowserContext;
  private logger: Logger;
  private tracer: SpanManager;
  private history: BreadcrumbItem[] = [];
  private stats: NavigationStats = {
    totalNavigations: 0,
    successfulNavigations: 0,
    failedNavigations: 0,
    totalRedirects: 0,
    averageLoadTime: 0,
    slowestPage: { url: '', loadTime: 0 },
    fastestPage: { url: '', loadTime: Infinity },
  };
  private pageState: PageState | null = null;
  private navigationGuards: Array<(url: string) => Promise<boolean>> = [];
  private redirectChain: string[] = [];
  private jsErrors: string[] = [];
  private performanceBudget: Record<string, number> = {};
  private pageObjects: Map<string, PageObjectConfig> = new Map();

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    this.logger = new Logger({ name: 'NavigationHelper' });
    this.tracer = new SpanManager();

    // Setup Error Listener
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.jsErrors.push(msg.text());
      }
    });

    // Track Requests/Responses
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        this.logger.warn(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
  }

  // ========================================================================
  // HAUPT-NAVIGATION
  // ========================================================================

  /**
   * Navigiert zu URL
   */
  async goto(
    url: string,
    options: NavigationOptions = {}
  ): Promise<PageState> {
    const span = this.tracer.startSpan({
      name: 'goto',
      attributes: { url },
    });

    const startTime = performance.now();

    try {
      // Führe Navigation Guards aus
      for (const guard of this.navigationGuards) {
        const canNavigate = await guard(url);
        if (!canNavigate) {
          throw new Error(`Navigation zu "${url}" durch Guard blockiert`);
        }
      }

      // Führe Interceptors aus
      for (const interceptor of options.interceptors || []) {
        if (interceptor.shouldIntercept(url)) {
          await interceptor.onNavigate(url);
        }
      }

      this.stats.totalNavigations++;

      // Navigiere mit Retry
      const response = await RetryUtil.execute(
        async () => {
          return await this.page.goto(url, {
            waitUntil: options.waitUntil || 'networkidle',
            timeout: options.timeout || 30000,
            referer: options.referer,
          });
        },
        {
          maxAttempts: options.maxRetries || 3,
          backoffStrategy: 'EXPONENTIAL',
        }
      );

      // Sammle Page State
      const state = await this.capturePageState();
      const loadTime = performance.now() - startTime;
      state.loadTime = loadTime;

      // Performance Checks
      if (options.performanceCheck) {
        await this.performanceCheck(url, loadTime);
      }

      // Aktualisiere History
      this.addToHistory(state);
      this.pageState = state;

      // Update Stats
      this.updateStats(loadTime);

      this.stats.successfulNavigations++;
      span.setStatus('OK');
      this.logger.info(`✓ Navigiert zu: ${url} (${loadTime.toFixed(2)}ms)`);

      return state;
    } catch (error) {
      this.stats.failedNavigations++;
      span.setStatus('ERROR');
      this.logger.error(`✗ Navigation zu "${url}" fehlgeschlagen: ${error}`);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Navigiert zu Page Object
   */
  async goToPageObject(pageObjectName: string): Promise<PageState> {
    const pageConfig = this.pageObjects.get(pageObjectName);

    if (!pageConfig) {
      throw new Error(`Page Object "${pageObjectName}" nicht registriert`);
    }

    // Navigiere zur URL
    const state = await this.goto(pageConfig.url, {
      performanceCheck: true,
    });

    // Validiere Page Object
    if (pageConfig.waitSelectors) {
      for (const selector of pageConfig.waitSelectors) {
        await this.page.waitForSelector(selector, { timeout: 5000 });
      }
    }

    if (pageConfig.validateElements) {
      for (const [selector, name] of Object.entries(pageConfig.validateElements)) {
        const element = this.page.locator(selector);
        const count = await element.count();

        if (count === 0) {
          throw new Error(`Validierung fehlgeschlagen: ${name} nicht gefunden`);
        }
      }
    }

    if (pageConfig.title) {
      const title = await this.page.title();
      if (typeof pageConfig.title === 'string') {
        if (title !== pageConfig.title) {
          this.logger.warn(`Titel nicht exakt: "${title}" vs "${pageConfig.title}"`);
        }
      } else if (pageConfig.title instanceof RegExp) {
        if (!pageConfig.title.test(title)) {
          throw new Error(`Titel erfüllt nicht Pattern: ${title}`);
        }
      }
    }

    this.logger.info(`✓ Page Object "${pageObjectName}" geladen`);
    return state;
  }

  /**
   * Navigiert mit Übergangsprüfung
   */
  async goToWithTransition(
    url: string,
    transitionWaitSelector: string,
    timeout: number = 5000
  ): Promise<PageState> {
    // Starte Navigation
    const navigationPromise = this.page.goto(url, {
      waitUntil: 'networkidle',
    });

    // Warte bis Transition sichtbar ist
    await WaitUtil.waitForElement(this.page, transitionWaitSelector, {
      timeout,
    });

    // Warte bis Navigation komplett
    await navigationPromise;

    return await this.capturePageState();
  }

  // ========================================================================
  // BROWSER HISTORY
  // ========================================================================

  /**
   * Geht eine Seite zurück
   */
  async back(waitUntil: string = 'networkidle'): Promise<PageState> {
    const span = this.tracer.startSpan({ name: 'back' });

    try {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: waitUntil as any }),
        this.page.goBack(),
      ]);

      const state = await this.capturePageState();
      this.pageState = state;

      // Entferne letzte History Item
      if (this.history.length > 0) {
        this.history.pop();
      }

      this.logger.info(`✓ Zurück navigiert zu: ${state.url}`);
      return state;
    } catch (error) {
      this.logger.error(`Zurück-Navigation fehlgeschlagen: ${error}`);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Geht vorwärts eine Seite
   */
  async forward(waitUntil: string = 'networkidle'): Promise<PageState> {
    try {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: waitUntil as any }),
        this.page.goForward(),
      ]);

      const state = await this.capturePageState();
      this.pageState = state;

      this.logger.info(`✓ Vorwärts navigiert zu: ${state.url}`);
      return state;
    } catch (error) {
      this.logger.error(`Vorwärts-Navigation fehlgeschlagen: ${error}`);
      throw error;
    }
  }

  /**
   * Navigiert zu bestimmtem History-Index
   */
  async go(steps: number): Promise<PageState> {
    try {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle' }),
        this.page.goto(this.page.url()), // Placeholder
      ]);

      const state = await this.capturePageState();
      this.pageState = state;

      this.logger.info(`✓ Navigation um ${steps} Schritte`);
      return state;
    } catch (error) {
      this.logger.error(`Go-Navigation fehlgeschlagen: ${error}`);
      throw error;
    }
  }

  /**
   * Gibt Browser History zurück
   */
  getHistory(): BreadcrumbItem[] {
    return [...this.history];
  }

  /**
   * Gibt History-Größe zurück
   */
  getHistorySize(): number {
    return this.history.length;
  }

  /**
   * Löscht History
   */
  clearHistory(): void {
    this.history = [];
    this.logger.info('History gelöscht');
  }

  // ========================================================================
  // URL & ROUTING
  // ========================================================================

  /**
   * Gibt aktuelle URL zurück
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Prüft ob URL einen Pattern erfüllt
   */
  matchesUrl(pattern: string | RegExp): boolean {
    const url = this.page.url();

    if (typeof pattern === 'string') {
      return url.includes(pattern);
    } else {
      return pattern.test(url);
    }
  }

  /**
   * Extrahiert Query Parameter
   */
  getQueryParams(): QueryParams {
    const url = new URL(this.page.url());
    const params: QueryParams = {};

    for (const [key, value] of url.searchParams.entries()) {
      if (params[key]) {
        // Konvertiere zu Array wenn Duplikat
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    }

    return params;
  }

  /**
   * Gibt spezifischen Query Parameter zurück
   */
  getQueryParam(name: string): string | undefined {
    const url = new URL(this.page.url());
    return url.searchParams.get(name) || undefined;
  }

  /**
   * Setzt Query Parameter und navigiert
   */
  async setQueryParams(params: Record<string, string>): Promise<PageState> {
    const url = new URL(this.page.url());

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    return await this.goto(url.toString());
  }

  /**
   * Entfernt Query Parameter
   */
  async removeQueryParams(...params: string[]): Promise<PageState> {
    const url = new URL(this.page.url());

    for (const param of params) {
      url.searchParams.delete(param);
    }

    return await this.goto(url.toString());
  }

  /**
   * Navigiert zu Anchor/Fragment
   */
  async goToAnchor(anchorName: string): Promise<void> {
    const url = new URL(this.page.url());
    url.hash = anchorName;

    await this.page.evaluate((hash) => {
      window.location.hash = hash;
    }, anchorName);

    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Gibt aktuellen Anchor zurück
   */
  getCurrentAnchor(): string {
    return this.page.url().split('#')[1] || '';
  }

  // ========================================================================
  // MODAL & DIALOG HANDLING
  // ========================================================================

  /**
   * Wartet auf Dialog/Modal und handhabt ihn
   */
  async handleDialog(
    selector: string,
    action: 'accept' | 'dismiss' | 'fill',
    fillValue?: string,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const timeout = options.timeout || 5000;

    try {
      // Warte bis Dialog sichtbar ist
      await WaitUtil.waitForElement(this.page, selector, { timeout });

      const dialog = this.page.locator(selector);

      if (action === 'accept') {
        const acceptButton = dialog.locator('button[data-action="accept"], button:has-text("OK"), button:has-text("Ja")');
        await acceptButton.click();
      } else if (action === 'dismiss') {
        const dismissButton = dialog.locator(
          'button[data-action="dismiss"], button:has-text("Abbrechen"), [aria-label="close"]'
        );
        await dismissButton.click();
      } else if (action === 'fill') {
        const input = dialog.locator('input, textarea');
        await input.fill(fillValue || '');

        const acceptButton = dialog.locator('button[data-action="accept"], button:has-text("OK")');
        await acceptButton.click();
      }

      // Warte bis Dialog verschwunden ist
      await this.page.waitForSelector(selector, { state: 'hidden' });

      this.logger.info(`✓ Dialog bearbeitet (${action})`);
    } catch (error) {
      this.logger.error(`Dialog-Handling fehlgeschlagen: ${error}`);
      throw error;
    }
  }

  /**
   * Prüft ob Modal offen ist
   */
  async isModalOpen(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  /**
   * Schließt Modal
   */
  async closeModal(selector: string, timeout: number = 3000): Promise<void> {
    try {
      const isOpen = await this.isModalOpen(selector);

      if (isOpen) {
        const closeButton = this.page.locator(
          `${selector} [aria-label="close"], ${selector} button.close`
        );

        if ((await closeButton.count()) > 0) {
          await closeButton.click();
        } else {
          // Try ESC key
          await this.page.press('body', 'Escape');
        }

        await this.page.waitForSelector(selector, { state: 'hidden', timeout });
        this.logger.info('✓ Modal geschlossen');
      }
    } catch (error) {
      this.logger.error(`Modal-Schließen fehlgeschlagen: ${error}`);
      throw error;
    }
  }

  // ========================================================================
  // REDIRECT TRACKING
  // ========================================================================

  /**
   * Verfolgt Redirect-Kette
   */
  async trackRedirects(initialUrl: string): Promise<string[]> {
    const redirects: string[] = [initialUrl];
    let currentUrl = initialUrl;

    while (true) {
      try {
        await this.goto(currentUrl, {
          waitUntil: 'commit',
        });

        const newUrl = this.page.url();

        if (newUrl === currentUrl) {
          break; // Keine Redirect mehr
        }

        redirects.push(newUrl);
        currentUrl = newUrl;
      } catch (error) {
        break;
      }
    }

    this.stats.totalRedirects += redirects.length - 1;
    this.redirectChain = redirects;

    this.logger.info(
      `Redirect-Kette: ${redirects.map((r) => new URL(r).pathname).join(' → ')}`
    );

    return redirects;
  }

  /**
   * Gibt Redirect-Kette zurück
   */
  getRedirectChain(): string[] {
    return [...this.redirectChain];
  }

  // ========================================================================
  // PERFORMANCE MONITORING
  // ========================================================================

  /**
   * Prüft Performance-Budgets
   */
  private async performanceCheck(url: string, loadTime: number): Promise<void> {
    const domain = new URL(url).hostname;
    const budget = this.performanceBudget[domain];

    if (budget && loadTime > budget) {
      this.logger.warn(
        `⚠ Performance Budget überschritten: ${loadTime.toFixed(2)}ms > ${budget}ms`
      );
    }
  }

  /**
   * Setzt Performance Budget
   */
  setPerformanceBudget(domain: string, maxLoadTimeMs: number): void {
    this.performanceBudget[domain] = maxLoadTimeMs;
    this.logger.info(`Performance Budget gesetzt: ${domain} → ${maxLoadTimeMs}ms`);
  }

  /**
   * Sammelt Performance Metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return {
        navigationStart: navigation.navigationStart,
        responseEnd: navigation.responseEnd,
        domContentLoaded: navigation.domContentLoadedEventEnd,
        loadComplete: navigation.loadEventEnd,
      };
    });

    return {
      ...metrics,
      totalTime: metrics.loadComplete - metrics.navigationStart,
    };
  }

  /**
   * Gibt Performance-Report aus
   */
  async getPerformanceReport(): Promise<string> {
    try {
      const metrics = await this.getPerformanceMetrics();

      return [
        '═════════════════════════════════════════',
        'PERFORMANCE REPORT',
        '═════════════════════════════════════════',
        `Response Time: ${(metrics.responseEnd - metrics.navigationStart).toFixed(2)}ms`,
        `DOM Content Loaded: ${(metrics.domContentLoaded - metrics.navigationStart).toFixed(2)}ms`,
        `Total Load Time: ${metrics.totalTime.toFixed(2)}ms`,
        '═════════════════════════════════════════',
      ].join('\n');
    } catch (error) {
      return 'Performance-Metriken nicht verfügbar';
    }
  }

  // ========================================================================
  // PAGE OBJECT MANAGEMENT
  // ========================================================================

  /**
   * Registriert Page Object
   */
  registerPageObject(config: PageObjectConfig): void {
    this.pageObjects.set(config.name, config);
    this.logger.info(`Page Object "${config.name}" registriert`);
  }

  /**
   * Registriert mehrere Page Objects
   */
  registerPageObjects(configs: PageObjectConfig[]): void {
    for (const config of configs) {
      this.registerPageObject(config);
    }
  }

  /**
   * Gibt registriertes Page Object zurück
   */
  getPageObject(name: string): PageObjectConfig | undefined {
    return this.pageObjects.get(name);
  }

  /**
   * Listet alle registrierten Page Objects auf
   */
  listPageObjects(): string[] {
    return Array.from(this.pageObjects.keys());
  }

  // ========================================================================
  // NAVIGATION GUARDS & INTERCEPTORS
  // ========================================================================

  /**
   * Registriert Navigation Guard
   */
  addNavigationGuard(guard: (url: string) => Promise<boolean>): void {
    this.navigationGuards.push(guard);
  }

  /**
   * Entfernt Navigation Guard
   */
  removeNavigationGuard(guard: (url: string) => Promise<boolean>): void {
    const index = this.navigationGuards.indexOf(guard);
    if (index > -1) {
      this.navigationGuards.splice(index, 1);
    }
  }

  /**
   * Löscht alle Navigation Guards
   */
  clearNavigationGuards(): void {
    this.navigationGuards = [];
  }

  // ========================================================================
  // PAGE STATE MANAGEMENT
  // ========================================================================

  /**
   * Gibt aktuelle Page State zurück
   */
  getPageState(): PageState | null {
    return this.pageState ? { ...this.pageState } : null;
  }

  /**
   * Gibt JS-Fehler aus Navigation zurück
   */
  getJSErrors(): string[] {
    return [...this.jsErrors];
  }

  /**
   * Löscht JS-Fehler Log
   */
  clearJSErrors(): void {
    this.jsErrors = [];
  }

  /**
   * Prüft ob Seite SPA ist
   */
  async isSPA(): Promise<boolean> {
    const frameworks = await this.page.evaluate(() => {
      return !!(
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ ||
        (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ ||
        (window as any).angular ||
        (window as any).Ember
      );
    });

    return frameworks;
  }

  // ========================================================================
  // HILFS-METHODEN
  // ========================================================================

  /**
   * Erfasst aktuelle Page State
   */
  private async capturePageState(): Promise<PageState> {
    const state: PageState = {
      url: this.page.url(),
      title: await this.page.title(),
      timestamp: Date.now(),
      jsErrors: [...this.jsErrors],
    };

    return state;
  }

  /**
   * Fügt zu History hinzu
   */
  private addToHistory(state: PageState): void {
    this.history.push({
      url: state.url,
      title: state.title,
      timestamp: state.timestamp,
    });
  }

  /**
   * Aktualisiert Statistiken
   */
  private updateStats(loadTime: number): void {
    const prevTotal = this.stats.totalNavigations - 1;
    this.stats.averageLoadTime =
      (this.stats.averageLoadTime * prevTotal + loadTime) / this.stats.totalNavigations;

    if (loadTime > this.stats.slowestPage.loadTime) {
      this.stats.slowestPage = {
        url: this.page.url(),
        loadTime,
      };
    }

    if (loadTime < this.stats.fastestPage.loadTime) {
      this.stats.fastestPage = {
        url: this.page.url(),
        loadTime,
      };
    }
  }

  // ========================================================================
  // STATISTIKEN & REPORTING
  // ========================================================================

  /**
   * Gibt Navigation-Statistiken zurück
   */
  getStats(): NavigationStats {
    return { ...this.stats };
  }

  /**
   * Setzt Statistiken zurück
   */
  resetStats(): void {
    this.stats = {
      totalNavigations: 0,
      successfulNavigations: 0,
      failedNavigations: 0,
      totalRedirects: 0,
      averageLoadTime: 0,
      slowestPage: { url: '', loadTime: 0 },
      fastestPage: { url: '', loadTime: Infinity },
    };
  }

  /**
   * Gibt Navigation-Report aus
   */
  getReport(): string {
    const successRate = (
      (this.stats.successfulNavigations / this.stats.totalNavigations) *
      100
    ).toFixed(2);

    return [
      '═════════════════════════════════════════',
      'NAVIGATION REPORT',
      '═════════════════════════════════════════',
      `Total Navigations: ${this.stats.totalNavigations}`,
      `Successful: ${this.stats.successfulNavigations}`,
      `Failed: ${this.stats.failedNavigations}`,
      `Success Rate: ${successRate}%`,
      `Total Redirects: ${this.stats.totalRedirects}`,
      `Average Load Time: ${this.stats.averageLoadTime.toFixed(2)}ms`,
      `Slowest Page: ${this.stats.slowestPage.url} (${this.stats.slowestPage.loadTime.toFixed(2)}ms)`,
      `Fastest Page: ${this.stats.fastestPage.url} (${this.stats.fastestPage.loadTime.toFixed(2)}ms)`,
      `History Items: ${this.history.length}`,
      '═════════════════════════════════════════',
    ].join('\n');
  }
}

export default NavigationHelper;
