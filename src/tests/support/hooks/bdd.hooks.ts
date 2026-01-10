import { printEnvironmentTableOnce } from '../cucumberGlobalSetup';
BeforeAll(async () => {
  await printEnvironmentTableOnce();
});
import { printEnvironmentTableOnce } from '../cucumberGlobalSetup';
BeforeAll(async () => {
  await printEnvironmentTableOnce();
});
import { printEnvironmentTableOnce } from '../cucumberGlobalSetup';
BeforeAll(async () => {
  await printEnvironmentTableOnce();
});
import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import * as pw from "@playwright/test";
import { World } from "../world/world.ts";
import { CONFIG } from "../env.ts";
import { promises as fs } from "fs";
import { printEnvironmentTableOnce } from "../cucumberGlobalSetup.ts";
import * as path from "path";
import { logger } from "../../../utils/logger-util.ts";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 TYPE DEFINITIONS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

type Browser = pw.Browser;
type BrowserContext = pw.BrowserContext;
type Page = pw.Page;
type StatusValue = (typeof Status)[keyof typeof Status] | "UNKNOWN";

const STATUS_CONFIG = {
  UNKNOWN: { emoji: "❔", label: "UNKNOWN", priority: 0 },
  PASSED: { emoji: "✅", label: "PASSED", priority: 1 },
  FAILED: { emoji: "❌", label: "FAILED", priority: 5 },
  SKIPPED: { emoji: "⏭️", label: "SKIPPED", priority: 2 },
  PENDING: { emoji: "⏸️", label: "PENDING", priority: 3 },
  UNDEFINED: { emoji: "❓", label: "UNDEFINED", priority: 4 },
  AMBIGUOUS: { emoji: "⚠️", label: "AMBIGUOUS", priority: 4 },
} as const;

const ARTIFACT_DIRS = [
  "artifacts/screenshots/failed",
  "artifacts/screenshots/passed",
  "artifacts/screenshots/comparison",
  "artifacts/videos/failed",
  "artifacts/videos/passed",
  "artifacts/traces/failed",
  "artifacts/traces/passed",
  "artifacts/downloads",
  "artifacts/har",
  "test-results/cucumber",
  "test-results/junit",
  "test-results/coverage",
  "test-results/performance",
  "test-results/accessibility",
  "test-results/visual",
  "test-results/security",
  "test-results/api",
  "test-results/metrics",
  "test-results/summary",
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// 🌐 GLOBAL STATE MANAGEMENT (Thread-Safe)
// ═══════════════════════════════════════════════════════════════════════════

class BrowserManager {
  private static instance: Browser | null = null;
  private static initPromise: Promise<Browser> | null = null;
  private static contextCount = 0;
  private static readonly MAX_CONTEXTS = 10; // Prevent memory leaks

  static async getBrowser(): Promise<Browser> {
    if (this.instance) return this.instance;
    if (this.initPromise) return this.initPromise;
  // beforeAll-Hook für Environment-Tabelle entfernt
    this.initPromise = this.initialize();
    this.initPromise = null;
    return this.instance;
  }

  private static async initialize(): Promise<Browser> {
    const browserType = CONFIG.browser?.toLowerCase() || "chromium";
    const launchOptions = {
      ...CONFIG.launchOptions,
      timeout: 30000,
      args: [
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        ...(CONFIG.launchOptions?.args || []),
      ],
    };

    const browserLib = pw[browserType as keyof typeof pw] as pw.BrowserType;
    if (!browserLib) throw new Error(`Unsupported browser: ${browserType}`);

    const browser = await browserLib.launch(launchOptions);
    logger.info(`🌐 Browser launched: ${browserType.toUpperCase()}`, {
      headless: CONFIG.launchOptions?.headless,
      slowMo: CONFIG.launchOptions?.slowMo,
    });

    return browser;
  }

  static incrementContext(): void {
    this.contextCount++;
    if (this.contextCount > this.MAX_CONTEXTS) {
      logger.warn(`⚠️ High context count: ${this.contextCount}`);
    }
  }

  static decrementContext(): void {
    this.contextCount = Math.max(0, this.contextCount - 1);
  }

  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.close();
      this.instance = null;
      logger.info("🌐 Browser closed");
    }
  }
}

