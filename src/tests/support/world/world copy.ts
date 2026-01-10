// src/tests/support/world/world.ts
import {
  setWorldConstructor,
  World as CucumberWorld,
  IWorldOptions,
} from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page, Locator } from "@playwright/test";
import { CONFIG } from "../env";
import type { EnvironmentConfig } from "../env";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { logger } from "../../../utils/logger-util";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface TestMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  stepCount: number;
  assertions: number;
  apiCalls: number;
  failedApiCalls?: number;
  navigationCount?: number;
  screenshotCount?: number;
  performance?: {
    avgResponseTime?: number;
    maxResponseTime?: number;
    totalPageLoadTime?: number;
  };
}

export interface TestData {
  [key: string]: any;
}

export interface PageState {
  url?: string;
  title?: string;
  loadState?: string;
  timestamp?: number;
}

export interface ApiResponse {
  status: number;
  statusText?: string;
  headers: Record<string, string>;
  body: any;
  timing?: {
    start: number;
    end: number;
    duration: number;
  };
}

export interface ElementOptions {
  timeout?: number;
  state?: "attached" | "detached" | "visible" | "hidden";
  strict?: boolean;
}

export interface NavigationOptions {
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  timeout?: number;
  referer?: string;
}

export interface ScreenshotOptions {
  path?: string;
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
  type?: "png" | "jpeg";
  quality?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌐 CUSTOM WORLD INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface CustomWorld extends CucumberWorld {
  // ═══ Configuration ═══
  config: EnvironmentConfig;
  parameters: Record<string, any>;

  // ═══ Playwright Instances (managed by hooks) ═══
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiContext?: any;

  // ═══ Scenario Metadata ═══
  scenarioName?: string;
  featureName?: string;
  scenarioTags?: string[];
  startTime?: number;
  logs: string[];

  // ═══ State Management ═══
  testData: TestData;
  sharedData: Map<string, any>;
  metrics: TestMetrics;
  pageState: PageState;
  retryCount: number;

  // ═══ Cucumber Methods ═══
  attach: CucumberWorld["attach"];
  log: CucumberWorld["log"];

  // ═══ Logging ═══
  logInfo(message: string, meta?: any): void;
  logWarn(message: string, meta?: any): void;
  logError(message: string, error?: any): void;
  logDebug(message: string, meta?: any): void;

  // ═══ Navigation ═══
  navigateTo(url: string, options?: NavigationOptions): Promise<void>;
  reload(options?: NavigationOptions): Promise<void>;
  goBack(options?: NavigationOptions): Promise<void>;
  goForward(options?: NavigationOptions): Promise<void>;
  waitForPageLoad(state?: "load" | "domcontentloaded" | "networkidle"): Promise<void>;
  getCurrentUrl(): Promise<string>;
  getPageTitle(): Promise<string>;

  // ═══ Element Interaction ═══
  findElement(selector: string, options?: ElementOptions): Promise<Locator>;
  findElements(selector: string): Promise<Locator[]>;
  waitForElement(selector: string, options?: ElementOptions): Promise<Locator>;
  waitForElementHidden(selector: string, timeout?: number): Promise<void>;
  isElementVisible(selector: string): Promise<boolean>;
  isElementEnabled(selector: string): Promise<boolean>;
  getElementText(selector: string): Promise<string>;
  getElementAttribute(selector: string, attribute: string): Promise<string | null>;

  // ═══ Actions ═══
  click(selector: string, options?: { force?: boolean; timeout?: number }): Promise<void>;
  doubleClick(selector: string): Promise<void>;
  rightClick(selector: string): Promise<void>;
  hover(selector: string): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  type(selector: string, value: string, delay?: number): Promise<void>;
  clear(selector: string): Promise<void>;
  selectOption(selector: string, value: string | string[]): Promise<void>;
  check(selector: string): Promise<void>;
  uncheck(selector: string): Promise<void>;
  uploadFile(selector: string, filePath: string | string[]): Promise<void>;

  // ═══ Waits ═══
  wait(milliseconds: number): Promise<void>;
  waitForTimeout(milliseconds: number): Promise<void>;
  waitForSelector(selector: string, options?: ElementOptions): Promise<void>;
  waitForResponse(urlPattern: string | RegExp, timeout?: number): Promise<any>;
  waitForRequest(urlPattern: string | RegExp, timeout?: number): Promise<any>;

  // ═══ Screenshots & Artifacts ═══
  takeScreenshot(name?: string, options?: ScreenshotOptions): Promise<Buffer>;
  takeElementScreenshot(selector: string, name?: string): Promise<Buffer>;
  capturePageState(): Promise<PageState>;
  attachScreenshot(screenshot: Buffer, name?: string): Promise<void>;
  attachText(content: string, mediaType?: string): Promise<void>;
  attachJson(data: any, name?: string): Promise<void>;

  // ═══ API Testing ═══
  initApiContext(): Promise<void>;
  apiGet(endpoint: string, options?: any): Promise<ApiResponse>;
  apiPost(endpoint: string, data?: any, options?: any): Promise<ApiResponse>;
  apiPut(endpoint: string, data?: any, options?: any): Promise<ApiResponse>;
  apiPatch(endpoint: string, data?: any, options?: any): Promise<ApiResponse>;
  apiDelete(endpoint: string, options?: any): Promise<ApiResponse>;
  apiRequest(method: string, endpoint: string, options?: any): Promise<ApiResponse>;

  // ═══ State Management ═══
  setState(key: string, value: any): void;
  getState(key: string): any;
  hasState(key: string): boolean;
  clearState(key?: string): void;
  setSharedData(key: string, value: any): void;
  getSharedData(key: string): any;
  hasSharedData(key: string): boolean;

  // ═══ Utilities ═══
  executeScript<T = any>(script: string | Function, ...args: any[]): Promise<T>;
  waitForFunction(fn: Function, options?: { timeout?: number; polling?: number }): Promise<void>;
  addInitScript(script: Function | string): Promise<void>;
  mockRoute(url: string | RegExp, handler: Function): Promise<void>;
  setViewportSize(width: number, height: number): Promise<void>;
  emulateDevice(device: string): Promise<void>;

  // ═══ Cleanup ═══
  cleanup(): Promise<void>;
  close(): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🏗️ WORLD CLASS IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export class World implements CustomWorld {
  // ═══ Cucumber Properties ═══
  attach!: CucumberWorld["attach"];
  log!: CucumberWorld["log"];

  // ═══ Configuration ═══
  config: EnvironmentConfig;
  parameters: Record<string, any>;

  // ═══ Playwright Instances ═══
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiContext?: any;

  // ═══ Scenario Metadata ═══
  scenarioName?: string;
  featureName?: string;
  scenarioTags?: string[];
  startTime?: number;
  logs: string[] = [];

  // ═══ State Management ═══
  testData: TestData = {};
  sharedData: Map<string, any> = new Map();
  metrics: TestMetrics;
  pageState: PageState = {};
  retryCount: number = 0;

  // ═══ Event Listeners Registry (for cleanup) ═══
  private eventListeners: Map<string, Function[]> = new Map();

  // ═══════════════════════════════════════════════════════════════════════
  // 🎬 CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════════════════

  constructor(options: IWorldOptions) {
    this.config = CONFIG;
    this.parameters = options.parameters || {};
    this.metrics = {
      startTime: Date.now(),
      stepCount: 0,
      assertions: 0,
      apiCalls: 0,
      failedApiCalls: 0,
      navigationCount: 0,
      screenshotCount: 0,
      performance: {
        avgResponseTime: 0,
        maxResponseTime: 0,
        totalPageLoadTime: 0,
      },
    };

    // Bind Cucumber's attach function
    const maybeAttach = (options as any).attach;
    this.attach =
      typeof maybeAttach === "function"
        ? maybeAttach.bind(options)
        : async () => {};

    // Bind Cucumber's log function
    const maybeLog = (options as any).log;
    this.log = typeof maybeLog === "function" ? maybeLog.bind(options) : () => {};

    this.logDebug("World instance created");
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 📝 LOGGING METHODS
  // ═══════════════════════════════════════════════════════════════════════

  logInfo(message: string, meta?: any): void {
    this._log("info", message, meta);
  }

  logWarn(message: string, meta?: any): void {
    this._log("warn", message, meta);
  }

  logError(message: string, error?: any): void {
    this._log("error", message, error);
  }

  logDebug(message: string, meta?: any): void {
    if (this.config.logLevel === "debug") {
      this._log("debug", message, meta);
    }
  }

  private _log(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const emoji = { info: "💡", warn: "⚠️", error: "❌", debug: "🔍" }[level] || "📝";
    const logMessage = `[${timestamp}] ${emoji} ${message}`;

    // Console output
    console.log(logMessage, meta || "");

    // Store in logs array
    this.logs.push(logMessage);

    // Use logger utility if available
    if (logger) {
      const logMethod = logger[level as keyof typeof logger] as Function;
      if (typeof logMethod === "function") {
        logMethod.call(logger, message, meta);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🌐 NAVIGATION METHODS
  // ═══════════════════════════════════════════════════════════════════════

  async navigateTo(url: string, options: NavigationOptions = {}): Promise<void> {
    this._ensurePage();

    try {
      const fullUrl = url.startsWith("http") ? url : `${this.config.baseUrl}${url}`;
      this.logInfo(`Navigating to: ${fullUrl}`);

      const startTime = Date.now();
      await this.page!.goto(fullUrl, {
        waitUntil: options.waitUntil || "domcontentloaded",
        timeout: options.timeout || this.config.timeouts.navigation,
        ...options,
      });

      const duration = Date.now() - startTime;
      this.metrics.navigationCount = (this.metrics.navigationCount || 0) + 1;
      this.metrics.performance!.totalPageLoadTime =
        (this.metrics.performance!.totalPageLoadTime || 0) + duration;

      await this.waitForPageLoad();
      await this.capturePageState();

      this.logInfo(`Navigation completed in ${duration}ms`);
    } catch (error) {
      this.logError("Navigation failed", error);
      throw error;
    }
  }

  async reload(options: NavigationOptions = {}): Promise<void> {
    this._ensurePage();
    this.logInfo("Reloading page");
    await this.page!.reload(options as any);
    await this.waitForPageLoad();
  }

  async goBack(options: NavigationOptions = {}): Promise<void> {
    this._ensurePage();
    this.logInfo("Navigating back");
    await this.page!.goBack(options as any);
    await this.waitForPageLoad();
  }

  async goForward(options: NavigationOptions = {}): Promise<void> {
    this._ensurePage();
    this.logInfo("Navigating forward");
    await this.page!.goForward(options as any);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(state: "load" | "domcontentloaded" | "networkidle" = "networkidle"): Promise<void> {
    this._ensurePage();
    try {
      await this.page!.waitForLoadState(state, {
        timeout: this.config.timeouts.default,
      });
      this.logDebug(`Page load state reached: ${state}`);
    } catch (error) {
      this.logWarn(`Page load timeout (${state}) - continuing`, error);
    }
  }

  async getCurrentUrl(): Promise<string> {
    this._ensurePage();
    return this.page!.url();
  }

  async getPageTitle(): Promise<string> {
    this._ensurePage();
    return await this.page!.title();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🎯 ELEMENT INTERACTION METHODS
  // ═══════════════════════════════════════════════════════════════════════

  async findElement(selector: string, options: ElementOptions = {}): Promise<Locator> {
    this._ensurePage();
    this.logDebug(`Finding element: ${selector}`);
    const locator = this.page!.locator(selector);

    if (options.state) {
      await locator.waitFor({
        state: options.state,
        timeout: options.timeout || this.config.timeouts.default,
      });
    }

    return locator;
  }

  async findElements(selector: string): Promise<Locator[]> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    const count = await locator.count();
    return Array.from({ length: count }, (_, i) => locator.nth(i));
  }

  async waitForElement(selector: string, options: ElementOptions = {}): Promise<Locator> {
    this._ensurePage();
    this.logDebug(`Waiting for element: ${selector}`);

    const locator = this.page!.locator(selector);
    await locator.waitFor({
      state: options.state || "visible",
      timeout: options.timeout || this.config.timeouts.default,
    });

    return locator;
  }

  async waitForElementHidden(selector: string, timeout?: number): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.waitFor({
      state: "hidden",
      timeout: timeout || this.config.timeouts.default,
    });
  }

  async isElementVisible(selector: string): Promise<boolean> {
    this._ensurePage();
    try {
      const locator = this.page!.locator(selector);
      return await locator.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  async isElementEnabled(selector: string): Promise<boolean> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    return await locator.isEnabled();
  }

  async getElementText(selector: string): Promise<string> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    return await locator.textContent() || "";
  }

  async getElementAttribute(selector: string, attribute: string): Promise<string | null> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    return await locator.getAttribute(attribute);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🎬 ACTION METHODS
  // ═══════════════════════════════════════════════════════════════════════

  async click(selector: string, options: { force?: boolean; timeout?: number } = {}): Promise<void> {
    this._ensurePage();
    this.logDebug(`Clicking: ${selector}`);
    const locator = this.page!.locator(selector);
    await locator.click({
      timeout: options.timeout || this.config.timeouts.action,
      force: options.force,
    });
  }

  async doubleClick(selector: string): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.dblclick();
  }

  async rightClick(selector: string): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.click({ button: "right" });
  }

  async hover(selector: string): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.hover();
  }

  async fill(selector: string, value: string): Promise<void> {
    this._ensurePage();
    this.logDebug(`Filling ${selector} with: ${value}`);
    const locator = this.page!.locator(selector);
    await locator.fill(value);
  }

  async type(selector: string, value: string, delay: number = 50): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.pressSequentially(value, { delay });
  }

  async clear(selector: string): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.clear();
  }

  async selectOption(selector: string, value: string | string[]): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.selectOption(value);
  }

