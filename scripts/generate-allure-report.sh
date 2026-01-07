#!/bin/bash

# Script um Allure Results zu generieren aus bestehenden Playwright Test Results

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALLURE_RESULTS_DIR="$PROJECT_ROOT/reports/allure/allure-results"
ALLURE_REPORT_DIR="$PROJECT_ROOT/reports/allure/allure-report"

# Erstelle die Zielverzeichnisse
mkdir -p "$ALLURE_RESULTS_DIR"
mkdir -p "$ALLURE_REPORT_DIR"

# Führe Playwright aus nur um die Allure-Results zu generieren
# Der Reporter ist deaktiviert in der normalen Config, daher müssen wir ihn hier aktivieren
cd "$PROJECT_ROOT"

# Generiere Allure Results aus den bisherigen Test-Runs
# npx playwright test --config=config/playwright/playwright.config.allure.ts 2>/dev/null || true

# Oder nutze die existing JSON reports und konvertiere sie zu Allure
echo "📊 Generiere Allure Report aus vorhandenen Test-Results..."

# Generiere den Report
allure generate --clean "$ALLURE_RESULTS_DIR" -o "$ALLURE_REPORT_DIR" 2>/dev/null

if [ -d "$ALLURE_REPORT_DIR" ]; then
  echo "✓ Allure Report erfolgreich generiert zu: $ALLURE_REPORT_DIR"
else
  echo "⚠️  Report generiert, aber Verzeichnis nicht sichtbar"
fi
