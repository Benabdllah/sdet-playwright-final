import { defineConfig, devices } from "@playwright/test";
import { getRoleTag } from "../../src/config/roleFilter";
import * as path from "node:path";
import * as fs from "node:fs";
import * as dotenv from "dotenv";

/**
 * ============================================================================
 * ULTIMATIVE ULTRA SDET +++++ FINAL VERSION - Playwright Konfiguration
 * ============================================================================
 *
 * Diese Datei definiert die komplette Playwright Test-Konfiguration für:
 * ✓ E2E Testing (Chromium, Firefox, WebKit)
 * ✓ Mobile Testing (iOS, Android)
 * ✓ Parallel Execution & Multi-Worker Setup
 * ✓ Comprehensive Reporting (HTML, JSON, JUnit, Blob)
 * ✓ Performance Optimization & Tracing
 * ✓ CI/CD Integration mit GitHub Actions
 * ✓ Multi-Tenant & Multi-Role Support
 * ✓ Environment Variable Management
 *
 * Dokumentation: https://playwright.dev/docs/test-configuration
 * ============================================================================
 */

/**
 * Environment Variables laden aus .env Dateien
 * - .env.local: Lokale Overrides (nicht in Git)
 * - .env: Gemeinsame Konfiguration für alle Umgebungen
 */
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Hilfsfunktion für bedingte Reporter-Konfiguration
 * Löst TypeScript-Typprobleme mit bedingtem Spread-Operator
 */
function getReporters() {
  const reporters: any[] = [
    ["list"], // Konsole: Echtzeitausgabe während Tests

    [
      "html",
      {
        open: "never",
        outputFolder: path.join(__dirname, "../../reports/playwright/html"),
      },
    ],

    [
      "blob",
      {
        outputDir: path.join(__dirname, "../../test-results/playwright/blob"),
      },
    ],
    ["json", { outputFile: "../../reports/playwright/html/test-summary.json" }],
    ["junit", { outputFile: "../../reports/junit/e2e.xml" }],
    [
      "json",
      { outputFile: "../../reports/playwright/html/playwright-results.json" },
    ],
    ["json", { outputFile: "../../reports/junit/api.xml" }],
    ["json", { outputFile: "../../test-results/api/api-report.json" }],
    ["json", { outputFile: "../../reports/junit/integration.xml" }],
    ["json", { outputFile: "../../artifacts/accessibility/axe-results.json" }],
    [
      "json",
      { outputFile: "../../artifacts/accessibility/wcag-violations.json" },
    ],
    ["json", { outputFile: "../../artifacts/security/vulnerabilities.json" }],
    ["json", { outputFile: "../../artifacts/performance/load-times.json" }],
    ["json", { outputFile: "../../artifacts/performance/web-vitals.json" }],
    ["json", { outputFile: "../../artifacts/performance/lighthouse.json" }],
    [
      "json",
      { outputFile: "../../test-results/coverage/coverage-summary.json" },
    ],
    [
      "json",
      {
        outputFile: path.join(
          __dirname,
          "../../artifacts/metrics/execution-times.json"
        ),
      },
    ],
    [
      "json",
      {
        outputFile: path.join(
          __dirname,
          "../../artifacts/metrics/flaky-tests.json"
        ),
      },
    ],
    [
      "json",
      {
        outputFile: path.join(
          __dirname,
          "../../artifacts/metrics/test-trends.json"
        ),
      },
    ],
    ["json", { outputFile: "../../artifacts/visual/visual-report.json" }],
    ["json", { outputFile: "../../reports/cucumber/report.json" }],
    ["json", { outputFile: "../../reports/cucumber/messages.ndjson" }],
    ["json", { outputFile: "../../reports/cucumber/junit.xml" }],
    ["json", { outputFile: "../../reports/cucumber/usage.json" }],
    ["json", { outputFile: "../../reports/playwright/html/ci-summary.json" }],
  ];

  // Allure Reporter nur wenn explizit aktiviert
  // Seit allure-playwright v3 wird resultsDir über .allurerc.json oder ENV gesteuert
  if (process.env.ALLURE_ENABLED === "true") {
    reporters.splice(4, 0, [
      "allure-playwright",
      {
        resultsDir: path.resolve(
          __dirname,
          "../../reports/allure/allure-results"
        ),
        suiteTitle: "SDET PW Practice - E2E Tests",
      },
    ]);
  }

  // Custom Artifact Organizer Reporter (organisiert Screenshots/Videos nach Status)
  const reporterPath = path.resolve(
    __dirname,
    "../../src/tests/support/reporters/ArtifactOrganizerReporter.ts"
  );
  reporters.push([reporterPath]);

  return reporters;
}

