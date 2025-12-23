// benutzen Sie diese Datei für optimierte Secrets-Verwaltung in Docker-Umgebungen
// Diese Datei dient der optimierten Verwaltung von Geheimnissen (Secrets)
// in Docker-Umgebungen. Programmiersprachen-Elemente bleiben unverändert.
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ==============================
 * Typen
 * ==============================
 */
export interface PrivateLabelKonfiguration {
  URL: string;
  BENUTZER_EMAIL: string;
  BENUTZER_PASSWORT: string;
  GENEHMIGER_EMAIL?: string;
  GENEHMIGER_PASSWORT?: string;
  SUPPORT_EMAIL?: string;
  SUPPORT_PASSWORT?: string;
  UMGEBUNG: string;
  SYSTEM_EMAILS?: string;
  BASIS_AUTH?: string;
  [schluessel: string]: string | undefined;
}

export interface PLKonfigurationsDatei {
  [labelName: string]: PrivateLabelKonfiguration; // labelName ist der Name des PrivateLabels z.B. 'CRS', 'MEIN_LABEL', etc.
}

/**
 * ==============================
 * Konstanten / Konfiguration
 * ==============================
 */
const PFLICHT_FELDER: ReadonlyArray<keyof PrivateLabelKonfiguration> = [
  'URL',
  'BENUTZER_EMAIL',
  'BENUTZER_PASSWORT',
  'UMGEBUNG',
];

// Zuordnung: Umgebungsvariable -> Konfigurationsschlüssel -> ✅ Ja, keyof vermittelt hier Schlüssel 🔁 Aber als Werttyp, nicht als Objekt-Schlüssel
const ENV_ZUORDNUNG: Readonly<Record<string, keyof PrivateLabelKonfiguration>> = Object.freeze({ // string hier ist für ENV-Variablenamen und keyof für die Konfigurationsschlüssel
  PL_URL: 'URL',
  PL_BENUTZER_EMAIL: 'BENUTZER_EMAIL',
  PL_BENUTZER_PASSWORT: 'BENUTZER_PASSWORT',
  PL_GENEHMIGER_EMAIL: 'GENEHMIGER_EMAIL',
  PL_GENEHMIGER_PASSWORT: 'GENEHMIGER_PASSWORT',
  PL_SUPPORT_EMAIL: 'SUPPORT_EMAIL',
  PL_SUPPORT_PASSWORT: 'SUPPORT_PASSWORT',
  PL_UMGEBUNG: 'UMGEBUNG',
  PL_SYSTEM_EMAILS: 'SYSTEM_EMAILS',
  PL_BASIS_AUTH: 'BASIS_AUTH',
});

/**
 * ==============================
 * GeheimnisVerwalter
 * ==============================
 */
export class GeheimnisVerwalter {
  private readonly jsonDateiPfad: string;
  private jsonDaten: PLKonfigurationsDatei | null = null;
  private readonly zwischenspeicher = new Map<string, Readonly<PrivateLabelKonfiguration>>(); // Cache für geladene PrivateLabels string ist der Name des Labels z.B. CRS / , Readonly<PrivateLabelKonfiguration> ist die Konfiguration

  constructor(jsonDatei?: string) {
    // Priorität: Argument -> ENV-Variable -> Standard
    const datei = jsonDatei || process.env.PL_CONFIG_PATH || 'PL_config.json';
    this.jsonDateiPfad = path.resolve(datei); // Absoluter Pfad der JSON-Datei wird gespeichert
  }

  /**
   * ------------------------------
   * Interne Hilfsfunktionen
   * ------------------------------
   */

  private stelleDatenSicher(): void {
    if (this.jsonDaten) return;// this.jsonDateiPfad sagt nur wo die Datei ist -> this.jsonDaten sagt, ob die Daten geladen sind.

    if (!fs.existsSync(this.jsonDateiPfad)) {
      throw new Error(`GeheimnisVerwalter: Konfigurationsdatei nicht gefunden (${this.jsonDateiPfad})`);
    }

    try {
      const roh = fs.readFileSync(this.jsonDateiPfad, 'utf-8');
      this.jsonDaten = JSON.parse(roh) as PLKonfigurationsDatei; // 'as' ✅ Es sagt dem TypeScript-Compiler, welchen Typ ein Wert haben soll
    } catch (fehler) {
      throw new Error(`GeheimnisVerwalter: Fehler beim Laden der Konfiguration: ${fehler instanceof Error ? fehler.message : String(fehler)}`);
      // Wenn der abgefangene Fehler ein echtes Error-Objekt ist, wird seine Fehlermeldung verwendet, andernfalls wird der Fehler sicher in einen String umgewandelt.
    } 
  }

  private ersetzePlatzhalter(label: PrivateLabelKonfiguration): PrivateLabelKonfiguration {
    const aufgeloest: PrivateLabelKonfiguration = { ...label }; // label ist zb { URL: '${MEINE_URL}', BENUTZER_EMAIL: '${MEINE_EMAIL}', ... }

    for (const schluessel of Object.keys(aufgeloest)) { // alle Schlüssel im Label durchgehen , Object.keys(aufgeloest) ist zb 'URL', 'BENUTZER_EMAIL', etc.
      const wert = aufgeloest[schluessel]; 
      if (typeof wert === 'string' && wert.startsWith('${') && wert.endsWith('}')) {
        const envName = wert.slice(2, -1);
        aufgeloest[schluessel] = process.env[envName] ?? '';
      }
    }

    return aufgeloest;
  }

