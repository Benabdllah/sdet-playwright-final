#!/bin/bash

# ============================================================================
# Cleanup Management Script für SDET Test Framework
# ============================================================================
# Verwaltet temporäre und persistente Test-Artifacts nach Test-Runs
# 
# Struktur:
# ✅ test-results/          - TEMP (löschen ok)
# ✅ reports/              - PERSISTENT (speichern)
# ✅ artifacts/            - PERSISTENT (speichern)
#
# ============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Funktionen
# ============================================================================

print_header() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

get_dir_size() {
  if [ -d "$1" ]; then
    du -sh "$1" | cut -f1
  else
    echo "0B"
  fi
}

# ============================================================================
# Status Report
# ============================================================================

show_status() {
  print_header "📊 Cleanup Status Report"
  
  echo -e "${BLUE}Verzeichnis${NC} | ${BLUE}Größe${NC} | ${BLUE}Typ${NC}"
  echo "────────────────────────────────────────────────"
  
  if [ -d "$PROJECT_ROOT/test-results" ]; then
    size=$(get_dir_size "$PROJECT_ROOT/test-results")
    echo "test-results/ | $size | ❌ TEMP"
  else
    echo "test-results/ | --- | (nicht vorhanden)"
  fi
  
  if [ -d "$PROJECT_ROOT/reports" ]; then
    size=$(get_dir_size "$PROJECT_ROOT/reports")
    echo "reports/      | $size | ✅ PERSISTENT"
  else
    echo "reports/      | --- | (nicht vorhanden)"
  fi
  
  if [ -d "$PROJECT_ROOT/artifacts" ]; then
    size=$(get_dir_size "$PROJECT_ROOT/artifacts")
    echo "artifacts/    | $size | ✅ PERSISTENT"
  else
    echo "artifacts/    | --- | (nicht vorhanden)"
  fi
  
  echo ""
}

# ============================================================================
# Cleanup Functions
# ============================================================================

clean_test_results() {
  print_header "🧹 Cleaning test-results/ (TEMP)"
  
  if [ -d "$PROJECT_ROOT/test-results" ]; then
    size=$(get_dir_size "$PROJECT_ROOT/test-results")
    print_warning "Lösche test-results/ ($size)..."
    rm -rf "$PROJECT_ROOT/test-results"
    print_success "test-results/ gelöscht"
  else
    print_success "test-results/ existiert nicht"
  fi
}

clean_reports() {
  print_header "🧹 Cleaning reports/ (PERSISTENT!)"
  
  if [ -d "$PROJECT_ROOT/reports" ]; then
    print_error "⚠️  WARNUNG: reports/ ist PERSISTENT und sollte NICHT gelöscht werden!"
    print_error "Nur Reports älter als N Tage löschen? (nicht implementiert)"
    echo ""
    read -p "Wirklich reports/ löschen? (ja/nein): " response
    if [ "$response" = "ja" ]; then
      size=$(get_dir_size "$PROJECT_ROOT/reports")
      print_warning "Lösche reports/ ($size)..."
      rm -rf "$PROJECT_ROOT/reports"
      print_success "reports/ gelöscht"
    else
      print_success "Abgebrochen"
    fi
  else
    print_success "reports/ existiert nicht"
  fi
}

clean_artifacts() {
  print_header "🧹 Cleaning artifacts/ (PERSISTENT!)"
  
  if [ -d "$PROJECT_ROOT/artifacts" ]; then
    print_error "⚠️  WARNUNG: artifacts/ ist PERSISTENT und sollte NICHT gelöscht werden!"
    print_error "Nur Artifacts älter als N Tage löschen? (nicht implementiert)"
    echo ""
    read -p "Wirklich artifacts/ löschen? (ja/nein): " response
    if [ "$response" = "ja" ]; then
      size=$(get_dir_size "$PROJECT_ROOT/artifacts")
      print_warning "Lösche artifacts/ ($size)..."
      rm -rf "$PROJECT_ROOT/artifacts"
      print_success "artifacts/ gelöscht"
    else
      print_success "Abgebrochen"
    fi
  else
    print_success "artifacts/ existiert nicht"
  fi
}

