// src/tests/support/world.ts
import {
  setWorldConstructor,
  World as CucumberWorld,
} from "@cucumber/cucumber";

// Type for World constructor options
type IWorldOptions = any;

// Playwright types and imports
import * as pw from "@playwright/test";
const { chromium, firefox, webkit } = pw;

type Browser = any;
type BrowserContext = any;
type Page = any;
type Locator = any;

// ✅ FIXED: Import CONFIG as default + named exports
import CONFIG from "../env.ts";
import type { EnvironmentConfig } from "../env.ts";
import {
  BROWSER,
  BASE_URL,
  API_URL,
  TIMEOUT,
  NAVIGATION_TIMEOUT,
  ACTION_TIMEOUT,
  LAUNCH_OPTIONS,
  CONTEXT_OPTIONS,
} from "../env.ts";

import { promises as fs } from "fs";
import * as path from "path";

// ================================
// TYPES & INTERFACES
// ================================
export interface TestMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  stepCount: number;
  assertions: number;
  apiCalls: number;
}

export interface TestData {
  [key: string]: any;
}

export interface CustomWorld extends CucumberWorld {
  // Configuration
  config: EnvironmentConfig;
  parameters: IWorldOptions["parameters"];

  // Playwright instances
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  /**
   * Kontext für Debug-Logging (z.B. Retry, Fallback, Failure)
   */
  debugContext?: {
    active: boolean;
    reason?: string;
    buffer: string[];
    bufferSize: number;
  };

  /**
   * Debug-Log mit Kontextpufferung
   */
  logDebug(message: string, contextReason?: string): void;

  /**
   * Kontext für Debug-Log aktivieren/deaktivieren
   */
  setDebugContextActive(active: boolean, reason?: string): void;
  apiContext?: any;

  // Scenario metadata (für hooks.ts)
  scenarioName?: string;
  featureName?: string;
  scenarioTags?: string[];
  startTime?: number;
  logs: string[];

  // Test data & state
  testData: TestData;
  sharedData: Map<string, any>;
  metrics: TestMetrics;

  // Utility methods
  //attach: ICreateAttachment;
  attach: CucumberWorld["attach"];
  //link: string;
  //link?: CucumberWorld['link'];
  log(message: string, level?: "info" | "warn" | "error" | "debug"): void;

  // Page methods
  initPage(browserInstance?: Browser): Promise<void>;
  navigateTo(url: string, options?: any): Promise<void>;
  waitForPageLoad(): Promise<void>;
  takeScreenshot(name?: string): Promise<Buffer>;
  captureTrace(): Promise<void>;

  // Element methods
  findElement(selector: string): Promise<Locator>;
  waitForElement(selector: string, timeout?: number): Promise<Locator>;

  // API methods
  initApiContext(): Promise<void>;
  apiRequest(method: string, endpoint: string, options?: any): Promise<any>;

  // Cleanup
  close(): Promise<void>;
  cleanup(): Promise<void>;
}

// ================================
// WORLD CLASS IMPLEMENTATION
// ================================
export class World implements CustomWorld {
  //link: string = ''; // Default-Wert
  link!: CucumberWorld["link"];
  config: EnvironmentConfig;
  parameters: IWorldOptions["parameters"];

  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiContext?: any;

  scenarioName?: string;
  featureName?: string;
  scenarioTags?: string[];
  startTime?: number;
  logs: string[] = [];

  debugContext: {
    active: boolean;
    reason?: string;
    buffer: string[];
    bufferSize: number;
  } = {
    active: false,
    reason: undefined,
    buffer: [],
    bufferSize: 20,
  };

  testData: TestData = {};
  sharedData: Map<string, any> = new Map();
  metrics: TestMetrics;
  attach!: CucumberWorld["attach"]; // Bei Cucumber + TS:attach NIE selbst typisieren, immer CucumberWorld['attach'] verwenden
  //attach!: ICreateAttachment;

