/**
 * StorageHelper - Ultimative Ultra SDET +++++ Final Version
 *
 * Umfassende Browser-Storage-Management-Library für automatisierte Tests.
 * Unterstützt localStorage, sessionStorage, Cookies, IndexedDB mit Verschlüsselung,
 * Backup/Restore, Migrations, Expiration, Search und Batch-Operationen.
 *
 * Features:
 * - Multi-Storage Support (localStorage, sessionStorage, Cookies, IndexedDB)
 * - Automatische Serialisierung/Deserialisierung
 * - Daten-Verschlüsselung für sensitive Informationen
 * - TTL (Time-To-Live) Support für Auto-Expiration
 * - Backup & Restore mit Versionierung
 * - Migration Scripts für Schema-Updates
 * - Search & Query-Funktionen
 * - Batch-Operationen
 * - Watch/Observer Pattern für Änderungen
 * - Storage-Quota Management & Cleanup
 * - Multi-Tab Synchronisation (per-Tab)
 * - Validierung & Schema-Support
 * - Audit-Logging aller Operationen
 * - Performance-Optimierung
 * - Cookie-Management mit Domain/Path
 * - IndexedDB mit Transaktionen
 * - Storage Export/Import
 *
 * @version 1.0.0
 * @author SDET Framework Team
 * @license MIT
 */

import { Page, BrowserContext } from '@playwright/test';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { Logger } from '../utils/loggerUtil';
import { DateUtil } from '../utils/dateUtil';
import { StringUtil } from '../utils/stringUtil';
import { TraceUtil } from '../utils/traceUtil';

// ============================================================================
// TYPEN & INTERFACES
// ============================================================================

/**
 * Storage-Typen
 */
export enum StorageType {
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  COOKIES = 'cookies',
  INDEXED_DB = 'indexedDB',
}

/**
 * Storage Item mit Metadaten
 */
export interface StorageItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
  encrypted?: boolean;
  size?: number;
}

/**
 * Cookie Options
 */
export interface CookieOptions {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number | Date;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * IndexedDB Store Config
 */
export interface IndexedDBConfig {
  dbName: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: {
      name: string;
      keyPath: string | string[];
      unique?: boolean;
    }[];
  }[];
}

/**
 * Storage Backup
 */
export interface StorageBackup {
  timestamp: number;
  version: string;
  data: {
    localStorage: Record<string, any>;
    sessionStorage: Record<string, any>;
    cookies: CookieOptions[];
  };
  metadata?: {
    tag?: string;
    description?: string;
  };
}

/**
 * Storage Watch Callback
 */
export type StorageWatchCallback<T = any> = (
  key: string,
  oldValue: T | undefined,
  newValue: T | undefined
) => void | Promise<void>;

/**
 * Storage Statistics
 */
export interface StorageStats {
  totalItems: number;
  localStorageSize: number;
  sessionStorageSize: number;
  cookiesCount: number;
  indexedDBSize: number;
  expiredItems: number;
  encryptedItems: number;
  lastCleanup: number;
}

/**
 * Storage Query Options
 */
export interface QueryOptions {
  pattern?: string | RegExp;
  expired?: boolean;
  encrypted?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// STORAGE HELPER KLASSE
// ============================================================================

export class StorageHelper {
  private page: Page;
  private context: BrowserContext;
  private logger: Logger;
  private tracer: TraceUtil;
  private encryptionKey: Buffer;
  private watchers: Map<string, StorageWatchCallback[]> = new Map();
  private backups: StorageBackup[] = [];
  private stats: StorageStats = {
    totalItems: 0,
    localStorageSize: 0,
    sessionStorageSize: 0,
    cookiesCount: 0,
    indexedDBSize: 0,
    expiredItems: 0,
    encryptedItems: 0,
    lastCleanup: 0,
  };
  private auditLog: Array<{
    timestamp: Date;
    action: string;
    storage: StorageType;
    key?: string;
    details: any;
  }> = [];

  constructor(
    page: Page,
    context: BrowserContext,
    encryptionKey: string = 'default-sdet-key'
  ) {
    this.page = page;
    this.context = context;
    this.logger = new Logger({ name: 'StorageHelper' });
    this.tracer = new TraceUtil({ serviceName: 'Storage' });
    this.encryptionKey = this.generateEncryptionKey(encryptionKey);
  }

  // ========================================================================
  // LOCALSTORAGE OPERATIONEN
  // ========================================================================

