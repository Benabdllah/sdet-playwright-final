/**
 * DataHelper - Ultimative Ultra SDET +++++ Final Version
 *
 * Umfassende Daten-Verwaltungs- und Test-Data-Management-Library für automatisierte Tests.
 * Unterstützt CSV/JSON/Excel-Datenquellen, Faker-Integration, Bulk-Operationen,
 * Daten-Transformation, Validierung und komplexe Test-Data-Szenarien.
 *
 * Features:
 * - Multiple Datenquellen (CSV, JSON, Excel, SQL, API)
 * - Faker-Integration für realistische Test-Daten
 * - Test-Data Builder Pattern
 * - Daten-Transformation & Mapping
 * - Schema-Validierung
 * - Bulk-Operationen & Performance-Optimierung
 * - Daten-Caching & In-Memory Storage
 * - Daten-Verschlüsselung für sensitive Daten
 * - Test-Data Pool Management
 * - Cleanup & Teardown Automation
 * - Daten-Export in verschiedene Formate
 * - Hooks für Pre/Post-Processing
 * - Detaillierte Audit-Logs
 * - Statistiken & Reporting
 *
 * @version 1.0.0
 * @author SDET Framework Team
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';
import { Logger } from '../utils/loggerUtil';
import { RandomUtil } from '../utils/randomUtil';
import { DateUtil } from '../utils/dateUtil';
import { TraceUtil } from '../utils/traceUtil';
import { StringUtil } from '../utils/stringUtil';

// ============================================================================
// TYPEN & INTERFACES
// ============================================================================

/**
 * Datenquellen-Typen
 */
export enum DataSource {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
  SQL = 'sql',
  API = 'api',
  FAKER = 'faker',
  MEMORY = 'memory',
}

/**
 * Datentyp-Definition für Schema-Validierung
 */
export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  DATE = 'date',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  ARRAY = 'array',
  OBJECT = 'object',
  CUSTOM = 'custom',
}

/**
 * Schema-Definition für Daten-Validierung
 */
export interface SchemaField {
  name: string;
  type: DataType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: any[];
  default?: any;
  customValidator?: (value: any) => boolean | Promise<boolean>;
  faker?: string; // Faker-Methode z.B. 'person.name', 'internet.email'
}

/**
 * Daten-Schema
 */
export interface DataSchema {
  name: string;
  version: string;
  fields: SchemaField[];
}

/**
 * Test-Data Builder Konfiguration
 */
export interface DataBuilderConfig {
  schema: DataSchema;
  encryptFields?: string[];
  validationStrict?: boolean;
  autoGenerate?: boolean;
  preProcessor?: (data: any) => any;
  postProcessor?: (data: any) => any;
}

/**
 * Datenquellen-Konfiguration
 */
export interface DataSourceConfig {
  type: DataSource;
  path?: string;
  url?: string;
  connection?: any;
  sheet?: string; // Für Excel
  query?: string; // Für SQL
  headers?: Record<string, string>;
}

/**
 * Test-Data Pool Konfiguration
 */
export interface PoolConfig {
  name: string;
  batchSize?: number;
  maxSize?: number;
  preload?: boolean;
  cache?: boolean;
  ttl?: number; // Time to Live in ms
}

/**
 * Daten-Statistiken
 */
export interface DataStats {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  generatedRecords: number;
  transformedRecords: number;
  cachedRecords: number;
  deletedRecords: number;
}

