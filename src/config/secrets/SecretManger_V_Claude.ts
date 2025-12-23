// Optimierte Secrets-Verwaltung für Docker-Umgebungen
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
  [labelName: string]: PrivateLabelKonfiguration; // labelName: TypeScript Index Signature.
}

/**
 * ==============================
 * Konstanten
 * ==============================
 */
const PFLICHT_FELDER: ReadonlyArray<keyof PrivateLabelKonfiguration> = [
  'URL',
  'BENUTZER_EMAIL',
  'BENUTZER_PASSWORT',
  'UMGEBUNG',
] as const;

const ENV_ZUORDNUNG = {
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
} as const satisfies Record<string, keyof PrivateLabelKonfiguration>;
// optional: 'as const' für bessere Type-Safety
//satisfies stellt sicher, dass das Objekt den Typanforderungen entspricht

Object.freeze(ENV_ZUORDNUNG);// Optional: Objekt einfrieren, um unbeabsichtigte Änderungen zu verhindern


/**
 * ==============================
 * GeheimnisVerwalter
 * ==============================
 */
export class GeheimnisVerwalter {
  private readonly jsonDateiPfad: string;
  private jsonDaten: PLKonfigurationsDatei | null = null;
  private readonly zwischenspeicher = new Map<string, Readonly<PrivateLabelKonfiguration>>();

  constructor(jsonDatei?: string) {
    const datei = jsonDatei || process.env.PL_CONFIG_PATH || 'PL_config.json';
    this.jsonDateiPfad = path.resolve(datei);
  }

  /**
   * ------------------------------
   * Interne Hilfsfunktionen
   * ------------------------------
   */

  private stelleDatenSicher(): void {
    if (this.jsonDaten) return;

    if (!fs.existsSync(this.jsonDateiPfad)) {
      throw new Error(
        `GeheimnisVerwalter: Konfigurationsdatei nicht gefunden (${this.jsonDateiPfad})`
      );
    }

    try {
      const roh = fs.readFileSync(this.jsonDateiPfad, 'utf-8');
      this.jsonDaten = JSON.parse(roh) as PLKonfigurationsDatei;
    } catch (fehler) { // Fehlerbehandlung beim Lesen/Parsen der Datei, fehler ist vom Typ unknown,dh fehler kann alles sein, wir müssen es erst prüfen bevor wir darauf zugreifen.
      const nachricht = fehler instanceof Error ? fehler.message : String(fehler);// error instanceof Error verwenden,erlaubt uns den Zugriff auf die message-Eigenschaft
      throw new Error(`GeheimnisVerwalter: Fehler beim Laden der Konfiguration: ${nachricht}`);
    }
  }

  private ersetzePlatzhalter(label: PrivateLabelKonfiguration): PrivateLabelKonfiguration {
    const aufgeloest = { ...label };
    const PLATZHALTER_REGEX = /^\$\{(.+)\}$/;

    for (const [schluessel, wert] of Object.entries(aufgeloest)) {
      if (typeof wert === 'string') {
        const match = PLATZHALTER_REGEX.exec(wert);// match ist entweder null oder Array mit [ganzer String, Variable]
        //  '${MEINE_URL}', // index 0 → der komplette gematchte String
        // 'MEINE_URL',    // index 1 → Inhalt der Capture Group (das, was in Klammern steht)
        // [ganzerString, captureGroup1, captureGroup2, ...]


        if (match) {
          aufgeloest[schluessel] = process.env[match[1]] ?? '';// process.env[match[1]] ist der Wert der Umgebungsvariable
          // ?? '' stellt sicher, dass wir keinen undefined-Wert haben, 👉 Nimm den Wert aus der Umgebungsvariable – aber nur, wenn er nicht null oder undefined ist; sonst nimm einen leeren String.
        }
      }
    }

    return aufgeloest;
  }

  private pruefePflichtfelder(label: PrivateLabelKonfiguration, labelName: string): void {//👉 Die Funktion ist void, weil ihr Zweck nicht ist, Daten zurückzugeben, sondern zu prüfen – und bei Fehlern zu stoppen.
//Die Funktion liefert keinen Wert zurück, Sie erledigt eine Aufgabe, Das Ergebnis ist entweder „alles ok“ oder „Exception“    
const fehlendeFelder = PFLICHT_FELDER.filter(
      feld => !label[feld]?.trim()
    );

    if (fehlendeFelder.length > 0) {
      throw new Error(
        `GeheimnisVerwalter: PrivateLabel '${labelName}' fehlt Pflichtfeld(er): ${fehlendeFelder.join(', ')}`
      );
    }
  }
/**
   * ------------------------------
   * Hauptfunktionen
   * ------------------------------
   */
  private holeLabelIntern(labelName: string): Readonly<PrivateLabelKonfiguration> {
    const cached = this.zwischenspeicher.get(labelName);
    if (cached) return cached; // ← Return #1

    this.stelleDatenSicher();

    const rohLabel = this.jsonDaten![labelName];// '!' sagt dem Compiler, dass jsonDaten nicht null ist
    if (!rohLabel) {
      throw new Error(`GeheimnisVerwalter: PrivateLabel '${labelName}' existiert nicht`);
    }

    const aufgeloest = this.ersetzePlatzhalter(rohLabel);
    this.pruefePflichtfelder(aufgeloest, labelName);

    const eingefroren = Object.freeze(aufgeloest);
    this.zwischenspeicher.set(labelName, eingefroren);
    return eingefroren;// ← ansonsten Return #2
  }

  /**
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
      const wert = label[konfigSchluessel];
      if (wert !== undefined) {
        process.env[envVariable] = wert;
      }
    }
  }

  public holeGeheimnis<K extends keyof PrivateLabelKonfiguration>(
    labelName: string,
    schluessel: K
  ): PrivateLabelKonfiguration[K] {
    return this.holeLabelIntern(labelName)[schluessel];
  }

  public leereCache(labelName?: string): void {
    labelName ? this.zwischenspeicher.delete(labelName) : this.zwischenspeicher.clear();
  }

  public getAlleLabelNamen(): string[] {
    this.stelleDatenSicher();
    return Object.keys(this.jsonDaten!);
  }
}

/**
 * ==============================
 * Singleton + Startlogik 👉 Singleton bedeutet:

Es gibt genau eine Instanz dieser Klasse im gesamten Programm,
und alle benutzen dieselbe.
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
 * OPTIMIERUNGEN IN DIESER VERSION:
 * 
 * 1. Regex für Platzhalter-Erkennung (performanter)
 * 2. Object.entries() statt Object.keys() (weniger Lookups)
 * 3. Batch-Validierung der Pflichtfelder
 * 4. Frühzeitiger Cache-Return
 * 5. Optionale Werte nur setzen wenn vorhanden
 * 6. Ternary statt if-else in leereCache()
 * 7. Neue Methode getAlleLabelNamen() für Debugging
 * 8. 'as const' für bessere Type-Safety
 * 
 * ------------------------------
 * Dockerfile Beispiel
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
 * ENV PL_CONFIG_PATH=/app/PL_config.json
 * CMD ["node", "dist/index.js"]
 */