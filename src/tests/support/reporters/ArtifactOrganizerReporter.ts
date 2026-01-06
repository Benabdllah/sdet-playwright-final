/**
 * ============================================================================
 * Custom Playwright Reporter für Screenshot-Organisierung
 * ============================================================================
 *
 * Dieser Reporter wird nach jedem Test aufgerufen und organisiert
 * automatisch die Screenshots/Videos/Traces nach Test-Status
 *
 * Reporter sind der beste Weg, um Test-Ergebnisse zu verarbeiten,
 * ohne die Config-Datei zu belasten
 */

import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

class ArtifactOrganizerReporter implements Reporter {
  /**
   * Map to track test status by test directory name
   * Wird gefüllt in onTestEnd() und verwendet in onEnd()
   */
  private testStatusMap = new Map<string, "failed" | "passed">();

  /**
   * Wird aufgerufen nachdem ein einzelner Test beendet ist
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    // Speichere den Test-Status für später
    const testName = sanitizeTestName(test.title);
    this.testStatusMap.set(
      testName,
      result.status === "failed" ? "failed" : "passed"
    );

    // Logging
    const statusEmoji =
      result.status === "failed"
        ? "❌"
        : result.status === "passed"
        ? "✅"
        : "⚠️";

    console.log(
      `${statusEmoji} Test "${test.title}" finished with status: ${result.status}`
    );
  }

  /**
   * Wird nach ALLEN Tests aufgerufen
   */
  onEnd(result: FullResult): void {
    console.log("\n📁 Organising all test artifacts...");

    // Verarbeite alle Artefakte die noch in test-results/playwright/raw sind
    const rawDir = "test-results/playwright/raw";

    if (fs.existsSync(rawDir)) {
      try {
        const dirs = fs.readdirSync(rawDir);

        for (const dir of dirs) {
          const dirPath = path.join(rawDir, dir);
          const stat = fs.statSync(dirPath);

          if (stat.isDirectory()) {
            // Extrahiere den Test-Status aus dem Verzeichnisnamen
            const statusFolder = this.extractStatusFromDirName(dir);

            // Verschiebe alle Dateien aus diesem Verzeichnis
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
              // SCREENSHOTS (PNG)
              if (file.endsWith(".png")) {
                const targetBaseDir = path.join(
                  "artifacts/screenshots",
                  statusFolder
                );
                this.ensureDir(targetBaseDir);
                const sourcePath = path.join(dirPath, file);
                const targetPath = path.join(targetBaseDir, `${dir}_${file}`);

                try {
                  if (!fs.existsSync(targetPath)) {
                    fs.renameSync(sourcePath, targetPath);
                    console.log(
                      `   📸 Screenshot: ${file} → artifacts/screenshots/${statusFolder}`
                    );
                  }
                } catch (e) {
                  // Stille Fehler
                }
              }

              // VIDEOS (WEBM, MP4)
              if (file.endsWith(".webm") || file.endsWith(".mp4")) {
                const targetBaseDir = path.join(
                  "artifacts/videos",
                  statusFolder
                );
                this.ensureDir(targetBaseDir);
                const sourcePath = path.join(dirPath, file);
                const targetPath = path.join(targetBaseDir, `${dir}_${file}`);

                try {
                  if (!fs.existsSync(targetPath)) {
                    fs.renameSync(sourcePath, targetPath);
                    console.log(
                      `   🎥 Video: ${file} → artifacts/videos/${statusFolder}`
                    );
                  }
                } catch (e) {
                  // Stille Fehler
                }
              }

              // TRACES (ZIP-Dateien mit "trace" im Namen)
              if (file.endsWith(".zip") && file.includes("trace")) {
                const targetBaseDir = path.join(
                  "artifacts/traces",
                  statusFolder
                );
                this.ensureDir(targetBaseDir);
                const sourcePath = path.join(dirPath, file);
                const targetPath = path.join(targetBaseDir, `${dir}_${file}`);

                try {
                  if (!fs.existsSync(targetPath)) {
                    fs.renameSync(sourcePath, targetPath);
                    console.log(
                      `   🔍 Trace: ${file} → artifacts/traces/${statusFolder}`
                    );
                  }
                } catch (e) {
                  // Stille Fehler
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn("   ⚠️  Error organizing artifacts:", error);
      }
    }

    console.log("✅ Artifact organization complete!\n");
  }

  /**
   * Extrahiere den Status aus dem Verzeichnisnamen
   * Nutze die Map, falls verfügbar, sonst default zu "passed"
   */
  private extractStatusFromDirName(dirName: string): "failed" | "passed" {
    // Versuche, den Status aus der testStatusMap zu erhalten
    // Das Verzeichnis folgt dem Pattern: test-name-projectkürzel

    // Normalisiere den Verzeichnisnamen für den Vergleich (Bindestriche zu Unterstrichen, lowercase)
    const normalizedDirName = dirName.toLowerCase().replace(/-/g, "_");

    // Suche nach dem gekürzen Test-Namen in der Map
    for (const [testName, status] of this.testStatusMap.entries()) {
      // Prüfe ob der normalisierte Verzeichnisname den Test-Namen enthält
      if (normalizedDirName.includes(testName)) {
        return status;
      }
    }

    // Fallback: Nutze "passed" als Standard, da screenshot: 'on' alle Tests erfasst
    // und die meisten Tests bestehen. Nur wenn explizit "failed" im Namen steht, nutze "failed"
    if (dirName.toLowerCase().includes("failed")) {
      return "failed";
    }

    return "passed";
  }

  /**
   * Stelle sicher dass Verzeichnis existiert
   */
  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Sanitize Test-Namen für Datei-Namen
 */
function sanitizeTestName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 50);
}

export default ArtifactOrganizerReporter;
