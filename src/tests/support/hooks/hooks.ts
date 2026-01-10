// Zentrale .env-Initialisierung (muss als erstes stehen!)
import "../../../config/env-init.ts";
import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import * as pw from "@playwright/test";
const { chromium, firefox, webkit } = pw;

type Browser = any;
type BrowserContext = any;
type Page = any;

import { World } from "../world/world.ts";
import { CONFIG } from "../env.ts";
import { promises as fs } from "fs";
import * as path from "path";

// Type-safe Status inkl. UNKNOWN
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

// Default Timeout
setDefaultTimeout(CONFIG.timeouts?.default ?? 60000);

let browser: Browser;

/**
 * 🚀 BEFORE ALL - Global Setup
 */
BeforeAll(async () => {
  console.log("\n🔧 ========================================");
  console.log("🔧 GLOBAL TEST SETUP STARTED");
  console.log("🔧 ========================================\n");

  // Ensure directories
  const dirs = [
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
    "test-results/logs",
    "test-results/metrics",
    "test-results/summary",
  ];
  console.log(`📁 Creating ${dirs.length} output directories...`);
  for (const dir of dirs) {
    await fs.mkdir(path.resolve(dir), { recursive: true });
    console.log(`   ✅ ${dir}`);
  }

  // Launch Browser
  console.log("\n🌐 Launching browser...");
  const launchOptions = { ...CONFIG.launchOptions, timeout: 30000 };
  const browserType = CONFIG.browser.toLowerCase();

  switch (browserType) {
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
      break;
  }

  console.log(`✅ Browser launched: ${CONFIG.browser.toUpperCase()}`);
  console.log(`   Headless: ${CONFIG.launchOptions?.headless ? "Yes" : "No"}`);
  console.log(`   SlowMo: ${CONFIG.launchOptions?.slowMo ?? 0}ms`);
  console.log(`   Timeout: 30000ms`);

  // Log enabled features
  console.log("\n🎯 Features enabled:");
  console.log(`   Video Recording: ${CONFIG.features.video ? "✅" : "❌"}`);
  console.log(`   Tracing: ${CONFIG.features.trace ? "✅" : "❌"}`);
  console.log(`   Metrics: ${CONFIG.features.metrics ? "✅" : "❌"}`);
  console.log(
    `   Accessibility: ${CONFIG.features.accessibility ? "✅" : "❌"}`
  );
  console.log(
    `   Visual Regression: ${CONFIG.features.visualRegression ? "✅" : "❌"}`
  );

  console.log("\n🔧 ========================================\n");
});

/**
 * 🎬 BEFORE - Scenario Setup
 */
Before(async function (this: World, { pickle, gherkinDocument }) {
  this.scenarioName = pickle.name;
  this.featureName = gherkinDocument.feature?.name ?? "Unknown";
  this.scenarioTags = pickle.tags.map((t) => t.name);
  this.startTime = Date.now();

  const tags = this.scenarioTags.join(", ") || "none";

  console.log("\n▶️  ========================================");
  console.log(`▶️  SCENARIO: ${this.scenarioName}`);
  console.log(`   Feature: ${this.featureName}`);
  console.log(`   Tags: ${tags}`);
  console.log("▶️  ========================================\n");

  try {
    // Video recording per scenario
    const recordVideo = CONFIG.features.video
      ? { dir: path.resolve(process.cwd(), "artifacts/videos") }
      : undefined;

    // Create context & page
    console.log("📄 Creating new browser context...");
    this.context = await browser.newContext({
      ...CONFIG.CONTEXT_OPTIONS,
      recordVideo,
    });
    this.page = await this.context.newPage();
    console.log(`✅ Browser context created`);

    if (recordVideo) {
      console.log(`🎥 Video recording enabled`);
    }

    // Start tracing if enabled
    if (CONFIG.features.trace) {
      console.log("🔍 Starting trace collection...");
      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
      console.log("✅ Tracing started");
    }

    // Performance timing
    if (CONFIG.features.metrics && this.page) {
      console.log("📊 Setting up performance monitoring...");
      await this.page.evaluate(() => {
        (window as any).testStartTime = performance.now();
      });
      console.log("✅ Performance monitoring ready");
    }

    console.log("✅ Scenario ready to execute\n");
  } catch (err) {
    console.error("❌ Failed to initialize scenario page/context:", err);
    throw err;
  }
});

/**
 * 📸 AFTER - Scenario Teardown
 */