  async check(selector: string): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.check();
  }

  async uncheck(selector: string): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.uncheck();
  }

  async uploadFile(selector: string, filePath: string | string[]): Promise<void> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    await locator.setInputFiles(filePath);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ⏱️ WAIT METHODS
  // ═══════════════════════════════════════════════════════════════════════

  async wait(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async waitForTimeout(milliseconds: number): Promise<void> {
    this._ensurePage();
    await this.page!.waitForTimeout(milliseconds);
  }

  async waitForSelector(selector: string, options: ElementOptions = {}): Promise<void> {
    await this.waitForElement(selector, options);
  }

  async waitForResponse(urlPattern: string | RegExp, timeout: number = this.config.timeouts.default): Promise<any> {
    this._ensurePage();
    return await this.page!.waitForResponse(urlPattern, { timeout });
  }

  async waitForRequest(urlPattern: string | RegExp, timeout: number = this.config.timeouts.default): Promise<any> {
    this._ensurePage();
    return await this.page!.waitForRequest(urlPattern, { timeout });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 📸 SCREENSHOTS & ARTIFACTS
  // ═══════════════════════════════════════════════════════════════════════

  async takeScreenshot(name?: string, options: ScreenshotOptions = {}): Promise<Buffer> {
    this._ensurePage();

    try {
      const timestamp = Date.now();
      const fileName = name || `screenshot-${timestamp}`;
      const screenshotPath = options.path || path.join(
        "artifacts/screenshots",
        `${fileName}.png`
      );

      await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

      const screenshot = await this.page!.screenshot({
        path: screenshotPath,
        fullPage: options.fullPage !== false,
        type: options.type || "png",
        quality: options.quality,
        clip: options.clip,
        timeout: 5000,
      });

      this.metrics.screenshotCount = (this.metrics.screenshotCount || 0) + 1;
      this.logInfo(`Screenshot saved: ${screenshotPath}`);

      return screenshot;
    } catch (error) {
      this.logError("Failed to take screenshot", error);
      throw error;
    }
  }

  async takeElementScreenshot(selector: string, name?: string): Promise<Buffer> {
    this._ensurePage();
    const locator = this.page!.locator(selector);
    const screenshot = await locator.screenshot();

    if (name) {
      const screenshotPath = path.join("artifacts/screenshots", `${name}.png`);
      await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
      await fs.writeFile(screenshotPath, screenshot);
      this.logInfo(`Element screenshot saved: ${screenshotPath}`);
    }

    return screenshot;
  }

  async capturePageState(): Promise<PageState> {
    this._ensurePage();

    try {
      this.pageState = {
        url: await this.getCurrentUrl(),
        title: await this.getPageTitle(),
        timestamp: Date.now(),
      };

      this.logDebug("Page state captured", this.pageState);
      return this.pageState;
    } catch (error) {
      this.logWarn("Failed to capture page state", error);
      return {};
    }
  }

  async attachScreenshot(screenshot: Buffer, name?: string): Promise<void> {
    try {
      await this.attach(screenshot, {
        mediaType: "image/png",
        fileName: name || `screenshot-${Date.now()}.png`,
      } as any);
    } catch (error) {
      this.logWarn("Failed to attach screenshot", error);
    }
  }

  async attachText(content: string, mediaType: string = "text/plain"): Promise<void> {
    try {
      await this.attach(content, mediaType);
    } catch (error) {
      this.logWarn("Failed to attach text", error);
    }
  }

  async attachJson(data: any, name?: string): Promise<void> {
    try {
      await this.attach(JSON.stringify(data, null, 2), {
        mediaType: "application/json",
        fileName: name || `data-${Date.now()}.json`,
      } as any);
    } catch (error) {
      this.logWarn("Failed to attach JSON", error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🌐 API TESTING METHODS
  // ═══════════════════════════════════════════════════════════════════════

  async initApiContext(): Promise<void> {
    if (this.apiContext) return;

    if (!this.context) {
      throw new Error("Browser context not initialized");
    }

    try {
      this.apiContext = this.context.request;
      this.logInfo("API context initialized");
    } catch (error) {
      this.logError("Failed to initialize API context", error);
      throw error;
    }
  }

  async apiGet(endpoint: string, options?: any): Promise<ApiResponse> {
    return this.apiRequest("GET", endpoint, options);
  }

  async apiPost(endpoint: string, data?: any, options?: any): Promise<ApiResponse> {
    return this.apiRequest("POST", endpoint, { data, ...options });
  }

  async apiPut(endpoint: string, data?: any, options?: any): Promise<ApiResponse> {
    return this.apiRequest("PUT", endpoint, { data, ...options });
  }

  async apiPatch(endpoint: string, data?: any, options?: any): Promise<ApiResponse> {
    return this.apiRequest("PATCH", endpoint, { data, ...options });
  }

  async apiDelete(endpoint: string, options?: any): Promise<ApiResponse> {
    return this.apiRequest("DELETE", endpoint, options);
  }

  async apiRequest(method: string, endpoint: string, options: any = {}): Promise<ApiResponse> {
    if (!this.apiContext) {
      await this.initApiContext();
    }

    try {
      this.metrics.apiCalls++;
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${this.config.apiUrl}${endpoint}`;

      this.logDebug(`API ${method} ${url}`);

      const startTime = Date.now();
      const response = await this.apiContext[method.toLowerCase()](url, {
        timeout: this.config.timeouts.default,
        ...options,
      });
      const duration = Date.now() - startTime;

      // Update performance metrics
      const perfMetrics = this.metrics.performance!;
      perfMetrics.maxResponseTime = Math.max(
        perfMetrics.maxResponseTime || 0,
        duration
      );
      const totalCalls = this.metrics.apiCalls;
      perfMetrics.avgResponseTime =
        ((perfMetrics.avgResponseTime || 0) * (totalCalls - 1) + duration) /
        totalCalls;

      this.logDebug(`API Response: ${response.status()} (${duration}ms)`);

      const apiResponse: ApiResponse = {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        body: await response.json().catch(() => response.text()),
        timing: {
          start: startTime,
          end: Date.now(),
          duration,
        },
      };

      if (response.status() >= 400) {
        this.metrics.failedApiCalls = (this.metrics.failedApiCalls || 0) + 1;
        this.logWarn(`API request failed with status ${response.status()}`);
      }

      return apiResponse;
    } catch (error) {
      this.metrics.failedApiCalls = (this.metrics.failedApiCalls || 0) + 1;
      this.logError("API request failed", error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 💾 STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════

  setState(key: string, value: any): void {
    this.testData[key] = value;
    this.logDebug(`State set: ${key}`);
  }

  getState(key: string): any {
    return this.testData[key];
  }

  hasState(key: string): boolean {
    return key in this.testData;
  }

  clearState(key?: string): void {
    if (key) {
      delete this.testData[key];
      this.logDebug(`State cleared: ${key}`);
    } else {
      this.testData = {};
      this.logDebug("All state cleared");
    }
  }

  setSharedData(key: string, value: any): void {
    this.sharedData.set(key, value);
    this.logDebug(`Shared data set: ${key}`);
  }

  getSharedData(key: string): any {
    return this.sharedData.get(key);
  }

  hasSharedData(key: string): boolean {
    return this.sharedData.has(key);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🛠️ UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════

  async executeScript<T = any>(script: string | Function, ...args: any[]): Promise<T> {
    this._ensurePage();
    return await this.page!.evaluate(script as any, ...args);
  }

  async waitForFunction(fn: Function, options: { timeout?: number; polling?: number } = {}): Promise<void> {
    this._ensurePage();
    await this.page!.waitForFunction(fn as any, {
      timeout: options.timeout || this.config.timeouts.default,
      polling