import * as fs from 'fs';
import * as path from 'path';

interface ISecretConfig {
  [key: string]: string | undefined;
}

/**
 * Zentraler Secret Manager für alle Umgebungen
 * - Lokal: .env.secrets
 * - Cloud: CloudSecretsManager
 * - GitHub Actions: Secrets
 */
export class SecretsManager {
  private secrets: ISecretConfig = {};
  private readonly secretsPath = path.resolve(__dirname, '../../.env.secrets');

  constructor() {
    this.loadSecrets();
  }

  /**
   * Lade Secrets aus verschiedenen Quellen
   * Priorität: Env Vars > .env.secrets > Default
   */
  private loadSecrets(): void {
    try {
      // 1. Versuche .env.secrets zu laden
      if (fs.existsSync(this.secretsPath)) {
        const content = fs.readFileSync(this.secretsPath, 'utf-8');
        this.parseSecretsFile(content);
      }

      // 2. Überschreibe mit Umgebungsvariablen
      this.secrets = { ...this.secrets, ...process.env };
    } catch (error) {
      console.warn(`⚠️  Fehler beim Laden der Secrets: ${error}`);
    }
  }

  /**
   * Parse .env.secrets Datei Format
   */
  private parseSecretsFile(content: string): void {
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Ignoriere Kommentare und leere Zeilen
      if (line.startsWith('#') || line.trim() === '') {
        continue;
      }

      const [key, ...valueParts] = line.split('=');
      const trimmedKey = key.trim();
      const value = valueParts.join('=').trim();

      // Entferne Anführungszeichen
      const cleanValue = value.replace(/^['"]|['"]$/g, '');

      if (trimmedKey && cleanValue) {
        this.secrets[trimmedKey] = cleanValue;
      }
    }
  }

  /**
   * Hole einen Secret Wert
   */
  public getSecret(key: string): string | undefined {
    return this.secrets[key];
  }

  /**
   * Hole einen Secret Wert mit Default
   */
  public getSecretOrDefault(key: string, defaultValue: string): string {
    return this.secrets[key] || defaultValue;
  }

  /**
   * Hole mehrere Secrets
   */
  public getSecrets(keys: string[]): ISecretConfig {
    const result: ISecretConfig = {};
    for (const key of keys) {
      result[key] = this.secrets[key];
    }
    return result;
  }

  /**
   * Prüfe ob Secret existiert
   */
  public hasSecret(key: string): boolean {
    return this.secrets[key] !== undefined;
  }

  /**
   * Gebe alle Secrets aus (VORSICHT: NUR FÜR DEBUGGING!)
   */
  public getAllSecrets(): ISecretConfig {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ getAllSecrets ist in Production nicht erlaubt!');
    }
    return { ...this.secrets };
  }

  /**
   * Validiere erforderliche Secrets
   */
  public validateRequiredSecrets(requiredKeys: string[]): void {
    const missing: string[] = [];

    for (const key of requiredKeys) {
      if (!this.hasSecret(key)) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `❌ Fehlende erforderliche Secrets: ${missing.join(', ')}\n` +
        `Bitte füllen Sie diese in .env.secrets aus.`
      );
    }
  }
}