  constructor(options: IWorldOptions) {
    this.config = CONFIG;
    this.parameters = options.parameters || {};
    this.metrics = {
      startTime: Date.now(),
      stepCount: 0,
      assertions: 0,
      apiCalls: 0,
    };

    // Attach function is provided by Cucumber via options; ensure it's available
    // and fallback to a no-op async function to avoid runtime errors.
    const maybeAttach = (options as any).attach;
    this.attach =
      typeof maybeAttach === "function"
        ? maybeAttach.bind(options)
        : async () => {};

    this.log("World instance created", "debug");
    // Initialisiere Debug-Kontext
    this.debugContext = {
      active: false,
      reason: undefined,
      buffer: [],
      bufferSize: 20,
    };
  }
  /**
   * Debug-Log mit Kontextpufferung. Wird nur ausgegeben, wenn Debug-Kontext aktiv ist.
   */
  logDebug(message: string, contextReason?: string): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] 🐞 DEBUG${
      contextReason ? ` [${contextReason}]` : ""
    }: ${message}`;
    // Immer in Buffer schreiben
    this.debugContext.buffer.push(entry);
    if (this.debugContext.buffer.length > this.debugContext.bufferSize) {
      this.debugContext.buffer.shift();
    }
    // Nur ausgeben, wenn Kontext aktiv
    if (this.debugContext.active) {
      // Flush Buffer
      for (const buffered of this.debugContext.buffer) {
        console.log(buffered);
      }
      this.debugContext.buffer = [];
    }
  }

  /**
   * Aktiviert oder deaktiviert den Debug-Kontext (z.B. bei Retry, Fallback, Failure)
   */
  setDebugContextActive(active: boolean, reason?: string): void {
    this.debugContext.active = active;
    this.debugContext.reason = reason;
    if (active) {
      // Sofort Buffer flushen
      for (const buffered of this.debugContext.buffer) {
        console.log(buffered);
      }
      this.debugContext.buffer = [];
    }
  }

  // ================================
  // LOGGING
  // ================================
  log(
    message: string,
    level: "info" | "warn" | "error" | "debug" = "info"
  ): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: "💡",
      warn: "⚠️",
      error: "❌",
      debug: "🔍",
    }[level];

    const logMessage = `[${timestamp}] ${prefix} ${message}`;

    // Console output (skip debug in non-debug mode)
    if (this.config.logLevel === "debug" || level !== "debug") {
      console.log(logMessage);
    }

    // Store in logs array
    this.logs.push(logMessage);

    // Attach to Cucumber report (skip debug)
    if (this.attach && level !== "debug") {
      try {
        this.attach(logMessage, "text/plain");
      } catch {
        // Attach darf niemals Tests fehlschlagen lassen
      }
    }
  }

  // ================================
  // BROWSER & PAGE INITIALIZATION
  // ================================
  async initPage(browserInstance?: Browser): Promise<void> {
    try {
      // Use provided browser or create new one
      if (browserInstance) {
        this.browser = browserInstance;
      } else {
        this.browser = await this.launchBrowser();
      }

      // Create context with merged options
      this.context = await this.browser.newContext({
        ...CONTEXT_OPTIONS,
        baseURL: BASE_URL,
      });

      // Set default timeouts
      this.context.setDefaultTimeout(TIMEOUT);
      this.context.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);

      // Create page
      this.page = await this.context.newPage();

      // Set page timeouts
      this.page.setDefaultTimeout(ACTION_TIMEOUT);
      this.page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);

      // Add console log listener
      this.page.on("console", (msg: any) => {
        const entry = `[${msg.type()}] ${msg.text()}`;
        this.logs.push(entry);

        if (msg.type() === "error") {
          this.log(`Console error: ${msg.text()}`, "error");
        }
      });

      // Add page error listener
      this.page.on("pageerror", (error: any) => {
        this.log(`Page error: ${error.message}`, "error");
      });

      // Log debug info
      if (this.config.logLevel === "debug") {
        this.page.on("request", (req: any) =>
          this.log(`→ ${req.method()} ${req.url()}`, "debug")
        );
        this.page.on("response", (res: any) =>
          this.log(`← ${res.status()} ${res.url()}`, "debug")
        );
      }

      this.log(`Page initialized with ${BROWSER} browser`, "info");
    } catch (error) {
      this.log(`Failed to initialize page: ${error}`, "error");
      throw error;
    }
  }

  private async launchBrowser(): Promise<Browser> {
    const browserType = BROWSER;
    const options = LAUNCH_OPTIONS;

    this.log(`Launching ${browserType} browser...`, "debug");

    try {
      let browser: Browser;

      switch (browserType) {
        case "chromium":
          browser = await chromium.launch(options);
          break;
        case "firefox":
          browser = await firefox.launch(options);
          break;
        case "webkit":
          browser = await webkit.launch(options);
          break;
        default:
          throw new Error(`Unsupported browser: ${browserType}`);
      }

      this.log(`${browserType} browser launched`, "debug");
      return browser;
    } catch (error) {
      this.log(`Failed to launch browser: ${error}`, "error");
      throw error;
    }
  }

  // ================================
  // NAVIGATION
  // ================================
  async navigateTo(url: string, options?: any): Promise<void> {
    if (!this.page) {
      throw new Error("Page not initialized. Call initPage() first.");
    }

    try {
      const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
      this.log(`Navigating to: ${fullUrl}`, "info");

      await this.page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT,
        ...options,
      });

      await this.waitForPageLoad();
      this.log(`Navigation successful: ${fullUrl}`, "info");
    } catch (error) {
      this.log(`Navigation failed: ${error}`, "error");
      throw error;
    }
  }

  async waitForPageLoad(): Promise<void> {
    if (!this.page) return;

    try {
      await this.page.waitForLoadState("networkidle", { timeout: TIMEOUT });
      this.log("Page loaded", "debug");
    } catch (error) {
      this.log("Page load timeout - continuing anyway", "warn");
    }
  }

  // ================================
  // ELEMENT INTERACTIONS
  // ================================
  async findElement(selector: string): Promise<Locator> {
    if (!this.page) {
      throw new Error("Page not initialized");
    }

    this.log(`Finding element: ${selector}`, "debug");
    return this.page.locator(selector);
  }

  async waitForElement(
    selector: string,
    timeout: number = TIMEOUT
  ): Promise<Locator> {
    if (!this.page) {
      throw new Error("Page not initialized");
    }

    this.log(`Waiting for element: ${selector}`, "debug");
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: "visible", timeout });
    return locator;
  }

  // ================================
  // SCREENSHOTS & TRACES
  // ================================
  async takeScreenshot(name?: string): Promise<Buffer> {
    if (!this.page) {
      throw new Error("Page not initialized");
    }

    try {
      const timestamp = Date.now();
      const fileName = name || `screenshot-${timestamp}`;
      const screenshotPath = path.join(
        "artifacts/screenshots",
        `${fileName}.png`
      );

      // Ensure directory exists
      await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

      const screenshot = await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
        timeout: 5000,
      });

      this.log(`Screenshot saved: ${screenshotPath}`, "info");
      return screenshot;
    } catch (error) {
      this.log(`Failed to take screenshot: ${error}`, "error");
      throw error;
    }
  }

  async captureTrace(): Promise<void> {
    if (!this.context) {
      this.log("Context not available for trace capture", "warn");
      return;
    }

    try {
      const tracePath = path.join(
        "artifacts/traces",
        `trace-${Date.now()}.zip`
      );

      await fs.mkdir(path.dirname(tracePath), { recursive: true });
      await this.context.tracing.stop({ path: tracePath });

      this.log(`Trace saved: ${tracePath}`, "info");
    } catch (error) {
      this.log(`Failed to capture trace: ${error}`, "warn");
    }
  }

  // ================================
  // API CONTEXT
  // ================================
  async initApiContext(): Promise<void> {
    if (!this.browser) {
      throw new Error("Browser not initialized");
    }

    try {
      const ctx = await this.browser.newContext();
      this.apiContext = ctx.request;
      this.log("API context initialized", "info");
    } catch (error) {
      this.log(`Failed to initialize API context: ${error}`, "error");
      throw error;
    }
  }

  async apiRequest(
    method: string,
    endpoint: string,
    options: any = {}
  ): Promise<any> {
    if (!this.apiContext) {
      await this.initApiContext();
    }

    try {
      this.metrics.apiCalls++;
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${API_URL}${endpoint}`;

      this.log(`API ${method.toUpperCase()} ${url}`, "debug");

      const response = await this.apiContext![method.toLowerCase() as "get"](
        url,
        {
          timeout: TIMEOUT,
          ...options,
        }
      );

      this.log(`API Response: ${response.status()}`, "debug");

      return {
        status: response.status(),
        headers: response.headers(),
        body: await response.json().catch(() => response.text()),
      };
    } catch (error) {
      this.log(`API request failed: ${error}`, "error");
      throw error;
    }
  }

  // ================================
  // CLEANUP
  // ================================
  async close(): Promise<void> {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
        this.log("Page closed", "debug");
      }

      if (this.context) {
        await this.context.close();
        this.log("Context closed", "debug");
      }
    } catch (error) {
      this.log(`Error during close: ${error}`, "warn");
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Calculate metrics
      this.metrics.endTime = Date.now();
      this.metrics.duration = this.metrics.endTime - this.metrics.startTime;

      // Log metrics if enabled
      if (this.config.features.metrics) {
        this.log(
          `Test metrics: ${JSON.stringify(this.metrics, null, 2)}`,
          "info"
        );
      }

      // Log console output if there were errors
      const errorLogs = this.logs.filter((log) => log.includes("❌"));

      if (errorLogs.length > 0 && this.attach) {
        try {
          this.attach(`Console Logs:\n${this.logs.join("\n")}`, "text/plain");
        } catch (err) {
          console.warn("Attach failed, skipping:", err);
          // Attach darf das Testlauf nicht brechen
        }
      }

      // Close all resources
      await this.close();

      // Clear shared data
      this.sharedData.clear();
      this.testData = {};
      this.logs = [];

      this.log("Cleanup completed", "debug");
    } catch (error) {
      this.log(`Error during cleanup: ${error}`, "warn");
    }
  }
}

// ================================
// REGISTER WORLD CONSTRUCTOR
// ================================
setWorldConstructor(World);

export default World;
