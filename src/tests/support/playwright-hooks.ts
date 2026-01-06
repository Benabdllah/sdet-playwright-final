/**
 * ============================================================================
 * Playwright Test Hooks für E2E Tests
 * ============================================================================
 *
 * Diese Datei registriert standard Playwright Hooks wie afterEach
 * für zusätzliche Test-Funktionalität (z.B. Cleanup, Logging)
 *
 * HINWEIS: Screenshot-Organisierung wird durch ArtifactOrganizerReporter
 * behandelt, nicht durch diese Hooks.
 */

import { test } from "@playwright/test";

/**
 * Nach jedem Test: Cleanup und Logging
 */
test.afterEach(async ({ page }, testInfo) => {
  // Standardmäßig leer - erweitert mit projekt-spezifischen Hooks
  // z.B. Browser-Daten löschen, Logs sammeln, etc.
});