class FeatureLogManager {
  private static state = new Map<
    string,
    { initialized: boolean; timestamp: string }
  >();

  static initializeForFeature(
    featureName: string,
    tags: string[]
  ): { isNew: boolean; timestamp: string } {
    const existing = this.state.get(featureName);
    if (existing) {
      return { isNew: false, timestamp: existing.timestamp };
    }

    const timestamp = this.generateTimestamp();
    const tagsPart = tags.length > 0 ? tags.join("_") : "notags";
    logger.initializeFileStream([featureName, tagsPart, timestamp]);

    this.state.set(featureName, { initialized: true, timestamp });
    return { isNew: true, timestamp };
  }

  private static generateTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
      now.getSeconds()
    )}`;
  }

  static clear(): void {
    this.state.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛠️ UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

class FileUtils {
  static sanitizeFilename(name: string, maxLength = 100): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .substring(0, maxLength);
  }

  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(path.resolve(dirPath), { recursive: true });
    } catch (err) {
      logger.error(`Failed to create directory: ${dirPath}`, err as Error);
      throw err;
    }
  }

  static async safeDelete(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // Ignore if file doesn't exist
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        logger.debug(`Failed to delete: ${filePath}`); // Debug bei Failure behalten

// Environment-Tabelle einmalig vor allen Tests ausgeben

// Environment-Tabelle im globalen Setup ausgeben
BeforeAll({ timeout: 60000 }, async () => {
  await printEnvironmentTableOnce();
  logger.info("🔧 GLOBAL TEST SETUP STARTED");

  try {
    // Parallel directory creation
    await Promise.all(ARTIFACT_DIRS.map((dir) => FileUtils.ensureDir(dir)));
    logger.info(`📁 Created ${ARTIFACT_DIRS.length} directories`);

    // Initialize browser with retry
    let retries = 3;
    while (retries > 0) {
      try {
        await BrowserManager.getBrowser();
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        logger.warn(`Browser launch failed, retrying... (${retries} left)`);
      }
    }
  } catch (err) {
    logger.error("Global setup failed:", err);
    throw err;
  }
});
      }
    }
  }

  static async safeRead(filePath: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(filePath);
    } catch (err) {
      logger.error(`Failed to read file: ${filePath}`, err as Error);
      return null;
    }
  }
}

class ArtifactCollector {
  private world: World;
  private scenarioName: string;
  private status: StatusValue;

  constructor(world: World, scenarioName: string, status: StatusValue) {
    this.world = world;
    this.scenarioName = scenarioName;
    this.status = status;
  }

  private get statusFolder(): string {
    return this.status === "FAILED" ? "failed" : "passed";
  }

  async collectScreenshot(): Promise<void> {
    if (!this.shouldCaptureScreenshot()) return;

    try {
      const dir = path.join("artifacts/screenshots", this.statusFolder);
      await FileUtils.ensureDir(dir);

      const filename = `${FileUtils.sanitizeFilename(
        this.scenarioName
      )}_${Date.now()}.png`;
      const fullPath = path.join(dir, filename);

      await this.world.page?.screenshot({ path: fullPath, fullPage: true });
      const buffer = await FileUtils.safeRead(fullPath);
      if (buffer) await this.world.attach(buffer, "image/png");

      logger.info(`📸 Screenshot saved: ${fullPath}`);
    } catch (err) {
      logger.error("Failed to capture screenshot", err as Error);
    }
  }

  async collectHtmlSnapshot(): Promise<void> {
    if (this.status !== "FAILED" || !this.world.page) return;

    try {
      const html = await this.world.page.content();
      await this.world.attach(html, "text/html");
      logger.info("📄 HTML snapshot attached");
    } catch (err) {
      logger.error("Failed to capture HTML snapshot", err as Error);
    }
  }

  async collectConsoleLogs(): Promise<void> {
    if (this.status !== "FAILED" || !this.world.logs?.length) return;

    try {
      await this.world.attach(this.world.logs.join("\n"), "text/plain");
      logger.info(`📋 Console logs attached (${this.world.logs.length})`);
    } catch (err) {
      logger.error("Failed to attach console logs", err as Error);
    }
  }

  async collectVisualRegression(): Promise<void> {
    if (
      !CONFIG.features.visualRegression ||
      !this.world.page ||
      !this.world.scenarioTags?.includes("@visual")
    ) {
      return;
    }

    try {
      const dir = "artifacts/screenshots/comparison";
      await FileUtils.ensureDir(dir);

      const filename = `${FileUtils.sanitizeFilename(
        this.scenarioName
      )}_${Date.now()}.png`;
      const fullPath = path.join(dir, filename);

      await this.world.page.screenshot({ path: fullPath, fullPage: true });
      logger.info(`🔍 Visual regression screenshot: ${fullPath}`);
    } catch (err) {
      logger.error("Failed to capture visual regression", err as Error);
    }
  }

  async collectTrace(): Promise<void> {
    if (!CONFIG.features.trace || !this.world.context) return;

    const shouldSave =
      this.status === "FAILED" ||
      (this.status === "PASSED" && CONFIG.features?.capturePassedTraces);

    try {
      if (shouldSave) {
        const dir = path.join("artifacts/traces", this.statusFolder);
        await FileUtils.ensureDir(dir);

        const filename = `${FileUtils.sanitizeFilename(
          this.scenarioName
        )}_${Date.now()}.zip`;
        const fullPath = path.join(dir, filename);

        await this.world.context.tracing.stop({ path: fullPath });
        logger.info(`🔍 Trace saved: ${fullPath}`);
      } else {
        await this.world.context.tracing.stop();
        // logger.debug("Trace discarded (not configured)"); // Debug nur bei Failure/Retry/Fallback erlaubt
      }
    } catch (err) {
      logger.error("Failed to save trace", err as Error);
    }
  }

  async collectVideo(): Promise<void> {
    if (!CONFIG.features.video || !this.world.page) return;

    try {
      const video = this.world.page.video();
      if (!video) return;

      const originalPath = await video.path().catch(() => null);

      // Must close page first to finalize video
      await this.world.page.close();
      this.world.page = undefined;

      const shouldSave =
        this.status === "FAILED" ||
        (this.status === "PASSED" && CONFIG.features?.capturePassedVideos);

      if (shouldSave) {
        const dir = path.join("artifacts/videos", this.statusFolder);
        await FileUtils.ensureDir(dir);

        const filename = `${FileUtils.sanitizeFilename(
          this.scenarioName
        )}_${Date.now()}.webm`;
        const fullPath = path.join(dir, filename);

        await video.saveAs(fullPath);
        logger.info(`🎥 Video saved: ${fullPath}`);

        if (originalPath) await FileUtils.safeDelete(originalPath);
      } else {
        if (originalPath) await FileUtils.safeDelete(originalPath);
        // logger.debug("Video discarded"); // Debug nur bei Failure/Retry/Fallback erlaubt
      }
    } catch (err) {
      logger.error("Failed to save video", err as Error);
    }
  }

  async collectMetrics(): Promise<void> {
    if (
      !CONFIG.features.metrics ||
      !this.world.page ||
      this.world.page.isClosed?.()
    ) {
      return;
    }

    try {
      const metrics = await this.world.page.evaluate(() => {
        const perf = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        return {
          navigation: {
            domContentLoaded:
              perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
            loadComplete: perf.loadEventEnd - perf.loadEventStart,
            responseTime: perf.responseEnd - perf.requestStart,
            domInteractive: perf.domInteractive - perf.fetchStart,
          },
          paint: {
            firstPaint: paint.find((p) => p.name === "first-paint")?.startTime,
            firstContentfulPaint: paint.find(
              (p) => p.name === "first-contentful-paint"
            )?.startTime,
          },
          memory:
            (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
        };
      });

      const dir = "test-results/metrics";
      await FileUtils.ensureDir(dir);

      const filename = `${FileUtils.sanitizeFilename(
        this.scenarioName
      )}_${Date.now()}.json`;
      const fullPath = path.join(dir, filename);

      await fs.writeFile(
        fullPath,
        JSON.stringify(
          {
            scenario: this.scenarioName,
            status: STATUS_CONFIG[this.status]?.label,
            timestamp: new Date().toISOString(),
            metrics,
          },
          null,
          2
        )
      );

      logger.info(`📊 Metrics saved: ${fullPath}`, metrics);
    } catch (err) {
      logger.error("Failed to collect metrics", err as Error);
    }
  }

  private shouldCaptureScreenshot(): boolean {
    return !!(
      this.world.page &&
      (this.status === "FAILED" ||
        (this.status === "PASSED" && CONFIG.features?.capturePassedScreenshots))
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎬 CUCUMBER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

setDefaultTimeout(CONFIG.timeouts?.default ?? 60000);

/**
 * 🚀 BEFORE ALL - Global Setup with Error Recovery
 */
BeforeAll({ timeout: 60000 }, async () => {
  await printEnvironmentTableOnce();
  logger.info("🔧 GLOBAL TEST SETUP STARTED");

  try {
    // Parallel directory creation
    await Promise.all(ARTIFACT_DIRS.map((dir) => FileUtils.ensureDir(dir)));
    logger.info(`📁 Created ${ARTIFACT_DIRS.length} directories`);

    // Initialize browser with retry
    let retries = 3;
    while (retries > 0) {
      try {
        await BrowserManager.getBrowser();
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        logger.warn(`Browser launch failed, retrying... (${retries} left)`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    logger.info("✅ Global setup completed successfully");
  } catch (err) {
    logger.error("❌ CRITICAL: Global setup failed", err as Error);
    throw err;
  }
});

/**
 * 🎬 BEFORE - Scenario Setup with Comprehensive Error Handling
 */
Before(
  { timeout: 30000 },
  async function (
    this: World,
    { pickle, gherkinDocument }: { pickle: any; gherkinDocument: any }
  ) {
    // Initialize scenario metadata
    this.scenarioName = pickle.name;
    this.featureName = gherkinDocument.feature?.name ?? "Unknown";
    this.scenarioTags = Array.isArray(pickle.tags)
      ? pickle.tags.map((t: { name?: string }) => t.name ?? "")
      : [];
    this.startTime = Date.now();

    // Initialize logging
    const featureName =
      this.featureName ||
      gherkinDocument.uri?.match(/([^/\\]+)\.feature$/)?.[1] ||
      "unknown";
    FeatureLogManager.initializeForFeature(
      featureName,
      this.scenarioTags ?? []
    );

    logger.info(`▶️ SCENARIO START: ${this.scenarioName}`, {
      feature: this.featureName,
      tags: Array.isArray(this.scenarioTags)
        ? this.scenarioTags.join(", ")
        : "none",
    });

    try {
      const browser = await BrowserManager.getBrowser();
      BrowserManager.incrementContext();

      // Context options with video recording
      const contextOptions = {
        ...CONFIG.CONTEXT_OPTIONS,
        recordVideo: CONFIG.features.video
          ? {
              dir: path.resolve("artifacts/videos"),
              size: { width: 1920, height: 1080 },
            }
          : undefined,
        recordHar: CONFIG.features.recordHar
          ? {
              path: path.resolve(
                "artifacts/har",
                `${FileUtils.sanitizeFilename(
                  this.scenarioName ?? "scenario"
                )}.har`
              ),
            }
          : undefined,
      };

      // Create context with timeout
      this.context = await Promise.race([
        browser.newContext(contextOptions),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Context creation timeout")), 15000)
        ),
      ]);

      // Create page
      this.page = await this.context.newPage();

      // Setup console logging
      this.logs = [];
      this.page.on("console", (msg) => {
        const text = `[${msg.type()}] ${msg.text()}`;
        this.logs?.push(text);
        if (msg.type() === "error") logger.error(text);
      });

      // Start tracing
      if (CONFIG.features.trace) {
        await this.context.tracing.start({
          screenshots: true,
          snapshots: true,
          sources: true,
        });
        logger.info("🔍 Tracing started");
      }

      // Performance monitoring
      if (CONFIG.features.metrics) {
        await this.page.evaluate(() => {
          (window as any).testStartTime = performance.now();
        });
      }

      logger.info("✅ Scenario ready");
    } catch (err) {
      logger.error("❌ Scenario setup failed", err as Error);
      BrowserManager.decrementContext();
      throw err;
    }
  }
);

/**
 * 📸 AFTER - Scenario Teardown with Robust Cleanup
 */
After(
  { timeout: 60000 },
  async function (
    this: World,
    { result, pickle }: { result?: any; pickle?: any }
  ) {
    const duration = Date.now() - (this.startTime ?? Date.now());
    const status: StatusValue = (result?.status as StatusValue) ?? "UNKNOWN";
    const statusInfo = STATUS_CONFIG[status];

    logger.info(
      `🏁 SCENARIO COMPLETED: ${pickle.name} | ${statusInfo.emoji} ${
        statusInfo.label
      } | ${(duration / 1000).toFixed(2)}s`
    );

    if (status === "FAILED") {
      logger.error(`❌ Failure details`, {
        error: result?.message,
        tags: this.scenarioTags,
      });
    }

    try {
      const collector = new ArtifactCollector(this, pickle.name, status);

      // Collect artifacts in parallel where safe
      await Promise.allSettled([
        collector.collectScreenshot(),
        collector.collectHtmlSnapshot(),
        collector.collectConsoleLogs(),
        collector.collectVisualRegression(),
        collector.collectMetrics(),
      ]);

      // Sequential: trace and video (require specific ordering)
      await collector.collectTrace();
      await collector.collectVideo();
    } catch (err) {
      logger.error("❌ Artifact collection failed", err as Error);
    } finally {
      // Guaranteed cleanup
      await this.cleanup();
    }
  }
);

/**
 * 🛑 AFTER ALL - Global Teardown with Summary
 */
AfterAll({ timeout: 30000 }, async () => {
  logger.info("🔧 GLOBAL TEARDOWN STARTED");

  try {
    await BrowserManager.close();
    await generateTestSummary();
    FeatureLogManager.clear();
    logger.info("🏁 ALL TESTS COMPLETED");
  } catch (err) {
    logger.error("❌ Teardown failed", err as Error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 📊 TEST SUMMARY GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateTestSummary(): Promise<void> {
  try {
    const dir = "test-results/summary";
    await FileUtils.ensureDir(dir);

    const summaryPath = path.join(dir, `summary_${Date.now()}.json`);
    const summary = {
      timestamp: new Date().toISOString(),
      environment: {
        browser: CONFIG.browser,
        env: CONFIG.env,
        headless: CONFIG.launchOptions?.headless ?? false,
      },
      features: {
        video: CONFIG.features.video,
        trace: CONFIG.features.trace,
        metrics: CONFIG.features.metrics,
        accessibility: CONFIG.features.accessibility,
        visualRegression: CONFIG.features.visualRegression,
      },
      artifacts: {
        screenshots: "artifacts/screenshots",
        videos: "artifacts/videos",
        traces: "artifacts/traces",
        metrics: "test-results/metrics",
      },
    };

    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    logger.info(`📊 Test summary: ${summaryPath}`);
  } catch (err) {
    logger.error("Failed to generate summary", err as Error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧹 WORLD CLEANUP EXTENSION
// ═══════════════════════════════════════════════════════════════════════════

World.prototype.cleanup = async function (this: World): Promise<void> {
  try {
    if (this.page && !this.page.isClosed?.()) {
      await this.page.close().catch(() => {});
    }
    if (this.context) {
      await this.context.close().catch(() => {});
    }
    BrowserManager.decrementContext();
    // logger.debug("🧹 Resources cleaned"); // Debug nur bei Failure/Retry/Fallback erlaubt
  } catch (err) {
    logger.error("Cleanup error", err as Error);
  }
};
