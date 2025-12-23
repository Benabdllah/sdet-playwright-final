// nur falls du auch lokal oder offline testen möchtest
// sdet-secrets-plus-plus.ts  (die echte SDET+++ Version)
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

export interface PrivateLabelConfig {
  URL: string;
  USER_MAIL: string;
  USER_PASSWORD: string;
  GENEHMIGER_MAIL?: string;
  GENEHMIGER_PASSWORD?: string;
  SUPPORTER_MAIL?: string;
  SUPPORTER_PASSWORD?: string;
  ENVIRONMENT: string;
  SYSTEMMAILS?: string;
  BASE_AUTH?: string;
}

export interface PLConfigFile {
  [key: string]: PrivateLabelConfig;// zB "CRS": { URL: "...", USER_MAIL: "...", ... }
}

export class SecretsManager {
  private jsonFilePath: string;
  private jsonData: PLConfigFile;
  private cache = new Map<string, PrivateLabelConfig>();// 4. Cache pro Label → spart bei 1000+ Aufrufen massiv Zeit

  constructor(jsonFile = 'PL_config.json') {
    this.jsonFilePath = path.resolve(jsonFile);

    if (!fs.existsSync(this.jsonFilePath)) {
      throw new Error(`JSON-Datei '${this.jsonFilePath}' existiert nicht.`);
    }

    const rawData = fs.readFileSync(this.jsonFilePath, 'utf-8');
    this.jsonData = JSON.parse(rawData);// das ist das ganze JSON Objekt

    // 3. Optional: Hier kannst du später noch .env-Variablen als Fallback/Override einbauen
    // Aktuell bleibt dotenv einfach global (wie bisher) → funktioniert schon super als Fallback
  }

  // 2. Zentrale Validierung der Pflichtfelder
  private validateLabel(label: PrivateLabelConfig, labelName: string): void {
    if (!label.URL?.trim()) {
      throw new Error(`PrivateLabel '${labelName}' fehlt URL`);//labelName zB "CRS"
    }
    if (!label.USER_MAIL?.trim()) {
      throw new Error(`PrivateLabel '${labelName}' fehlt USER_MAIL`);
    }
    if (!label.USER_PASSWORD?.trim()) {
      throw new Error(`PrivateLabel '${labelName}' fehlt USER_PASSWORD`);
    }
    if (!label.ENVIRONMENT?.trim()) {
      throw new Error(`PrivateLabel '${labelName}' fehlt ENVIRONMENT`);
    }
  }

  // 1. Async Version – bereit für AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, HashiCorp Vault etc.
  public async getPrivateLabel(labelName: string): Promise<PrivateLabelConfig> {
    // Cache-Hit?
    if (this.cache.has(labelName)) {
      return this.cache.get(labelName)!;
    }

    const label = this.jsonData[labelName]; // label zB { URL: "...", USER_MAIL: "...", ... } und labelName zB "CRS"
    if (!label) {
      throw new Error(`PrivateLabel '${labelName}' nicht gefunden in ${this.jsonFilePath}`);
    }

    // Platzhalter auflösen: ${MY_VAR} → process.env.MY_VAR
    const resolvedLabel: PrivateLabelConfig = { ...label };
    for (const key in label) { // key zB URL,label zB { URL: "...", USER_MAIL: "...", ... }
      const value = label[key as keyof PrivateLabelConfig];// value zB "https://example.com"
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envKey = value.slice(2, -1);
        resolvedLabel[key as keyof PrivateLabelConfig] = process.env[envKey] || '';//zB process.env["URL"]
      }
    }

    // Pflichtfelder prüfen (nach Platzhalter-Auflösung!)
    this.validateLabel(resolvedLabel, labelName);

    // In Cache legen
    this.cache.set(labelName, resolvedLabel);
    return resolvedLabel;
  }

  // Sync-Wrapper für die alten Aufrufe (kompatibel bleiben)
  public getPrivateLabelSync(labelName: string): PrivateLabelConfig {
    const label = this.jsonData[labelName];
    if (!label) throw new Error(`PrivateLabel '${labelName}' nicht gefunden.`);

    const resolved: PrivateLabelConfig = { ...label };
    for (const key in label) {
      const value = label[key as keyof PrivateLabelConfig];
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) { // orgin value ist ein platzhalter in der form ${MY_VAR} im JSON
        resolved[key as keyof PrivateLabelConfig] = process.env[value.slice(2, -1)] || '';// diese zeile prüft ob der value ein platzhalter ist und ersetzt ihn durch den env wert
      }
    }

    this.validateLabel(resolved, labelName);
    this.cache.set(labelName, resolved);
    return resolved;
  }

  // Bequemlichkeits-Methode: alles in process.env laden (wie bisher)
  public async loadEnv(labelName: string): Promise<void> {
    const label = await this.getPrivateLabel(labelName);

    process.env.PL_URL                  = label.URL;
    process.env.PL_USER                 = label.USER_MAIL;
    process.env.PL_PASSWORD            = label.USER_PASSWORD;
    process.env.PL_GENEHMIGER           = label.GENEHMIGER_MAIL || '';
    process.env.PL_GENEHMIGER_PASSWORD = label.GENEHMIGER_PASSWORD || '';
    process.env.PL_SUPPORTER            = label.SUPPORTER_MAIL || '';
    process.env.PL_SUPPORTER_PASSWORD  = label.SUPPORTER_PASSWORD || '';
    process.env.environment             = label.ENVIRONMENT;
    process.env.senderEmail             = label.SYSTEMMAILS || '';
    process.env.BASE_AUTH               = label.BASE_AUTH || '';
  }

  public getSecret(labelName: string, key: keyof PrivateLabelConfig): string | undefined {
    // Nutzt den Cache automatisch über getPrivateLabelSync
    return this.getPrivateLabelSync(labelName)[key];
  }
}

// Singleton – bleibt gleich, aber jetzt mit async-fähigem Inhalt
export const secretsManager = new SecretsManager();

/**
 * Lädt das Private Label – jetzt async, weil die Zukunft async ist
 */
export async function loadPrivateLabelFromEnv() {
  const labelName = process.env.private_label;
  if (!labelName) {
    throw new Error('Umgebungsvariable "private_label" ist nicht gesetzt.');
  }
  await secretsManager.loadEnv(labelName);
}