clean_all() {
  print_header "🗑️  Full Cleanup (test-results + reports + artifacts)"
  
  print_error "⚠️  WARNUNG: Dies löscht ALLE Daten!"
  echo "Das wird gelöscht:"
  echo "  • test-results/ (TEMP)"
  echo "  • reports/ (PERSISTENT)"
  echo "  • artifacts/ (PERSISTENT)"
  echo ""
  read -p "Wirklich alles löschen? (ja/nein): " response
  
  if [ "$response" = "ja" ]; then
    clean_test_results
    clean_reports
    clean_artifacts
    print_success "Vollständiger Cleanup abgeschlossen"
  else
    print_success "Abgebrochen"
  fi
}

clean_selective() {
  print_header "🎯 Selektiver Cleanup"
  
  echo "Was möchtest du löschen?"
  echo "1) Nur test-results/ (TEMP - SICHER)"
  echo "2) Nur reports/ (PERSISTENT - VORSICHT!)"
  echo "3) Nur artifacts/ (PERSISTENT - VORSICHT!)"
  echo "4) Alles (PERSISTENT + TEMP - GEFÄHRLICH!)"
  echo "0) Abbrechen"
  echo ""
  read -p "Wähle Option: " choice
  
  case $choice in
    1) clean_test_results ;;
    2) clean_reports ;;
    3) clean_artifacts ;;
    4) clean_all ;;
    0) print_success "Abgebrochen" ;;
    *) print_error "Ungültige Option" ;;
  esac
}

archive_reports() {
  print_header "📦 Archivieren von reports/"
  
  if [ ! -d "$PROJECT_ROOT/reports" ]; then
    print_warning "reports/ existiert nicht"
    return
  fi
  
  archive_dir="$PROJECT_ROOT/.archive"
  mkdir -p "$archive_dir"
  
  timestamp=$(date +"%Y%m%d_%H%M%S")
  archive_file="$archive_dir/reports_${timestamp}.tar.gz"
  
  print_warning "Archiviere reports/ → $archive_file"
  tar -czf "$archive_file" -C "$PROJECT_ROOT" reports/
  
  size=$(get_dir_size "$archive_file")
  print_success "Archiv erstellt: $size"
}

# ============================================================================
# Main Menu
# ============================================================================

show_menu() {
  print_header "🧹 SDET Cleanup Management"
  
  show_status
  
  echo -e "${BLUE}Optionen:${NC}"
  echo "1) Status zeigen"
  echo "2) Nur test-results/ löschen (SICHER)"
  echo "3) Selektiver Cleanup"
  echo "4) Reports archivieren (vorher sichern)"
  echo "5) Alle löschen"
  echo "0) Beenden"
  echo ""
  read -p "Wähle Option: " choice
  
  case $choice in
    1) show_status ;;
    2) clean_test_results ;;
    3) clean_selective ;;
    4) archive_reports ;;
    5) clean_all ;;
    0) print_success "Auf Wiedersehen!"; exit 0 ;;
    *) print_error "Ungültige Option" ;;
  esac
}

# ============================================================================
# Entry Point
# ============================================================================

if [ $# -eq 0 ]; then
  # Interaktiver Modus
  while true; do
    show_menu
    echo ""
    read -p "Drücke Enter für Hauptmenü..."
  done
else
  # CLI Modus
  case "$1" in
    status)
      show_status
      ;;
    clean:test-results)
      clean_test_results
      ;;
    clean:reports)
      clean_reports
      ;;
    clean:artifacts)
      clean_artifacts
      ;;
    clean:all)
      clean_all
      ;;
    archive:reports)
      archive_reports
      ;;
    *)
      echo "Verwendung:"
      echo "  $0                          # Interaktiver Modus"
      echo "  $0 status                   # Status anzeigen"
      echo "  $0 clean:test-results       # Nur test-results/ löschen"
      echo "  $0 clean:reports            # Nur reports/ löschen"
      echo "  $0 clean:artifacts          # Nur artifacts/ löschen"
      echo "  $0 clean:all                # Alles löschen"
      echo "  $0 archive:reports          # reports/ archivieren"
      exit 1
      ;;
  esac
fi

print_success "Fertig!"