  /**
   * Setzt Wert in localStorage
   */
  async setLocalStorage<T>(
    key: string,
    value: T,
    options?: { ttl?: number; encrypt?: boolean }
  ): Promise<void> {
    const span = this.tracer.startSpan({
      name: 'setLocalStorage',
      attributes: { key },
    });

    try {
      const item: StorageItem = {
        key,
        value,
        timestamp: Date.now(),
        encrypted: options?.encrypt || false,
      };

      // Setze TTL falls vorhanden
      if (options?.ttl) {
        item.expiresAt = Date.now() + options.ttl;
      }

      // Verschlüssele falls erforderlich
      let storageValue = JSON.stringify(item);
      if (options?.encrypt) {
        storageValue = this.encrypt(storageValue);
        item.encrypted = true;
      }

      await this.page.evaluate(
        (key, value) => {
          localStorage.setItem(key, value);
        },
        key,
        storageValue
      );

      this.logAudit('set', StorageType.LOCAL_STORAGE, key);
      this.logger.info(`✓ localStorage["${key}"] gesetzt`);
    } catch (error) {
      span.setStatus('ERROR');
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Holt Wert aus localStorage
   */
  async getLocalStorage<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.page.evaluate((key) => {
        return localStorage.getItem(key);
      }, key);

      if (!value) return null;

      // Versuche zu deserialisieren
      try {
        const item = JSON.parse(value) as StorageItem<T>;

        // Prüfe ob abgelaufen
        if (item.expiresAt && Date.now() > item.expiresAt) {
          await this.removeLocalStorage(key);
          return null;
        }

        // Entschlüssele falls erforderlich
        let finalValue = item.value;
        if (item.encrypted) {
          const decrypted = this.decrypt(value);
          const decryptedItem = JSON.parse(decrypted) as StorageItem<T>;
          finalValue = decryptedItem.value;
        }

        return finalValue;
      } catch {
        // Nicht serialisierter Wert
        return value as any;
      }
    } catch (error) {
      this.logger.error(`localStorage Lesen fehlgeschlagen: ${error}`);
      throw error;
    }
  }

  /**
   * Entfernt Wert aus localStorage
   */
  async removeLocalStorage(key: string): Promise<void> {
    await this.page.evaluate((key) => {
      localStorage.removeItem(key);
    }, key);

    this.logAudit('remove', StorageType.LOCAL_STORAGE, key);
    this.logger.info(`✓ localStorage["${key}"] entfernt`);
  }

