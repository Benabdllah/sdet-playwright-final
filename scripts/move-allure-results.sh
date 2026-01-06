#!/bin/bash

# Script zum Verschieben von Allure Results ins reports/allure Verzeichnis

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$PROJECT_ROOT/allure-results"
TARGET_DIR="$PROJECT_ROOT/reports/allure/allure-results"

# Erstelle das Zielverzeichnis, falls es nicht existiert
mkdir -p "$PROJECT_ROOT/reports/allure"

# Wenn der Source-Ordner existiert, verschiebe ihn
if [ -d "$SOURCE_DIR" ]; then
  # Lösche das alte Zielverzeichnis, falls es existiert
  if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
  fi
  # Verschiebe den Ordner
  mv "$SOURCE_DIR" "$TARGET_DIR"
  echo "✓ Allure Results verschoben zu: $TARGET_DIR"
else
  echo "✓ Kein allure-results Ordner im Root gefunden"
fi