After(async function (this: World, { result, pickle }) {
  const duration = Date.now() - (this.startTime ?? Date.now());
  const status: StatusValue = (result?.status as StatusValue) ?? "UNKNOWN";
  const scenarioName = pickle.name;
  const statusEmoji = getStatusEmoji(status);

  // Debug-Kontext: Bei Failure Buffer flushen
  if (
    status === "FAILED" &&
    typeof this.setDebugContextActive === "function" &&
    typeof this.logDebug === "function"
  ) {
    this.setDebugContextActive(true, "failure");
    this.logDebug(
      `Debug-Log-Buffer für Scenario '${scenarioName}' (Status: FAILED) wird ausgespült.`,
      "failure"
    );
    this.setDebugContextActive(false);
  }

  console.log("\n🏁 ========================================");
  console.log(`🏁 SCENARIO COMPLETED: ${scenarioName}`);
  console.log(`   Status: ${statusEmoji} ${STATUS_LABELS[status]}`);
  console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log("🏁 ========================================\n");

  try {
    // Determine status folder for artifacts
    const statusFolder =
      status === "FAILED"
        ? "failed"
        : status === "PASSED"
        ? "passed"
        : "unknown";

    // Capture artifacts based on status and configuration
    if (
      this.page &&
      (status === "FAILED" ||
        (status === "PASSED" && CONFIG.features?.capturePassedScreenshots))
    ) {
      console.log(`📸 Capturing ${statusFolder} artifacts...`);

      // Screenshot - organized by status
      try {
        const screenshotDir = path.join("artifacts/screenshots", statusFolder);
        await fs.mkdir(screenshotDir, { recursive: true });
        const screenshotPath = path.join(
          screenshotDir,
          `${sanitizeFilename(scenarioName)}_${Date.now()}.png`
        );
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        await this.attach(await fs.readFile(screenshotPath), "image/png");
        console.log(`   ✅ Screenshot saved: ${screenshotPath}`);
      } catch (err) {
        console.error("   ❌ Failed to save screenshot:", err);
      }

      // HTML snapshot - only for failures
      if (status === "FAILED") {
        try {
          await this.attach(await this.page.content(), "text/html");
          console.log("   ✅ HTML snapshot attached");
        } catch (err) {
          console.error("   ❌ Failed to attach HTML:", err);
        }
      }

      // Console logs - only for failures
      if (status === "FAILED" && this.logs?.length) {
        try {
          await this.attach(this.logs.join("\n"), "text/plain");
          console.log(
            `   ✅ Console logs attached (${this.logs.length} entries)`
          );
        } catch (err) {
          console.error("   ❌ Failed to attach console logs:", err);
        }
      }

      // Error message - only for failures
      if (status === "FAILED" && result?.message) {
        try {
          await this.attach(`Error: ${result.message}`, "text/plain");
          console.log("   ✅ Error details attached");
        } catch (err) {
          console.error("   ❌ Failed to attach error details:", err);
        }
      }
    }

    /**
     * VISUAL REGRESSION SCREENSHOTS (comparison/)
     * Speichert Screenshots für Vergleiche mit Baseline
     * Nur wenn Visual Regression Feature aktiviert ist
     */
    if (
      CONFIG.features.visualRegression &&
      this.page &&
      this.scenarioTags?.includes("visual")
    ) {
      try {
        console.log("🔍 Capturing visual regression screenshot...");
        const comparisonDir = path.join("artifacts/screenshots/comparison");
        await fs.mkdir(comparisonDir, { recursive: true });
        const comparisonPath = path.join(
          comparisonDir,
          `${sanitizeFilename(scenarioName)}_${Date.now()}.png`
        );
        await this.page.screenshot({ path: comparisonPath, fullPage: true });
        console.log(`   ✅ Comparison screenshot saved: ${comparisonPath}`);
      } catch (err) {
        console.error("   ❌ Failed to save comparison screenshot:", err);
      }
    }

    /**
     * TRACES - organized by status
     * Speichert Debug-Traces für Failed Tests (immer) und Passed Tests (bei Konfiguration)
     */
    if (CONFIG.features.trace && this.context) {
      const traceStatusFolder =
        status === "FAILED"
          ? "failed"
          : status === "PASSED" && CONFIG.features?.capturePassedTraces
          ? "passed"
          : null;

      try {
        if (traceStatusFolder) {
          console.log(`🔍 Saving ${traceStatusFolder} trace...`);
          const traceDir = path.join("artifacts/traces", traceStatusFolder);
          await fs.mkdir(traceDir, { recursive: true });
          const tracePath = path.join(
            traceDir,
            `${sanitizeFilename(scenarioName)}_${Date.now()}.zip`
          );
          await this.context.tracing.stop({ path: tracePath });
          console.log(`   ✅ Trace saved: ${tracePath}`);
        } else {
          // Stop tracing without saving for passed tests (when not configured)
          await this.context.tracing.stop();
          console.log(
            "   ℹ️  Trace discarded (not configured for passed tests)"
          );
        }
      } catch (err) {
        console.error("❌ Failed to save trace:", err);
      }
    }

    if (CONFIG.features.video && this.page) {
      try {
        const video = this.page.video();

        // Bestimme Video-Status Ordner - IMMER nach Status organisieren
        // Videos werden ohnehin aufgezeichnet, also in den korrekten Ordner verschieben
        const videoStatusFolder =
          status === "FAILED"
            ? "failed"
            : status === "PASSED"
            ? "passed"
            : null;

        // Hole den Original-Pfad BEVOR die Page geschlossen wird
        const originalVideoPath = video ? await video.path() : null;

        // Page MUSS geschlossen werden, damit Video finalisiert wird
        await this.page.close();

        if (video && videoStatusFolder) {
          console.log(`🎥 Saving ${videoStatusFolder} video recording...`);
          const videoDir = path.join("artifacts/videos", videoStatusFolder);
          await fs.mkdir(videoDir, { recursive: true });
          const videoPath = path.join(
            videoDir,
            `${sanitizeFilename(scenarioName)}_${Date.now()}.webm`
          );

          await video.saveAs(videoPath);
          console.log(`   ✅ Video saved: ${videoPath}`);

          // Lösche das Original-Video mit Hash-Namen aus dem Root-Ordner
          if (originalVideoPath) {
            try {
              await fs.unlink(originalVideoPath);
              console.log(
                `   🗑️  Original video deleted: ${originalVideoPath}`
              );
            } catch (unlinkErr) {
              // Ignoriere Fehler beim Löschen (z.B. wenn Datei nicht existiert)
            }
          }
        } else {
          // Lösche ungewollte Videos (z.B. bei UNKNOWN status)
          if (originalVideoPath) {
            try {
              await fs.unlink(originalVideoPath);
              console.log(
                `   🗑️  Unneeded video deleted: ${originalVideoPath}`
              );
            } catch (unlinkErr) {
              // Ignoriere Fehler
            }
          }
          console.log(
            `   ℹ️  No video saved (status: ${videoStatusFolder || "unknown"})`
          );
        }
      } catch (err) {
        console.error("❌ Failed to save video:", err);
      }
    } else if (this.page) {
      try {
        // Close page ohne Video zu speichern
        await this.page.close();
      } catch (err) {
        // Silently ignore
      }
    }

    // Metrics
    if (CONFIG.features.metrics && this.page && !this.page.isClosed?.()) {
      try {
        console.log("📊 Collecting performance metrics...");
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

        console.log(`✅ Metrics saved: ${metricsPath}`);
        console.log(
          `   DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`
        );
        console.log(
          `   Page Load Complete: ${metrics.loadComplete.toFixed(2)}ms`
        );
        console.log(`   Response Time: ${metrics.responseTime.toFixed(2)}ms`);
        console.log(
          `   DOM Interactive: ${metrics.domInteractive.toFixed(2)}ms`
        );
      } catch (err) {
        console.error("❌ Failed to collect metrics:", err);
      }
    }

    // Accessibility placeholder
    if (status === "FAILED" && CONFIG.features.accessibility) {
      console.log("♿ Accessibility scan placeholder...");
      // TODO: axe-core integration
    }
  } catch (err) {
    console.error("❌ Error in AFTER hook:", err);
  } finally {
    console.log("\n🧹 Cleaning up resources...");
    try {
      // ❗ Page wurde evtl. schon für Video geschlossen
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
      }

      // ✅ Context IMMER GANZ AM ENDE
      await this.context?.close();

      console.log("✅ Context closed successfully\n");
    } catch (err) {
      console.error("❌ Failed to close context:", err);
    }
  }
});