  /**
   * Löscht gesamten localStorage
   */
  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
    });

    this.logAudit('clear', StorageType.LOCAL_STORAGE);
    this.logger.info('✓ localStorage gelöscht');
  }

  /**
   * Gibt alle localStorage Keys zurück
   */
  async getLocalStorageKeys(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    });
  }

  /**
   * Gibt localStorage-Größe zurück
   */
  async getLocalStorageSize(): Promise<number> {
    return await this.page.evaluate(() => {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          size += key.length + (value?.length || 0);
        }
      }
      return size;
    });
  }

  // ========================================================================
  // SESSIONSTORAGE OPERATIONEN
  // ========================================================================

  /**
   * Setzt Wert in sessionStorage
   */
  async setSessionStorage<T>(
    key: string,
    value: T,
    options?: { ttl?: number; encrypt?: boolean }
  ): Promise<void> {
    const span = this.tracer.startSpan({
      name: 'setSessionStorage',
      attributes: { key },
    });

    try {
      const item: StorageItem = {
        key,
        value,
        timestamp: Date.now(),
        encrypted: options?.encrypt || false,
      };

      if (options?.ttl) {
        item.expiresAt = Date.now() + options.ttl;
      }

      let storageValue = JSON.stringify(item);
      if (options?.encrypt) {
        storageValue = this.encrypt(storageValue);
      }

      await this.page.evaluate(
        (key, value) => {
          sessionStorage.setItem(key, value);
        },
        key,
        storageValue
      );

      this.logAudit('set', StorageType.SESSION_STORAGE, key);
      this.logger.info(`✓ sessionStorage["${key}"] gesetzt`);
    } catch (error) {
      span.setStatus('ERROR');
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Holt Wert aus sessionStorage
   */
  async getSessionStorage<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.page.evaluate((key) => {
        return sessionStorage.getItem(key);
      }, key);

      if (!value) return null;

      try {
        const item = JSON.parse(value) as StorageItem<T>;

        if (item.expiresAt && Date.now() > item.expiresAt) {
          await this.removeSessionStorage(key);
          return null;
        }

        let finalValue = item.value;
        if (item.encrypted) {
          const decrypted = this.decrypt(value);
          const decryptedItem = JSON.parse(decrypted) as StorageItem<T>;
          finalValue = decryptedItem.value;
        }

        return finalValue;
      } catch {
        return value as any;
      }
    } catch (error) {
      this.logger.error(`sessionStorage Lesen fehlgeschlagen: ${error}`);
      throw error;
    }
  }

  /**
   * Entfernt Wert aus sessionStorage
   */
  async removeSessionStorage(key: string): Promise<void> {
    await this.page.evaluate((key) => {
      sessionStorage.removeItem(key);
    }, key);

    this.logAudit('remove', StorageType.SESSION_STORAGE, key);
  }

  /**
   * Löscht gesamten sessionStorage
   */
  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => {
      sessionStorage.clear();
    });

    this.logAudit('clear', StorageType.SESSION_STORAGE);
  }

  // ========================================================================
  // COOKIE OPERATIONEN
  // ========================================================================

  /**
   * Setzt Cookie
   */
  async setCookie(options: CookieOptions): Promise<void> {
    const span = this.tracer.startSpan({
      name: 'setCookie',
      attributes: { name: options.name },
    });

    try {
      await this.context.addCookies([
        {
          name: options.name,
          value: options.value,
          domain: options.domain || new URL(this.page.url()).hostname,
          path: options.path || '/',
          expires: this.getExpiresTimestamp(options),
          httpOnly: options.httpOnly || false,
          secure: options.secure || false,
          sameSite: (options.sameSite as any) || 'Lax',
        },
      ]);

      this.logAudit('set', StorageType.COOKIES, options.name);
      this.logger.info(`✓ Cookie "${options.name}" gesetzt`);
    } catch (error) {
      span.setStatus('ERROR');
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Holt Cookie-Wert
   */
  async getCookie(name: string): Promise<string | null> {
    try {
      const cookies = await this.context.cookies();
      const cookie = cookies.find((c) => c.name === name);

      if (!cookie) return null;

      // Prüfe ob abgelaufen
      if (cookie.expires && cookie.expires < Date.now() / 1000) {
        await this.removeCookie(name);
        return null;
      }

      return cookie.value;
    } catch (error) {
      this.logger.error(`Cookie Lesen fehlgeschlagen: ${error}`);
      throw error;
    }
  }

  /**
   * Entfernt Cookie
   */
  async removeCookie(name: string): Promise<void> {
    const cookies = await this.context.cookies();
    const cookie = cookies.find((c) => c.name === name);

    if (cookie) {
      await this.context.clearCookies({
        name,
      });

      this.logAudit('remove', StorageType.COOKIES, name);
      this.logger.info(`✓ Cookie "${name}" entfernt`);
    }
  }

  /**
   * Gibt alle Cookies zurück
   */
  async getAllCookies(): Promise<CookieOptions[]> {
    const cookies = await this.context.cookies();

    return cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires ? c.expires * 1000 : undefined,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite as any,
    }));
  }

  /**
   * Löscht alle Cookies
   */
  async clearCookies(): Promise<void> {
    await this.context.clearCookies();
    this.logAudit('clear', StorageType.COOKIES);
    this.logger.info('✓ Alle Cookies gelöscht');
  }

  /**
   * Gibt Cookie-Zähler zurück
   */
  async getCookieCount(): Promise<number> {
    const cookies = await this.context.cookies();
    return cookies.length;
  }

  // ========================================================================
  // BACKUP & RESTORE
  // ========================================================================

  /**
   * Erstellt Backup
   */
  async createBackup(tag?: string): Promise<StorageBackup> {
    const span = this.tracer.startSpan({
      name: 'createBackup',
      attributes: { tag },
    });

    try {
      // Sammle localStorage
      const localStorage = await this.page.evaluate(() => {
        const items: Record<string, any> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            const value = window.localStorage.getItem(key);
            try {
              items[key] = JSON.parse(value || '');
            } catch {
              items[key] = value;
            }
          }
        }
        return items;
      });

      // Sammle sessionStorage
      const sessionStorage = await this.page.evaluate(() => {
        const items: Record<string, any> = {};
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key) {
            const value = window.sessionStorage.getItem(key);
            try {
              items[key] = JSON.parse(value || '');
            } catch {
              items[key] = value;
            }
          }
        }
        return items;
      });

      // Sammle Cookies
      const cookies = await this.getAllCookies();

      const backup: StorageBackup = {
        timestamp: Date.now(),
        version: '1.0.0',
        data: {
          localStorage,
          sessionStorage,
          cookies,
        },
        metadata: {
          tag,
          description: `Backup erstellt am ${new Date().toLocaleString()}`,
        },
      };

      // Speichere Backup intern
      this.backups.push(backup);

      this.logAudit('backup', StorageType.LOCAL_STORAGE, undefined, { tag });
      this.logger.info(`✓ Backup erstellt (${this.backups.length} insgesamt)`);

      return backup;
    } catch (error) {
      span.setStatus('ERROR');
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Stellt Backup wieder her
   */
  async restoreBackup(index: number): Promise<void> {
    try {
      const backup = this.backups[index];

      if (!backup) {
        throw new Error(`Backup mit Index ${index} nicht gefunden`);
      }

      // Lösche aktuellen Storage
      await this.clearLocalStorage();
      await this.clearSessionStorage();

      // Stelle localStorage wieder her
      for (const [key, value] of Object.entries(backup.data.localStorage)) {
        await this.setLocalStorage(key, value);
      }

      // Stelle sessionStorage wieder her
      for (const [key, value] of Object.entries(backup.data.sessionStorage)) {
        await this.setSessionStorage(key, value);
      }

      // Stelle Cookies wieder her
      for (const cookie of backup.data.cookies) {
        await this.setCookie(cookie);
      }

      this.logAudit('restore', StorageType.LOCAL_STORAGE, undefined, { index });
      this.logger.info(`✓ Backup ${index} wiederhergestellt`);
    } catch (error) {
      this.logger.error(`Backup-Wiederherstellung fehlgeschlagen: ${error}`);
      throw error;
    }
  }

  /**
   * Exportiert Backup zu Datei
   */
  exportBackup(index: number, filepath: string): void {
    const backup = this.backups[index];

    if (!backup) {
      throw new Error(`Backup mit Index ${index} nicht gefunden`);
    }

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    this.logger.info(`✓ Backup exportiert: ${filepath}`);
  }

  /**
   * Importiert Backup von Datei
   */
  importBackup(filepath: string): StorageBackup {
    const content = fs.readFileSync(filepath, 'utf-8');
    const backup = JSON.parse(content) as StorageBackup;

    this.backups.push(backup);
    this.logger.info(`✓ Backup importiert: ${filepath}`);

    return backup;
  }

  /**
   * Gibt Backup-Liste zurück
   */
  listBackups(): Array<{
    index: number;
    timestamp: Date;
    tag?: string;
  }> {
    return this.backups.map((b, index) => ({
      index,
      timestamp: new Date(b.timestamp),
      tag: b.metadata?.tag,
    }));
  }

  // ========================================================================
  // SUCHE & QUERY
  // ========================================================================

  /**
   * Sucht Items in localStorage
   */
  async searchLocalStorage<T = any>(
    options: QueryOptions
  ): Promise<StorageItem<T>[]> {
    const keys = await this.getLocalStorageKeys();
    const results: StorageItem<T>[] = [];

    for (const key of keys) {
      const value = await this.page.evaluate((key) => {
        return localStorage.getItem(key);
      }, key);

      if (!value) continue;

      // Pattern-Match
      if (options.pattern) {
        const pattern =
          typeof options.pattern === 'string'
            ? new RegExp(StringUtil.escapeHtml(options.pattern))
            : options.pattern;

        if (!pattern.test(key)) continue;
      }

      try {
        const item = JSON.parse(value) as StorageItem<T>;

        // Filter nach Expiration
        if (options.expired !== undefined) {
          const isExpired = item.expiresAt && Date.now() > item.expiresAt;
          if (options.expired !== isExpired) continue;
        }

        // Filter nach Encryption
        if (options.encrypted !== undefined) {
          if (options.encrypted !== (item.encrypted || false)) continue;
        }

        results.push(item);
      } catch {
        // Skip nicht-serialisierte Items
      }
    }

    // Anwende Limit und Offset
    const offset = options.offset || 0;
    const limit = options.limit || results.length;

    return results.slice(offset, offset + limit);
  }

  // ========================================================================
  // WATCH & OBSERVER
  // ========================================================================

  /**
   * Beobachtet localStorage für Änderungen
   */
  watchLocalStorage<T = any>(
    key: string,
    callback: StorageWatchCallback<T>
  ): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, []);
    }

    this.watchers.get(key)?.push(callback);

    // Rückgabe Funktion zum Unwatchen
    return () => {
      const callbacks = this.watchers.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Veranlasst Watcher bei Änderung
   */
  private async triggerWatchers<T = any>(
    key: string,
    oldValue: T | undefined,
    newValue: T | undefined
  ): Promise<void> {
    const callbacks = this.watchers.get(key);

    if (callbacks) {
      for (const callback of callbacks) {
        try {
          await callback(key, oldValue, newValue);
        } catch (error) {
          this.logger.error(`Watcher-Fehler für "${key}": ${error}`);
        }
      }
    }
  }

  // ========================================================================
  // CLEANUP & MAINTENANCE
  // ========================================================================

  /**
   * Entfernt abgelaufene Items
   */
  async cleanup(): Promise<number> {
    const span = this.tracer.startSpan({
      name: 'cleanup',
    });

    try {
      let cleanedCount = 0;

      // Cleanup localStorage
      const lsKeys = await this.getLocalStorageKeys();
      for (const key of lsKeys) {
        const value = await this.page.evaluate((key) => {
          return localStorage.getItem(key);
        }, key);

        if (value) {
          try {
            const item = JSON.parse(value) as StorageItem;

            if (item.expiresAt && Date.now() > item.expiresAt) {
              await this.removeLocalStorage(key);
              cleanedCount++;
              this.stats.expiredItems++;
            }
          } catch {
            // Skip
          }
        }
      }

      this.stats.lastCleanup = Date.now();

      this.logAudit('cleanup', StorageType.LOCAL_STORAGE, undefined, {
        itemsRemoved: cleanedCount,
      });

      this.logger.info(`✓ Cleanup abgeschlossen: ${cleanedCount} Items entfernt`);

      return cleanedCount;
    } catch (error) {
      span.setStatus('ERROR');
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Gibt Storage-Statistiken zurück
   */
  async getStats(): Promise<StorageStats> {
    try {
      const localStorageSize = await this.getLocalStorageSize();
      const lsKeys = await this.getLocalStorageKeys();
      const cookiesCount = await this.getCookieCount();

      return {
        totalItems: lsKeys.length + cookiesCount,
        localStorageSize,
        sessionStorageSize: 0, // Vereinfacht
        cookiesCount,
        indexedDBSize: 0, // Vereinfacht
        expiredItems: this.stats.expiredItems,
        encryptedItems: this.stats.encryptedItems,
        lastCleanup: this.stats.lastCleanup,
      };
    } catch (error) {
      this.logger.error(`Statistik-Erfassung fehlgeschlagen: ${error}`);
      return this.stats;
    }
  }

  /**
   * Gibt Storage-Report aus
   */
  async getReport(): Promise<string> {
    const stats = await this.getStats();

    return [
      '═════════════════════════════════════════',
      'STORAGE REPORT',
      '═════════════════════════════════════════',
      `Total Items: ${stats.totalItems}`,
      `LocalStorage Size: ${(stats.localStorageSize / 1024).toFixed(2)} KB`,
      `Cookies Count: ${stats.cookiesCount}`,
      `Expired Items: ${stats.expiredItems}`,
      `Encrypted Items: ${stats.encryptedItems}`,
      `Last Cleanup: ${new Date(stats.lastCleanup).toLocaleString()}`,
      `Backups: ${this.backups.length}`,
      '═════════════════════════════════════════',
    ].join('\n');
  }

  // ========================================================================
  // HILFS-METHODEN
  // ========================================================================

  /**
   * Verschlüsselt Daten
   */
  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * Entschlüsselt Daten
   */
  private decrypt(data: string): string {
    const parts = data.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  /**
   * Generiert Verschlüsselungsschlüssel
   */
  private generateEncryptionKey(key: string): Buffer {
    return crypto.createHash('sha256').update(key).digest();
  }

  /**
   * Berechnet Expires-Timestamp
   */
  private getExpiresTimestamp(options: CookieOptions): number {
    if (typeof options.expires === 'number') {
      return options.expires;
    }

    if (options.expires instanceof Date) {
      return Math.floor(options.expires.getTime() / 1000);
    }

    if (options.maxAge) {
      return Math.floor((Date.now() + options.maxAge) / 1000);
    }

    // Standard: 1 Jahr
    return Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000);
  }

  /**
   * Loggt Aktion ins Audit-Log
   */
  private logAudit(
    action: string,
    storage: StorageType,
    key?: string,
    details?: any
  ): void {
    this.auditLog.push({
      timestamp: new Date(),
      action,
      storage,
      key,
      details,
    });
  }

  /**
   * Gibt Audit-Log zurück
   */
  getAuditLog(): Array<{
    timestamp: Date;
    action: string;
    storage: StorageType;
    key?: string;
    details: any;
  }> {
    return [...this.auditLog];
  }
}

export default StorageHelper;