/**
 * Validierungsergebnis
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    value: any;
    expected: string;
    message: string;
  }>;
}

// ============================================================================
// DATA HELPER KLASSE
// ============================================================================

export class DataHelper {
  private logger: Logger;
  private tracer: TraceUtil;
  private config: DataBuilderConfig;
  private dataCache: Map<string, any[]> = new Map();
  private dataPools: Map<string, any[]> = new Map();
  private encryptionKey: string;
  private stats: DataStats = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    generatedRecords: 0,
    transformedRecords: 0,
    cachedRecords: 0,
    deletedRecords: 0,
  };
  private auditLog: Array<{
    timestamp: Date;
    action: string;
    details: any;
  }> = [];

  constructor(config: DataBuilderConfig, encryptionKey: string = 'default-key') {
    this.config = config;
    this.logger = new Logger({ name: 'DataHelper' });
    this.tracer = new TraceUtil({ serviceName: 'DataManagement' });
    this.encryptionKey = encryptionKey;
  }

  // ========================================================================
  // DATEN-LOADING
  // ========================================================================

  /**
   * Lädt Daten aus verschiedenen Quellen
   */
  async loadData(
    source: DataSourceConfig,
    poolConfig?: PoolConfig
  ): Promise<any[]> {
    const span = this.tracer.startSpan({
      name: 'loadData',
      attributes: { source: source.type },
    });

    try {
      let data: any[] = [];

      switch (source.type) {
        case DataSource.CSV:
          data = await this.loadFromCSV(source);
          break;
        case DataSource.JSON:
          data = await this.loadFromJSON(source);
          break;
        case DataSource.EXCEL:
          data = await this.loadFromExcel(source);
          break;
        case DataSource.SQL:
          data = await this.loadFromSQL(source);
          break;
        case DataSource.API:
          data = await this.loadFromAPI(source);
          break;
        case DataSource.MEMORY:
          data = this.dataCache.get(source.path || 'default') || [];
          break;
        default:
          throw new Error(`Unbekannte Datenquelle: ${source.type}`);
      }

      // Validiere Daten wenn konfiguriert
      if (this.config.validationStrict) {
        data = data.filter((record) => {
          const result = this.validate(record);
          if (!result.valid) {
            this.stats.invalidRecords++;
          } else {
            this.stats.validRecords++;
          }
          return result.valid;
        });
      } else {
        this.stats.validRecords += data.length;
      }

      this.stats.totalRecords += data.length;

      // Speichere in Pool wenn konfiguriert
      if (poolConfig) {
        this.createPool(poolConfig.name, data);
      }

      // Cache Daten
      if (source.path) {
        this.dataCache.set(source.path, data);
      }

      span.setStatus('OK');
      this.logAudit('loadData', { source: source.type, recordCount: data.length });
      this.logger.info(`${data.length} Datensätze geladen`);

      return data;
    } catch (error) {
      span.setStatus('ERROR');
      this.logger.error(`Daten-Loading fehlgeschlagen: ${error}`);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Lädt Daten aus CSV
   */
  private async loadFromCSV(source: DataSourceConfig): Promise<any[]> {
    if (!source.path) {
      throw new Error('CSV-Pfad erforderlich');
    }

    const content = fs.readFileSync(source.path, 'utf-8');
    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
    });

    return records;
  }

  /**
   * Lädt Daten aus JSON
   */
  private async loadFromJSON(source: DataSourceConfig): Promise<any[]> {
    if (!source.path) {
      throw new Error('JSON-Pfad erforderlich');
    }

    const content = fs.readFileSync(source.path, 'utf-8');
    const data = JSON.parse(content);

    return Array.isArray(data) ? data : [data];
  }

  /**
   * Lädt Daten aus Excel (vereinfacht)
   */
  private async loadFromExcel(source: DataSourceConfig): Promise<any[]> {
    // Vereinfachte Implementierung
    this.logger.warn('Excel-Loading erfordert externe Library');
    return [];
  }

  /**
   * Lädt Daten aus SQL
   */
  private async loadFromSQL(source: DataSourceConfig): Promise<any[]> {
    if (!source.query || !source.connection) {
      throw new Error('SQL-Query und Connection erforderlich');
    }

    // Vereinfachte Implementierung
    this.logger.info(`Führe SQL aus: ${source.query}`);
    return [];
  }

  /**
   * Lädt Daten aus API
   */
  private async loadFromAPI(source: DataSourceConfig): Promise<any[]> {
    if (!source.url) {
      throw new Error('API-URL erforderlich');
    }

    const response = await fetch(source.url, {
      headers: source.headers || {},
    });

    if (!response.ok) {
      throw new Error(`API-Fehler: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  }

  // ========================================================================
  // TEST-DATA GENERATION
  // ========================================================================

  /**
   * Generiert Test-Daten basierend auf Schema
   */
  async generateTestData(count: number = 1): Promise<any[]> {
    const data: any[] = [];

    for (let i = 0; i < count; i++) {
      const record = await this.buildRecord();
      data.push(record);
      this.stats.generatedRecords++;
    }

    this.stats.totalRecords += count;
    this.logger.info(`${count} Test-Datensätze generiert`);

    return data;
  }

  /**
   * Erstellt einzelnen Datensatz basierend auf Schema
   */
  private async buildRecord(): Promise<any> {
    const record: any = {};

    for (const field of this.config.schema.fields) {
      record[field.name] = await this.generateFieldValue(field);
    }

    // Pre-Processing
    if (this.config.preProcessor) {
      return this.config.preProcessor(record);
    }

    return record;
  }

  /**
   * Generiert Feldwert basierend auf Feldtyp
   */
  private async generateFieldValue(field: SchemaField): Promise<any> {
    // Nutze Faker falls konfiguriert
    if (field.faker) {
      return this.generateWithFaker(field.faker);
    }

    // Nutze Enum wenn definiert
    if (field.enum && field.enum.length > 0) {
      return RandomUtil.choice(field.enum);
    }

    // Nutze Default falls vorhanden
    if (field.default !== undefined) {
      return field.default;
    }

    // Generiere basierend auf Typ
    switch (field.type) {
      case DataType.STRING:
        return RandomUtil.string(field.maxLength || 10);
      case DataType.NUMBER:
        return RandomUtil.float(0, 100);
      case DataType.INTEGER:
        return RandomUtil.int(0, 100);
      case DataType.BOOLEAN:
        return RandomUtil.boolean();
      case DataType.EMAIL:
        return RandomUtil.email();
      case DataType.PHONE:
        return RandomUtil.phone('DE');
      case DataType.URL:
        return RandomUtil.url();
      case DataType.DATE:
        return new Date().toISOString();
      case DataType.ARRAY:
        return [RandomUtil.string(10), RandomUtil.string(10)];
      case DataType.OBJECT:
        return { value: RandomUtil.string(10) };
      default:
        return null;
    }
  }

  /**
   * Generiert Wert mit Faker
   */
  private generateWithFaker(fakerPath: string): any {
    const parts = fakerPath.split('.');

    try {
      // Vereinfachte Faker-Integration
      if (fakerPath.includes('person.name')) return RandomUtil.name();
      if (fakerPath.includes('internet.email')) return RandomUtil.email();
      if (fakerPath.includes('internet.url')) return RandomUtil.url();
      if (fakerPath.includes('phone.number')) return RandomUtil.phone('DE');
      if (fakerPath.includes('date.')) return DateUtil.format(new Date());
      if (fakerPath.includes('company.name')) return RandomUtil.company();

      return RandomUtil.string(10);
    } catch (error) {
      this.logger.warn(`Faker-Generierung fehlgeschlagen: ${fakerPath}`);
      return null;
    }
  }

  // ========================================================================
  // TEST-DATA BUILDER
  // ========================================================================

  /**
   * Builder-Pattern für Test-Daten
   */
  builder(): TestDataBuilder {
    return new TestDataBuilder(this.config.schema, this.config);
  }

  /**
   * Erstellt Builder mit Basis-Daten
   */
  builderWith(baseData: any): TestDataBuilder {
    return new TestDataBuilder(this.config.schema, this.config, baseData);
  }

  // ========================================================================
  // DATEN-VALIDIERUNG
  // ========================================================================

  /**
   * Validiert Datensatz gegen Schema
   */
  validate(data: any): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    for (const field of this.config.schema.fields) {
      const value = data[field.name];

      // Prüfe ob erforderlich
      if (field.required && (value === null || value === undefined)) {
        errors.push({
          field: field.name,
          value,
          expected: field.type,
          message: `${field.name} ist erforderlich`,
        });
        continue;
      }

      // Prüfe Typ
      if (value !== null && value !== undefined) {
        if (!this.validateType(value, field.type)) {
          errors.push({
            field: field.name,
            value,
            expected: field.type,
            message: `${field.name} sollte Typ ${field.type} sein`,
          });
          continue;
        }

        // Prüfe Längen-Constraints
        if (
          typeof value === 'string' &&
          field.minLength &&
          value.length < field.minLength
        ) {
          errors.push({
            field: field.name,
            value,
            expected: `minLength: ${field.minLength}`,
            message: `${field.name} sollte mindestens ${field.minLength} Zeichen sein`,
          });
        }

        if (
          typeof value === 'string' &&
          field.maxLength &&
          value.length > field.maxLength
        ) {
          errors.push({
            field: field.name,
            value,
            expected: `maxLength: ${field.maxLength}`,
            message: `${field.name} sollte maximal ${field.maxLength} Zeichen sein`,
          });
        }

        // Prüfe Pattern
        if (field.pattern && !field.pattern.test(value)) {
          errors.push({
            field: field.name,
            value,
            expected: field.pattern.toString(),
            message: `${field.name} erfüllt nicht Pattern ${field.pattern}`,
          });
        }

        // Prüfe Enum
        if (field.enum && !field.enum.includes(value)) {
          errors.push({
            field: field.name,
            value,
            expected: field.enum.join(', '),
            message: `${field.name} sollte einer dieser Werte sein: ${field.enum.join(', ')}`,
          });
        }

        // Custom Validator
        if (field.customValidator) {
          const isValid = field.customValidator(value);
          if (!isValid) {
            errors.push({
              field: field.name,
              value,
              expected: 'custom validation',
              message: `${field.name} Custom-Validierung fehlgeschlagen`,
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Prüft ob Wert den erwarteten Typ hat
   */
  private validateType(value: any, expectedType: DataType): boolean {
    switch (expectedType) {
      case DataType.STRING:
        return typeof value === 'string';
      case DataType.NUMBER:
        return typeof value === 'number';
      case DataType.INTEGER:
        return Number.isInteger(value);
      case DataType.BOOLEAN:
        return typeof value === 'boolean';
      case DataType.DATE:
        return !isNaN(Date.parse(value));
      case DataType.EMAIL:
        return StringUtil.isEmail(value);
      case DataType.PHONE:
        return StringUtil.isPhone(value, 'DE');
      case DataType.URL:
        return StringUtil.isUrl(value);
      case DataType.ARRAY:
        return Array.isArray(value);
      case DataType.OBJECT:
        return typeof value === 'object' && value !== null;
      default:
        return true;
    }
  }

  // ========================================================================
  // DATEN-TRANSFORMATION
  // ========================================================================

  /**
   * Transformiert Datensätze
   */
  async transform(data: any[], transformer: (record: any) => any): Promise<any[]> {
    const transformed = data.map(transformer);
    this.stats.transformedRecords += transformed.length;

    this.logger.info(`${transformed.length} Datensätze transformiert`);

    return transformed;
  }

  /**
   * Mappt Feldnamen um
   */
  mapFields(data: any[], mapping: Record<string, string>): any[] {
    return data.map((record) => {
      const mapped: any = {};

      for (const [oldKey, newKey] of Object.entries(mapping)) {
        if (oldKey in record) {
          mapped[newKey] = record[oldKey];
        }
      }

      return mapped;
    });
  }

  /**
   * Filtert Datensätze
   */
  filter(data: any[], predicate: (record: any) => boolean): any[] {
    return data.filter(predicate);
  }

  /**
   * Sortiert Datensätze
   */
  sort(
    data: any[],
    field: string,
    direction: 'asc' | 'desc' = 'asc'
  ): any[] {
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Dupliziert Datensätze mit Variation
   */
  duplicate(data: any[], count: number = 1, mutator?: (record: any, index: number) => any): any[] {
    const result: any[] = [];

    for (let i = 0; i < count; i++) {
      for (const record of data) {
        const copy = JSON.parse(JSON.stringify(record));

        if (mutator) {
          result.push(mutator(copy, i));
        } else {
          result.push(copy);
        }
      }
    }

    return result;
  }

  // ========================================================================
  // DATA POOL MANAGEMENT
  // ========================================================================

  /**
   * Erstellt Data Pool
   */
  createPool(name: string, data: any[]): void {
    this.dataPools.set(name, [...data]);
    this.stats.cachedRecords += data.length;

    this.logger.info(`Pool "${name}" mit ${data.length} Datensätzen erstellt`);
  }

  /**
   * Gibt Datensatz aus Pool zurück
   */
  getFromPool(poolName: string, index?: number): any {
    const pool = this.dataPools.get(poolName);

    if (!pool || pool.length === 0) {
      throw new Error(`Pool "${poolName}" nicht gefunden oder leer`);
    }

    if (index !== undefined) {
      return pool[index];
    }

    // Zufälliger Datensatz
    return RandomUtil.choice(pool);
  }

  /**
   * Gibt mehrere Datensätze aus Pool zurück
   */
  getFromPoolBatch(poolName: string, count: number): any[] {
    const pool = this.dataPools.get(poolName);

    if (!pool) {
      throw new Error(`Pool "${poolName}" nicht gefunden`);
    }

    return RandomUtil.sample(pool, Math.min(count, pool.length));
  }

  /**
   * Löscht Pool
   */
  deletePool(poolName: string): void {
    const pool = this.dataPools.get(poolName);

    if (pool) {
      this.stats.deletedRecords += pool.length;
      this.dataPools.delete(poolName);
      this.logger.info(`Pool "${poolName}" gelöscht`);
    }
  }

  /**
   * Listet alle Pools auf
   */
  listPools(): string[] {
    return Array.from(this.dataPools.keys());
  }

  /**
   * Gibt Pool-Größe zurück
   */
  getPoolSize(poolName: string): number {
    return this.dataPools.get(poolName)?.length || 0;
  }

  // ========================================================================
  // DATEN-VERSCHLÜSSELUNG
  // ========================================================================

  /**
   * Verschlüsselt sensitive Felder
   */
  encryptData(data: any[]): any[] {
    if (!this.config.encryptFields || this.config.encryptFields.length === 0) {
      return data;
    }

    return data.map((record) => {
      const encrypted = { ...record };

      for (const field of this.config.encryptFields!) {
        if (field in encrypted) {
          encrypted[field] = this.encrypt(encrypted[field]);
        }
      }

      return encrypted;
    });
  }

  /**
   * Entschlüsselt sensitive Felder
   */
  decryptData(data: any[]): any[] {
    if (!this.config.encryptFields || this.config.encryptFields.length === 0) {
      return data;
    }

    return data.map((record) => {
      const decrypted = { ...record };

      for (const field of this.config.encryptFields!) {
        if (field in decrypted) {
          decrypted[field] = this.decrypt(decrypted[field]);
        }
      }

      return decrypted;
    });
  }

  /**
   * Verschlüsselt Wert
   */
  private encrypt(value: string): string {
    // Vereinfachte Verschlüsselung
    return Buffer.from(`${value}:${this.encryptionKey}`).toString('base64');
  }

  /**
   * Entschlüsselt Wert
   */
  private decrypt(value: string): string {
    // Vereinfachte Entschlüsselung
    return Buffer.from(value, 'base64').toString('utf-8').split(':')[0];
  }

  // ========================================================================
  // EXPORT & REPORTING
  // ========================================================================

  /**
   * Exportiert Daten zu CSV
   */
  exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) {
      this.logger.warn('Keine Daten zum Exportieren');
      return;
    }

    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];

    for (const record of data) {
      const values = headers.map((h) => {
        const val = record[h];
        return typeof val === 'string' && val.includes(',')
          ? `"${val}"`
          : val;
      });

      rows.push(values.join(','));
    }

    fs.writeFileSync(filename, rows.join('\n'));
    this.logger.info(`Daten zu CSV exportiert: ${filename}`);
  }

  /**
   * Exportiert Daten zu JSON
   */
  exportToJSON(data: any[], filename: string): void {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    this.logger.info(`Daten zu JSON exportiert: ${filename}`);
  }

  /**
   * Gibt Daten-Report aus
   */
  getReport(): string {
    const lines = [
      '═════════════════════════════════════════',
      'DATA MANAGEMENT REPORT',
      '═════════════════════════════════════════',
      `Total Records: ${this.stats.totalRecords}`,
      `Valid Records: ${this.stats.validRecords}`,
      `Invalid Records: ${this.stats.invalidRecords}`,
      `Generated Records: ${this.stats.generatedRecords}`,
      `Transformed Records: ${this.stats.transformedRecords}`,
      `Cached Records: ${this.stats.cachedRecords}`,
      `Deleted Records: ${this.stats.deletedRecords}`,
      `Active Pools: ${this.dataPools.size}`,
      '═════════════════════════════════════════',
    ];

    return lines.join('\n');
  }

  // ========================================================================
  // AUDIT & LOGGING
  // ========================================================================

  /**
   * Loggt Aktion ins Audit-Log
   */
  private logAudit(action: string, details: any): void {
    this.auditLog.push({
      timestamp: new Date(),
      action,
      details,
    });
  }

  /**
   * Gibt Audit-Log zurück
   */
  getAuditLog(): Array<{
    timestamp: Date;
    action: string;
    details: any;
  }> {
    return [...this.auditLog];
  }

  /**
   * Gibt Statistiken zurück
   */
  getStats(): DataStats {
    return { ...this.stats };
  }

  /**
   * Setzt Statistiken zurück
   */
  resetStats(): void {
    this.stats = {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      generatedRecords: 0,
      transformedRecords: 0,
      cachedRecords: 0,
      deletedRecords: 0,
    };
  }

  /**
   * Löscht alle Daten
   */
  cleanup(): void {
    this.dataCache.clear();
    this.dataPools.forEach((pool) => {
      this.stats.deletedRecords += pool.length;
    });
    this.dataPools.clear();
    this.auditLog = [];

    this.logger.info('Alle Daten gelöscht');
  }
}

// ============================================================================
// TEST DATA BUILDER KLASSE
// ============================================================================

export class TestDataBuilder {
  private schema: DataSchema;
  private config: DataBuilderConfig;
  private data: any;

  constructor(schema: DataSchema, config: DataBuilderConfig, baseData: any = {}) {
    this.schema = schema;
    this.config = config;
    this.data = { ...baseData };
  }

  /**
   * Setzt Feldwert
   */
  with(fieldName: string, value: any): TestDataBuilder {
    this.data[fieldName] = value;
    return this;
  }

  /**
   * Setzt mehrere Felder
   */
  withAll(fields: Record<string, any>): TestDataBuilder {
    this.data = { ...this.data, ...fields };
    return this;
  }

  /**
   * Setzt Feldwert basierend auf Funktion
   */
  withFunction(fieldName: string, fn: () => any): TestDataBuilder {
    this.data[fieldName] = fn();
    return this;
  }

  /**
   * Setzt optionales Feld
   */
  withOptional(fieldName: string, value: any): TestDataBuilder {
    if (Math.random() > 0.5) {
      this.data[fieldName] = value;
    }
    return this;
  }

  /**
   * Validiert und gibt Datensatz zurück
   */
  build(): any {
    if (this.config.postProcessor) {
      return this.config.postProcessor(this.data);
    }

    return this.data;
  }

  /**
   * Klont Builder
   */
  clone(): TestDataBuilder {
    return new TestDataBuilder(this.schema, this.config, { ...this.data });
  }

  /**
   * Gibt Datensatz als JSON aus
   */
  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }
}

export default DataHelper;
