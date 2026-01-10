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
import { logger } from "../../../utils/logger-util.ts";

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

// Map zur Verwaltung, ob für ein Feature schon eine Logdatei initialisiert wurde und wie der Zeitstempel lautet
const featureLogState: Record<
  string,
  { initialized: boolean; timestamp: string }
> = {};

/**
 * 🚀 BEFORE ALL - Global Setup
 */
BeforeAll(async () => {
  logger.info("🔧 GLOBAL TEST SETUP STARTED");

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

    "test-results/metrics",
    "test-results/summary",
  ];
  console.log(`📁 Creating ${dirs.length} output directories...`);
  for (const dir of dirs) {
    await fs.mkdir(path.resolve(dir), { recursive: true });
    logger.debug(`Output directory ensured: ${dir}`);
  }

  // Launch Browser
  console.log("\n🌐 Launching browser...");
  logger.info("🌐 Launching browser...");
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
  logger.info(`✅ Browser launched: ${CONFIG.browser.toUpperCase()}`);
  logger.info(`Headless: ${CONFIG.launchOptions?.headless ? "Yes" : "No"}`);
  logger.info(`SlowMo: ${CONFIG.launchOptions?.slowMo ?? 0}ms`);
  logger.info(`Timeout: 30000ms`);
  logger.info(
    `Features enabled: Video=${CONFIG.features.video}, Trace=${CONFIG.features.trace}, Metrics=${CONFIG.features.metrics}, Accessibility=${CONFIG.features.accessibility}, VisualRegression=${CONFIG.features.visualRegression}`
  );
});

/**
 * 🎬 BEFORE - Scenario Setup
 */

Before(async function (this: World, { pickle, gherkinDocument }) {
  // Logger: Logdatei pro Feature/Tag/Run, aber nur einmal pro Feature
  // Fallback: Feature-Dateiname, falls kein Feature-Name vorhanden
  let featurePart =
    this.featureName && this.featureName.trim() !== ""
      ? this.featureName
      : null;
  if (!featurePart && gherkinDocument && gherkinDocument.uri) {
    const match = /([^/\\]+)\.feature$/.exec(gherkinDocument.uri);
    if (match) featurePart = match[1];
  }
  const tagsPart =
    this.scenarioTags && this.scenarioTags.length > 0
      ? this.scenarioTags.join("_")
      : "notags";
  if (featurePart) {
    if (!featureLogState[featurePart]) {
      // Zeitstempel nur beim ersten Szenario des Features erzeugen
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
        now.getSeconds()
      )}`;
      logger.initializeFileStream([featurePart, tagsPart, timestamp]);
      featureLogState[featurePart] = { initialized: true, timestamp };
    } else {
      // Logdatei für dieses Feature bereits initialisiert, nichts tun
    }
  }
  this.scenarioName = pickle.name;
  this.featureName = gherkinDocument.feature?.name ?? "Unknown";
  this.scenarioTags = pickle.tags.map((t) => t.name);
  this.startTime = Date.now();

  const tags = this.scenarioTags.join(", ") || "none";
  logger.info(
    `▶️ SCENARIO START: ${this.scenarioName} | Feature: ${this.featureName} | Tags: ${tags}`
  );

  try {
    logger.debug("Creating new browser context...");
    const recordVideo = CONFIG.features.video
      ? { dir: path.resolve(process.cwd(), "artifacts/videos") }
      : undefined;

    // Create context & page
    console.log("📄 Creating new browser context...");
    this.context = await browser.newContext({
      ...CONFIG.CONTEXT_OPTIONS,
      recordVideo,
    });
    if (!this.context) {
      logger.error("Failed to create browser context");
      throw new Error("Failed to create browser context");
    }
    this.page = await this.context.newPage();
    logger.info("✅ Browser context created");
    if (recordVideo) {
      logger.info("🎥 Video recording enabled");
    }

    // Start tracing if enabled
    if (CONFIG.features.trace) {
      logger.info("🔍 Starting trace collection...");
      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
      logger.info("✅ Tracing started");
    }

    // Performance timing
    if (CONFIG.features.metrics && this.page) {
      logger.info("📊 Setting up performance monitoring...");
      await this.page.evaluate(() => {
        (window as any).testStartTime = performance.now();
      });
      logger.info("✅ Performance monitoring ready");
    }

    console.log("✅ Scenario ready to execute\n");
    logger.info("✅ Scenario ready to execute");
  } catch (err) {
    logger.error(
      "❌ Failed to initialize scenario page/context",
      err instanceof Error ? err : { error: String(err) }
    );
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
  logger.info(
    `🏁 SCENARIO COMPLETED: ${scenarioName} | Status: ${statusEmoji} ${
      STATUS_LABELS[status]
    } | Duration: ${(duration / 1000).toFixed(2)}s`
  );
  if (status === "FAILED") {
    logger.error(`❌ Scenario failed: ${scenarioName}`, {
      error: result?.message,
      tags: this.scenarioTags,
      feature: this.featureName,
    });
  }

  try {
    logger.debug(`Artifacts for scenario: ${scenarioName} | Status: ${status}`);
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
  logger.info("🔧 GLOBAL TEST TEARDOWN STARTED");
  logger.info("🌐 Closing browser...");
  try {
    await browser?.close();
    logger.info("✅ Browser closed successfully");
  } catch (err) {
    console.error("❌ Failed to close browser:", err);
  }

  console.log("\n📊 Generating test summary...");
  logger.info("📊 Generating test summary...");
  await generateTestSummary();

  console.log("\n🔧 ========================================");
  logger.info("🏁 ALL TESTS COMPLETED");
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