  private pruefePflichtfelder(label: PrivateLabelKonfiguration, labelName: string): void { // labelName ist der Name des Labels, z.B. 'mein_label' oder 'CRS'
    for (const feld of PFLICHT_FELDER) {
      const wert = label[feld];
      if (!wert || !wert.trim()) {
        throw new Error(`GeheimnisVerwalter: PrivateLabel '${labelName}' fehlt Pflichtfeld '${feld}'`);
      }
    }
  }
/*********************************************************** */
  private holeLabelIntern(labelName: string): Readonly<PrivateLabelKonfiguration> {
    if (this.zwischenspeicher.has(labelName)) {
      return this.zwischenspeicher.get(labelName)!; // get gibt Readonly<PrivateLabelKonfiguration> oder undefined zurück, ! sagt dem Compiler, dass es nicht undefined ist, dh. gibt label zurück
    } // get() kann undefined zurückgeben, aber da has(labelName) true ist,
      // garantiert ! dem TypeScript-Compiler, dass hier ein Wert existiert


    this.stelleDatenSicher();

    const rohLabel = this.jsonDaten![labelName];
    if (!rohLabel) {
      throw new Error(`GeheimnisVerwalter: PrivateLabel '${labelName}' existiert nicht`);
    }

    const aufgeloest = this.ersetzePlatzhalter(rohLabel);
    this.pruefePflichtfelder(aufgeloest, labelName);

    const eingefroren = Object.freeze(aufgeloest); // macht das Objekt unveränderlich eingefroren ist z.B. { URL: 'https://meine.url', BENUTZER_EMAIL: '  meine@email', ... }
    this.zwischenspeicher.set(labelName, eingefroren);
    return eingefroren;
  }
  /**************************************************************
   * ------------------------------
   * Öffentliche API
   * ------------------------------
   */

  public holePrivateLabelSync(labelName: string): Readonly<PrivateLabelKonfiguration> {
    return this.holeLabelIntern(labelName);
  }

  public async holePrivateLabel(labelName: string): Promise<Readonly<PrivateLabelKonfiguration>> {
    return this.holeLabelIntern(labelName);
  }

  public async ladeEnv(labelName: string): Promise<void> {
    const label = await this.holePrivateLabel(labelName);

    for (const [envVariable, konfigSchluessel] of Object.entries(ENV_ZUORDNUNG)) {
      process.env[envVariable] = label[konfigSchluessel] ?? '';
    }
  }

  public holeGeheimnis<K extends keyof PrivateLabelKonfiguration>(
    labelName: string,
    schluessel: K,
  ): PrivateLabelKonfiguration[K] {
    return this.holeLabelIntern(labelName)[schluessel];
  }

  /**
   * Für Tests oder Neuladen (z. B. bei Hot-Reload)
   */
  public leereCache(labelName?: string): void {
    if (labelName) this.zwischenspeicher.delete(labelName);
    else this.zwischenspeicher.clear();
  }
}

/**
 * ==============================
 * Singleton + Startlogik
 * ==============================
 */
export const geheimnisVerwalter = new GeheimnisVerwalter();

export async function ladePrivateLabelAusEnv(): Promise<void> {
  const labelName = process.env.private_label;
  if (!labelName) {
    throw new Error('GeheimnisVerwalter: Umgebungsvariable "private_label" ist nicht gesetzt');
  }

  await geheimnisVerwalter.ladeEnv(labelName);
}


/* ==============================
 * Docker-Optimierungen & Hinweise
 * ==============================
 *
 * 1. Diese Implementierung ist read-only und container-safe:
 *    - keine Schreibzugriffe
 *    - kein globaler Zustand außer Cache
 *
 * 2. JSON-Pfad kann per ENV überschrieben werden:
 *    new SecretsManager(process.env.PL_CONFIG_PATH)
 *
 * 3. Ideal für Multi-Stage Builds & Distroless Images
 *
 * ------------------------------
 * Beispiel: Dockerfile (Node 20)
 * ------------------------------
 *
 * FROM node:20-alpine AS deps
 * WORKDIR /app
 * COPY package*.json ./
 * RUN npm ci --omit=dev
 *
 * FROM node:20-alpine AS runner
 * WORKDIR /app
 * ENV NODE_ENV=production
 *
 * COPY --from=deps /app/node_modules ./node_modules
 * COPY dist ./dist
 * COPY PL_config.json ./PL_config.json
 *
 * # Optional: Config-Pfad
 * ENV PL_CONFIG_PATH=/app/PL_config.json
 *
 * CMD ["node", "dist/index.js"]
 *
 * ------------------------------
 * Docker Best Practices erfüllt:
 * - kleiner Base-Image
 * - kein Build-Tooling im Runtime-Image
 * - ENV-only Secrets
 * - immutable Config
 */