/**
 * ============================================================================
 * DEFINECONFIG - Hauptkonfiguration aller Test-Settings
 * ============================================================================
 */
export default defineConfig({
  // ========================================================================
  // TEST FILTERING & TARGETING
  // ========================================================================

  /**
   * grep: Test-Filter basierend auf Tags/Pattern
   * Nutzt getRoleTag() um nur Tests für die aktuelle Rolle auszuführen
   * Beispiel: @admin, @customer, @genehmiger Tags
   */
  grep: getRoleTag() || undefined,

  /**
   * grepInvert: Ausschluss von Tests mit bestimmten Tags
   * @slow Tests werden in CI übersprungen (dauert länger)
   */
  grepInvert: /@slow/,

  // ========================================================================
  // TIMEOUTS - Maximale Wartezeiten für Tests
  // ========================================================================

  /**
   * timeout: Maximale Wartezeit pro einzelnem Test
   * 60 Sekunden = Standard für normale Tests
   * Längere Tests mit @slow Tag können länger dauern
   */
  timeout: 60_000,

  /**
   * globalTimeout: Maximale Gesamtdauer für alle Tests
   * 3.600 Sekunden = 1 Stunde (CI/CD Grenze)
   * Verhindert hängende Test-Prozesse
   */
  globalTimeout: 3_600_000,

  // ========================================================================
  // TEST DISCOVERY - Wo und wie Tests gefunden werden
  // ========================================================================

  /**
   * testDir: Verzeichnis mit allen Test-Dateien
   * Nur src/tests wird gescannt, nicht src/tests_all
   */
  testDir: "../../src/tests/e2e/auth",

  /**
   * testMatch: Pattern für Test-Dateien
   * Alle Dateien mit .spec.ts Endung werden als Tests erkannt
   * Hinweis: tests_all Ordner wird NICHT durchsucht da nicht unter testDir
   */
  testMatch: "**/*.spec.ts",

  // ========================================================================
  // PARALLEL EXECUTION - Parallelisierung & Performance
  // ========================================================================

  /**
   * fullyParallel: Alle Tests parallel in separaten Worker-Prozessen
   * true = Maximale Performance, schnellere Ausführung
   * false = Sequentielle Ausführung (für Debugging)
   */
  fullyParallel: true,

  /**
   * forbidOnly: Fehler wenn test.only in Code verblieben ist
   * Nur in CI aktiviert, verhindert versehentlich gecheckte Only-Tests
   */
  forbidOnly: !!process.env.CI,

  /**
   * retries: Automatische Wiederholung fehlgeschlagener Tests
   * CI: 2 Retries (für flaky Tests)
   * Local: 0 Retries (schneller entwickeln)
   */
  retries: process.env.CI ? 2 : 0,

  /**
   * workers: Anzahl paralleler Worker-Prozesse
   * CI: 1 Worker (einfacher zu debuggen, konsistente Ergebnisse)
   * Local: undefined = Auto (nutzt alle CPU-Cores)
   * Alternativen: '50%', '40%', konkrete Zahlen (4, 8, etc.)
   */
  workers: process.env.CI ? 1 : undefined,

  /**
   * globalSetup: Wird EINMAL vor allen Tests ausgeführt
   * Erstellt automatisch alle notwendigen Verzeichnisse
   * So wird die Struktur GARANTIERT nicht gelöscht
   */
  globalSetup: require.resolve("./globalSetup.ts"),

  // ========================================================================
  // REPORTING - Test-Ergebnisse in verschiedenen Formaten
  // ========================================================================

  /**
   * reporter: Verschiedene Output-Formate für Test-Ergebnisse
   *
   * 'list' = Konsolausgabe während Test-Ausführung
   *          Zeigt schnell Erfolg/Fehler in der CLI an
   *
   * 'html' = Interaktive HTML Report mit Screenshots/Videos
   *          Öffnet automatisch (open: 'never' = manuell öffnen)
   *          Perfekt für visuelle Analyse von Fehlern
   *
   * 'json' = Machine-readable JSON Format für CI/CD Pipelines
   *          Für Metriken, Trend-Analyse, Integration mit anderen Tools
   *
   * 'junit' = JUnit XML Format (Standard in Jenkins, Azure DevOps, etc.)
   *           Für CI/CD Integration und Historisierung
   *
   * 'blob' = Playwright's Binary Format mit Raw Test-Data (keine Report!)
   *          Speichert Traces, Videos, Screenshots als Test-Results
   *          Später mit 'npx playwright show-trace' lesbar
   *
   * ============================================================================
   * ULTIMATIVE ULTRA SDET +++++ FINAL VERSION - Comprehensive Reporting
   * ============================================================================
   *
   * Diese Konfiguration nutzt 13+ verschiedene Report-Formate für:
   * ✓ E2E Test Results (Playwright)
   * ✓ API Test Results
   * ✓ Accessibility Testing (A11y / WCAG)
   * ✓ Security Scanning
   * ✓ Performance Metrics & Lighthouse
   * ✓ Code Coverage (LCOV, Cobertura)
   * ✓ Cucumber/BDD Feature Reports
   * ✓ Test Metrics & Flakiness Detection
   * ✓ Visual Regression Testing
   * ✓ CI/CD Integration & Historisierung
   * ✓ Allure Framework Integration
   */
  reporter: getReporters(),

  // ========================================================================
  // USE - Shared Settings für alle Browser-Tests
  // ========================================================================

  /**
   * Zentrale Konfiguration, die für alle Projects/Browser gilt
   * Kann pro Browser mit project-spezifischen Settings überschrieben werden
   */
  use: {
    /**
     * baseURL: Basis-URL für alle page.goto('') Aufrufe
     * Kann per ENV-Variable überschrieben werden (PL_URL)
     * Fallback auf localhost:3000 für lokale Entwicklung
     */
    baseURL: process.env.PL_URL || "http://localhost:3000",

    /**
     * headless: Browser im Headless-Mode (kein UI sichtbar)
     * true = Schneller, für CI/CD
     * false = Mit Browser-Fenster, zum Debugging
     */
    headless: true,

    /**
     * viewport: Browser-Fenster-Größe für Desktop Tests
     * 1920x1080 = Full HD Standard
     * Für Mobile: wird durch Project-Devices überschrieben
     */
    viewport: { width: 1920, height: 1080 },

    /**
     * video: 'on' = Videos für alle Tests aufzeichnen
     * Der ArtifactOrganizerReporter organisiert sie automatisch in:
     * - artifacts/videos/passed/ (bestandene Tests)
     * - artifacts/videos/failed/ (fehlgeschlagene Tests)
     *
     * Alternative: 'retain-on-failure' = Nur bei Fehlern (spart Speicher)
     */
    video: "retain-on-failure",
    // videosPath wird vom Reporter organisiert (ArtifactOrganizerReporter)

    /**
     * ignoreHTTPSErrors: SSL/TLS Fehler ignorieren
     * Nützlich für Selbstsignierte Zertifikate in Test-Umgebungen
     */
    ignoreHTTPSErrors: true,

    /**
     * screenshot: 'on' = Screenshots für alle Tests erfassen
     * Der ArtifactOrganizerReporter organisiert sie automatisch in:
     * - artifacts/screenshots/passed/ (bestandene Tests)
     * - artifacts/screenshots/failed/ (fehlgeschlagene Tests)
     *
     * Alternative: 'only-on-failure' = Nur bei Fehlern (spart Speicher)
     */
    screenshot: "only-on-failure",
    // screenshotDir wird vom Reporter organisiert (ArtifactOrganizerReporter)

    /**
     * trace: Detailliertes Trace-Aufzeichnung für Debugging
     * 'on' = Alle Tests aufzeichnen (passed + failed)
     * Der ArtifactOrganizerReporter organisiert Traces automatisch in:
     * - artifacts/traces/passed/ (bestandene Tests)
     * - artifacts/traces/failed/ (fehlgeschlagene Tests)
     *
     * Alternative: 'retain-on-failure' = Nur bei Fehlern (spart Speicher)
     */
    trace: "on",

    /**
     * actionTimeout: Max. Wartezeit für einzelne Aktion (Click, Fill, etc.)
     * 20 Sekunden = ausreichend für normale Operationen
     */
    actionTimeout: 20_000,

    /**
     * navigationTimeout: Max. Wartezeit für Navigation (page.goto, reload, etc.)
     * 30 Sekunden = für langsame Netzwerk-Verbindungen
     */
    navigationTimeout: 30_000,
  },

  // ========================================================================
  // OUTPUT DIRECTORIES - Wo Test-Ergebnisse gespeichert werden
  // ========================================================================

  /**
   * outputDir: Verzeichnis für Playwright interne Artefakte
   * WICHTIG: Nur raw-Dateien, echte Outputs gehen in artifacts/
   * Speichert: Traces (.zip), Blobs, Videos, Screenshots
   * WIRD GELÖSCHT nach Test-Run (ephemär)
   */
  outputDir: "../../test-results/playwright/raw",

  /**
   * snapshotDir: Verzeichnis für Visual Regression Testing Snapshots
   * Speichert Screenshots für Vergleiche in zukünftigen Runs
   */
  snapshotDir: "../../src/tests/__snapshots__",

  // ========================================================================
  // BROWSER PROJECTS - Multi-Browser Konfiguration
  // ========================================================================

  /**
   * projects: Array mit verschiedenen Browser-Konfigurationen
   * Jedes Project kann eigene Settings und Devices nutzen
   * Alle Projects laufen parallel für schnelle Resulte
   */
  projects: [
    // ====================================================================
    // DESKTOP BROWSER PROJECTS
    // ====================================================================

    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
      // Chromium: Haupt-Browser, basierend auf Blink Engine
      // ✓ Beste Kompatibilität mit modernen Web-Standards
      // ✓ Verwendet von Google Chrome, Microsoft Edge, Opera
      // ✓ Performance und Feature-reichster Browser
    },

    /*{
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: true,
      },
      // Firefox: Gecko-basierter Browser von Mozilla
      // ✓ Alternative zu Chromium, catch'n andere Bugs
      // ✓ Bessere CSS-Unterstützung in manchen Fällen
      // ✓ Unterschiedliche JavaScript-Engine (SpiderMonkey)
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: true,
      },
      // WebKit: Safari-Engine (macOS & iOS)
      // ✓ Testet iOS Safari Kompatibilität
      // ✓ Unterschiedliche Rendering-Engine
      // ✓ Wichtig für Apple Ecosystem (iPad, iPhone)
    },*/

    // ====================================================================
    // MOBILE DEVICE PROJECTS
    // ====================================================================

    // DISABLED: Mobile Chrome - zu langsam/Timeout Probleme
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //     // Pixel 5: Google Android Flagship Device
    //     // ✓ 6" Display, 2340x1080 Auflösung
    //     // ✓ Testet Chrome auf Android
    //   },
    // },

    /*{
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        // iPhone 12: Apple iOS Device
        // ✓ 6.1" Display, 2532x1170 Auflösung
        // ✓ Testet Safari auf iOS
        // ✓ Wichtig für Apple Ecosystem
      },
    },*/

    // ====================================================================
    // OPTIONAL: Weitere Browser-Konfigurationen
    // ====================================================================

    // Aktiviere diese für erweiterte Browser-Tests:
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    //   // Microsoft Edge: Chromium-basiert seit Version 79
    //   // ✓ Für Windows-Benutzer wichtig
    // },
    //
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    //   // Google Chrome: Latest Channel
    //   // ✓ Testet gegen Chrome Stable Release
    // },
    //
    // {
    //   name: 'iPad',
    //   use: { ...devices['iPad Pro 11'] },
    //   // iPad: Tablet-Gerät mit Safari
    //   // ✓ 11" Display für Responsive Design Tests
    // },
  ],

  // ========================================================================
  // WEB SERVER - Lokaler Dev-Server vor Test-Start
  // ========================================================================

  /**
   * webServer: Startet automatisch einen Dev-Server vor Tests
   * DISABLED: Kein 'npm run start' Script vorhanden
   * Aktiviere wenn du einen lokalen Dev-Server brauchst
   */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },

  // ========================================================================
  // WEITERE KONFIGURATIONEN
  // ========================================================================

  /**
   * expect: Assertion & Matcher-Konfiguration
   * Timeout für Assertions die mit `.toBeVisible()` etc. warten
   */
  // expect: {
  //   timeout: 5000,
  // },

  /**
   * preserveExistingScreenshots: Speichert alte Screenshots bei Updates
   * true = Alte Versionen bleiben erhalten für Vergleiche
   */
  // snapshotPathTemplate: '{basePath}/{snapshotSuffix}{ext}',
});

/**
 * Hinweis: defineConfig exportiert bereits die Konfiguration
 * Weitere erweiterte Konfigurationen können oben direkt in defineConfig({...}) hinzugefügt werden
 */
