/**
 * Zentralisierte Export-Datei für alle Helper-Funktionen
 * 
 * Importiere Helper direkt aus diesem Modul statt aus einzelnen Dateien:
 * 
 * ❌ NICHT: import { ValidationHelper } from '@helpers/validation-helper'
 * ✅ JA: import { ValidationHelper } from '@helpers'
 * 
 * Diese Struktur bietet bessere Wartbarkeit und DX
 */

// ============================================================================
// Alert & Dialog Helpers
// ============================================================================
export { handleAlert, handlePrompt } from '@helpers/alert-helper';

// ============================================================================
// Assertion Helpers
// ============================================================================
export { AssertionHelper } from './assertion-helper';

// ============================================================================
// Authentication Helpers
// ============================================================================
export { AuthHelper, AuthMethod, SocialProvider, MFAMethod } from './auth-helper';

// ============================================================================
// Base Helpers
// ============================================================================
// Re-export everything from base-helper if needed
// Currently no public exports

// ============================================================================
// Checkbox Helpers
// ============================================================================
// Re-export everything from checkbox-helper if needed
// Currently no public exports

// ============================================================================
// Data Helpers
// ============================================================================
export { DataHelper, TestDataBuilder, DataSource, DataType } from './data-helper';

// ============================================================================
// Dropdown Helpers
// ============================================================================
// Re-export everything from dropdown-helper if needed
// Currently no public exports

// ============================================================================
// File Download Helpers
// ============================================================================
// Re-export everything from file-download-helper if needed
// Currently no public exports

// ============================================================================
// File Upload Helpers
// ============================================================================
// Re-export everything from file-upload-helper if needed
// Currently no public exports

// ============================================================================
// Frame Click Helpers
// ============================================================================
// Re-export everything from frame-click-helper if needed
// Currently no public exports

// ============================================================================
// Frame Helpers
// ============================================================================
// Re-export everything from frame-helper if needed
// Currently no public exports

// ============================================================================
// Frame Inspector Helpers
// ============================================================================
// Re-export everything from frame-inspector-helper if needed
// Currently no public exports

// ============================================================================
// Lazy Loading Helpers
// ============================================================================
// Re-export everything from lazy-loading-helper if needed
// Currently no public exports

// ============================================================================
// Modal Helpers
// ============================================================================
// Re-export everything from modal-helper if needed
// Currently no public exports

// ============================================================================
// Navigation Helpers
// ============================================================================
// Re-export everything from navigation-helper if needed
// Currently no public exports

// ============================================================================
// PDF Download Helpers
// ============================================================================
// Re-export everything from pdf-download-helper if needed
// Currently no public exports

// ============================================================================
// Screenshot Helpers
// ============================================================================
// Re-export everything from screenshot-helper if needed
// Currently no public exports

// ============================================================================
// Storage Helpers
// ============================================================================
// Re-export everything from storage-helper if needed
// Currently no public exports

// ============================================================================
// Table CSV Helpers
// ============================================================================
// Re-export everything from table-csv-helper if needed
// Currently no public exports

// ============================================================================
// Table Helpers
// ============================================================================
export {
  getRowCount,
  getColumnCount,
  getRowByCellText,
  checkCheckboxInRow,
  uncheckCheckboxInRow,
  getCellText,
  clickButtonInRow,
} from './table-helper';

// ============================================================================
// Validation Helpers
// ============================================================================
export { ValidationHelper } from './validation-helper';