/**
 * 🛑 AFTER ALL - Global Teardown
 */
AfterAll(async () => {
  console.log("\n🔧 ========================================");
  console.log("🔧 GLOBAL TEST TEARDOWN STARTED");
  console.log("🔧 ========================================\n");

  console.log("🌐 Closing browser...");
  try {
    await browser?.close();
    console.log("✅ Browser closed successfully");
  } catch (err) {
    console.error("❌ Failed to close browser:", err);
  }

  console.log("\n📊 Generating test summary...");
  await generateTestSummary();

  console.log("\n🔧 ========================================");
  console.log("🏁 ALL TESTS COMPLETED");
  console.log("🔧 ========================================\n");
});

/**
 * 📊 Helper: Generate Test Summary
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
- Video Recording: ${CONFIG.features.video ? "✅" : "❌"}
- Tracing: ${CONFIG.features.trace ? "✅" : "❌"}
- Metrics: ${CONFIG.features.metrics ? "✅" : "❌"}
- Accessibility: ${CONFIG.features.accessibility ? "✅" : "❌"}
- Visual Regression: ${CONFIG.features.visualRegression ? "✅" : "❌"}

Artifacts Location:
- Screenshots: ./screenshots
- Videos: ./videos
- Traces: ./traces
- Metrics: ./metrics
- Reports: ./reports
`.trim();

    await fs.writeFile(summaryPath, summary);
    console.log(`✅ Test summary saved: ${summaryPath}`);
  } catch (err) {
    console.error("❌ Failed to generate summary:", err);
  }
}

/**
 * 🎨 Helper: Get Status Emoji
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
