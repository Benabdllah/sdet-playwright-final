// src/tests/support/hooks.ts
import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import {
  chromium,
  firefox,
  webkit,
  Browser,
  BrowserContext,
} from "@playwright/test";
import { CustomWorld } from "./world";
import { CONFIG } from "./env";
import { promises as fs } from "fs";
import * as path from "path";

// 🎯 Type-safe Status Definition inkl. UNKNOWN
type StatusValue = (typeof Status)[keyof typeof Status] | "UNKNOWN";

const STATUS_LABELS: Record<StatusValue, string> = {
  UNKNOWN: "UNKNOWN",
  PASSED: "PASSED",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
  PENDING: "PENDING",
  UNDEFINED: "UNDEFINED",
  AMBIGUOUS: "AMBIGUOUS",
};

let browser: Browser;
let globalContext: BrowserContext | null = null;

// Set default timeout from config
setDefaultTimeout(CONFIG.timeouts?.default ?? 60000);

/**
 * 🚀 BEFORE ALL HOOK - Global Setup
 */
BeforeAll(async function () {
  console.log("\n🔧 ========================================");
  console.log("🔧 GLOBAL TEST SETUP STARTED");
  console.log("🔧 ========================================\n");

  // Create output directories
  const dirs = [
    "artifacts/screenshots",
    "artifacts/videos",
    "artifacts/traces",
    "artifacts/downloads",
    "artifacts/har",
    "test-results/cucumber",
    "test-results/allure",
    "test-results/junit",
    "test-results/coverage",
    "test-results/performance",
    "test-results/accessibility",
    "test-results/visual",
    "test-results/security",
    "test-results/api",
    "test-results/logs",
    "test-results/metrics",
    "test-results/summary",
  ];
  for (const dir of dirs) {
    const dirPath = path.resolve(process.cwd(), dir);
    await fs.mkdir(dirPath, { recursive: true }).catch(() => {});
    console.log(`📁 Ensured directory exists: ${dir}`);
  }

  // Launch browser
  try {
    const launchOptions = { ...CONFIG.launchOptions, timeout: 30000 };
    switch (CONFIG.browser.toLowerCase()) {
      case "chromium":
        browser = await chromium.launch(launchOptions);
        break;
      case "firefox":
        browser = await firefox.launch(launchOptions);
        break;
      case "webkit":
        browser = await webkit.launch(launchOptions);
        break;
      default:
        browser = await chromium.launch(launchOptions);
    }

    console.log(`🚀 Browser launched: ${CONFIG.browser.toUpperCase()}`);
    console.log(
      `   Headless: ${CONFIG.launchOptions?.headless ? "Yes" : "No"}`
    );
    console.log(`   SlowMo: ${CONFIG.launchOptions?.slowMo ?? 0}ms`);

    // Global context for video/tracing
    if (CONFIG.features.video || CONFIG.features.trace) {
      globalContext = await browser.newContext({
        viewport: CONFIG.viewport,
        recordVideo: CONFIG.features.video
          ? {
              dir: path.resolve(
                process.cwd(),
                "test-results/playwright/videos"
              ),
            }
          : undefined,
        ignoreHTTPSErrors: true,
        locale: CONFIG.locale ?? "en-US",
        timezoneId: CONFIG.timezone ?? "Europe/Berlin",
      });
      console.log("🎥 Global context created with recording enabled");
    }
  } catch (error) {
    console.error("❌ Failed to launch browser:", error);
    throw error;
  }
});

/**
 * 🎬 BEFORE HOOK - Scenario Setup
 */
Before(async function (this: CustomWorld, { pickle, gherkinDocument }) {
  const scenarioName = pickle.name;
  const featureName = gherkinDocument.feature?.name ?? "Unknown";
  const tags = pickle.tags.map((t) => t.name).join(", ");

  console.log("\n▶️  ========================================");
  console.log(`▶️  SCENARIO: ${scenarioName}`);
  console.log(`   Feature: ${featureName}`);
  if (tags) console.log(`   Tags: ${tags}`);
  console.log("▶️  ========================================\n");

  this.scenarioName = scenarioName;
  this.featureName = featureName;
  this.startTime = Date.now();

  // Init Page
  try {
    await this.initPage(browser);
    console.log("✅ Page initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize page:", error);
    throw error;
  }

  // Start tracing if enabled
  if (CONFIG.features.trace && this.context) {
    await this.context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
    console.log("🔍 Tracing started");
  }

  // Performance monitoring start
  if (CONFIG.features.metrics && this.page) {
    await this.page.evaluate(() => {
      (window as any).testStartTime = performance.now();
    });
  }
});

/**
 * 📸 AFTER HOOK - Scenario Teardown
 */
