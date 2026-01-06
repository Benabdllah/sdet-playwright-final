/**
 * ============================================================================
 * Global Setup - Verzeichnisstruktur initialisieren
 * ============================================================================
 * Wird VOR allen Tests ausgeführt
 * Stellt sicher, dass alle notwendigen Verzeichnisse existieren
 * ============================================================================
 */

import * as fs from "node:fs";
import * as path from "node:path";

// Farbige Konsolen-Ausgabe
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
};

/**
 * Verzeichnisstruktur die garantiert existieren muss
 */
const REQUIRED_DIRECTORIES = [
  // Reports - PERSISTENT
  "reports/playwright/html",
  "reports/allure/allure-results",
  "reports/allure/allure-report",
  "reports/cucumber",
  "reports/junit",

  // Artifacts - PERSISTENT (SDET Gold)
  "artifacts/screenshots/passed",
  "artifacts/screenshots/failed",
  "artifacts/screenshots/comparison",
  "artifacts/videos/passed",
  "artifacts/videos/failed",
  "artifacts/traces/passed",
  "artifacts/traces/failed",
  "artifacts/visual/baseline",
  "artifacts/visual/current",
  "artifacts/visual/diff",
  "artifacts/downloads",
  "artifacts/har",
  "artifacts/performance",
  "artifacts/accessibility",
  "artifacts/security",
  "artifacts/metrics",

  // Test Results - TEMPORARY (wird gebraucht für Playwright outputDir)
  "test-results/playwright/raw",
  "test-results/playwright/blob",
  "test-results/coverage",
];

/**
 * Erstelle alle notwendigen Verzeichnisse
 */
function setupDirectories(): void {
  const projectRoot = process.cwd();

  console.log(
    `\n${colors.blue}${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.blue}${colors.bright}📁 GLOBAL SETUP - Verzeichnisstruktur initialisieren${colors.reset}`
  );
  console.log(
    `${colors.blue}${colors.bright}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  let createdCount = 0;
  let existingCount = 0;

  REQUIRED_DIRECTORIES.forEach((dir) => {
    const fullPath = path.join(projectRoot, dir);

    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`${colors.green}✅ Erstellt: ${dir}${colors.reset}`);
        createdCount++;
      } catch (error) {
        console.error(
          `${colors.yellow}❌ Fehler beim Erstellen von ${dir}: ${error}${colors.reset}`
        );
      }
    } else {
      existingCount++;
    }
  });

  console.log(`\n${colors.bright}Zusammenfassung:${colors.reset}`);
  console.log(
    `${colors.green}✅ Neu erstellt: ${createdCount} Verzeichnisse${colors.reset}`
  );
  console.log(
    `${colors.blue}ℹ️  Bereits vorhanden: ${existingCount} Verzeichnisse${colors.reset}`
  );
  console.log(
    `${colors.bright}Gesamt: ${REQUIRED_DIRECTORIES.length} Verzeichnisse${colors.reset}\n`
  );

  console.log(
    `${colors.green}${colors.bright}✨ Verzeichnisstruktur ist bereit für Tests!${colors.reset}\n`
  );
}

/**
 * Erstelle .gitkeep Dateien für leere Verzeichnisse
 * Damit werden leere Ordner auch in Git versioniert
 */
function createGitkeepFiles(): void {
  console.log(`${colors.blue}📝 Erstelle .gitkeep Dateien...${colors.reset}\n`);

  const persistentDirs = [
    "reports/allure/allure-report",
    "artifacts/screenshots/passed",
    "artifacts/screenshots/failed",
    "artifacts/screenshots/comparison",
    "artifacts/videos/passed",
    "artifacts/videos/failed",
    "artifacts/traces/passed",
    "artifacts/traces/failed",
    "artifacts/visual/baseline",
    "artifacts/visual/current",
    "artifacts/visual/diff",
  ];

  persistentDirs.forEach((dir) => {
    const gitkeepPath = path.join(process.cwd(), dir, ".gitkeep");
    if (!fs.existsSync(gitkeepPath)) {
      try {
        fs.writeFileSync(gitkeepPath, "");
        console.log(`${colors.green}✅ ${dir}/.gitkeep${colors.reset}`);
      } catch (error) {
        console.error(
          `${colors.yellow}⚠️  Konnte .gitkeep nicht erstellen in ${dir}${colors.reset}`
        );
      }
    }
  });

  console.log("");
}

/**
 * Informationen zur Verzeichnisstruktur ausgeben
 */
function printStructureInfo(): void {
  console.log(
    `${colors.blue}${colors.bright}📊 Verzeichnisstruktur:${colors.reset}\n`
  );

  const categories = {
    "Reports (PERSISTENT)": [
      "reports/playwright/html",
      "reports/allure/",
      "reports/cucumber/",
      "reports/junit/",
    ],
    "Artifacts (PERSISTENT)": [
      "artifacts/screenshots/{passed,failed,comparison}",
      "artifacts/videos/{passed,failed}",
      "artifacts/traces/{passed,failed}",
      "artifacts/visual/{baseline,current,diff}",
      "artifacts/har/",
      "artifacts/performance/",
      "artifacts/metrics/",
    ],
    "Test Results (TEMPORARY)": [
      "test-results/playwright/raw/ ← outputDir (für Blob)",
      "test-results/playwright/blob/",
    ],
  };

  Object.entries(categories).forEach(([category, dirs]) => {
    console.log(`${colors.bright}${category}${colors.reset}`);
    dirs.forEach((dir) => {
      console.log(`  ├─ ${dir}`);
    });
    console.log("");
  });
}

/**
 * Entry Point
 */
export default async () => {
  try {
    setupDirectories();
    createGitkeepFiles();
    printStructureInfo();

    console.log(
      `${colors.green}${colors.bright}✨ Global Setup abgeschlossen!${colors.reset}\n`
    );
  } catch (error) {
    console.error(
      `${colors.yellow}${colors.bright}⚠️  Warnung während Global Setup:${colors.reset}`,
      error
    );
    // Nicht abbrechen - Tests sollen weitergehen
  }
};