After(async function (this: CustomWorld, { result, pickle }) {
  const duration = Date.now() - (this.startTime ?? Date.now());
  const status: StatusValue = (result?.status as StatusValue) ?? "UNKNOWN";
  const scenarioName = pickle.name;

  console.log("\n🏁 ========================================");
  console.log(`🏁 SCENARIO COMPLETED: ${scenarioName}`);
  console.log(`   Status: ${getStatusEmoji(status)} ${STATUS_LABELS[status]}`);
  console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log("🏁 ========================================\n");

  // Capture artifacts on failure
  if (status === "FAILED" && this.page) {
    console.log("📸 Capturing failure artifacts...");
    try {
      const screenshotPath = path.join(
        "screenshots",
        `${sanitizeFilename(scenarioName)}_${Date.now()}.png`
      );
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      const screenshot = await fs.readFile(screenshotPath);
      await this.attach(screenshot, "image/png");
      console.log(`   ✅ Screenshot saved: ${screenshotPath}`);

      const html = await this.page.content();
      await this.attach(html, "text/html");
      console.log("   ✅ HTML snapshot attached");

      if (this.logs?.length) {
        const logsText = this.logs.join("\n");
        await this.attach(logsText, "text/plain");
        console.log(
          `   ✅ Console logs attached (${this.logs.length} entries)`
        );
      }

      if (result?.message) {
        await this.attach(`Error: ${result.message}`, "text/plain");
        console.log("   ✅ Error details attached");
      }
    } catch (error) {
      console.error("❌ Failed to capture artifacts:", error);
    }
  }

  // Stop tracing
  if (CONFIG.features.trace && this.context) {
    try {
      const tracePath = path.join(
        "traces",
        `${sanitizeFilename(scenarioName)}_${Date.now()}.zip`
      );
      await this.context.tracing.stop({ path: tracePath });
      console.log(`🔍 Trace saved: ${tracePath}`);
    } catch (error) {
      console.error("❌ Failed to save trace:", error);
    }
  }

  // Metrics
  if (CONFIG.features.metrics && this.page) {
    try {
      const metrics = await this.page.evaluate(() => {
        const perf = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded:
            perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          responseTime: perf.responseEnd - perf.requestStart,
          domInteractive: perf.domInteractive - perf.fetchStart,
        };
      });

      const metricsPath = path.join(
        "metrics",
        `${sanitizeFilename(scenarioName)}_${Date.now()}.json`
      );
      await fs.writeFile(
        metricsPath,
        JSON.stringify(
          {
            scenario: scenarioName,
            status: STATUS_LABELS[status],
            duration,
            timestamp: new Date().toISOString(),
            performance: metrics,
          },
          null,
          2
        )
      );
      console.log(`📊 Metrics saved: ${metricsPath}`);
    } catch (error) {
      console.error("❌ Failed to collect metrics:", error);
    }
  }

  // Accessibility scan
  if (status === "FAILED" && CONFIG.features.accessibility && this.page) {
    try {
      console.log("♿ Running accessibility scan...");
      // TODO: axe-core integration
    } catch (error) {
      console.error("❌ Accessibility scan failed:", error);
    }
  }

  // Cleanup
  try {
    await this.close();
    console.log("✅ Page closed successfully");
  } catch (error) {
    console.error("❌ Failed to close page:", error);
  }
});

/**
 * 🛑 AFTER ALL HOOK - Global Teardown
 */
AfterAll(async function () {
  console.log("\n🔧 ========================================");
  console.log("🔧 GLOBAL TEST TEARDOWN STARTED");
  console.log("🔧 ========================================\n");

  if (globalContext) {
    try {
      await globalContext.close();
      console.log("✅ Global context closed");
    } catch (error) {
      console.error("❌ Failed to close global context:", error);
    }
  }

  if (browser) {
    try {
      await browser.close();
      console.log("✅ Browser closed");
    } catch (error) {
      console.error("❌ Failed to close browser:", error);
    }
  }

  await generateTestSummary();

  console.log("\n🏁 ALL TESTS COMPLETED");
});

/**
 * 📊 Helper: Generate test summary
 */
async function generateTestSummary(): Promise<void> {
  try {
    const summaryPath = path.join("reports", `summary_${Date.now()}.txt`);
    const summary = `
TEST EXECUTION SUMMARY
=====================
Timestamp: ${new Date().toISOString()}
Browser: ${CONFIG.browser}
Environment: ${CONFIG.env}
Headless: ${CONFIG.launchOptions?.headless ?? false}

Features Enabled:
- Video Recording: ${CONFIG.features.video}
- Tracing: ${CONFIG.features.trace}
- Metrics: ${CONFIG.features.metrics}
- Accessibility: ${CONFIG.features.accessibility}
- Visual Regression: ${CONFIG.features.visualRegression}

Artifacts Location:
- Screenshots: ./screenshots
- Videos: ./videos
- Traces: ./traces
- Metrics: ./metrics
- Reports: ./reports
    `.trim();

    await fs.writeFile(summaryPath, summary);
    console.log(`📊 Test summary saved: ${summaryPath}`);
  } catch (error) {
    console.error("❌ Failed to generate summary:", error);
  }
}

/**
 * 🎨 Helper: Get status emoji
 */
function getStatusEmoji(status: StatusValue): string {
  switch (status) {
    case Status.PASSED:
      return "✅";
    case Status.FAILED:
      return "❌";
    case Status.SKIPPED:
      return "⏭️";
    case Status.PENDING:
      return "⏸️";
    case Status.UNDEFINED:
      return "❓";
    case Status.AMBIGUOUS:
      return "⚠️";
    case "UNKNOWN":
      return "❔";
    default:
      return "❔";
  }
}

/**
 * 🔧 Helper: Sanitize filename
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 100);
}
