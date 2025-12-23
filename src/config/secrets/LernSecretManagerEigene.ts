import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
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
  [labelName: string]: PrivateLabelKonfiguration;
}            

const PFLICHT_FELDER: ReadonlyArray<keyof PrivateLabelKonfiguration> = [
  'URL',
  'BENUTZER_EMAIL',
  'BENUTZER_PASSWORT',
  'UMGEBUNG',
];

const ENV_ZUORDNUNG: Readonly<Record<string, keyof PrivateLabelKonfiguration>> = {
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
};

export class GeheimnisVerwalter {
  private readonly jsonDateiPfad: string;
  private jsonDaten: PLKonfigurationsDatei | null = null;
  private readonly zwischenspeicher = new Map<string, Readonly<PrivateLabelKonfiguration>>();   
  constructor(jsonDatei?: string) {
    this.jsonDateiPfad =
      jsonDatei ||
      process.env.PRIVATE_LABEL_KONFIGURATIONS_DATEI ||
      path.join(__dirname, 'privateLabelKonfiguration.json');

    try {
      const roh = fs.readFileSync(this.jsonDateiPfad, 'utf-8');
      this.jsonDaten = JSON.parse(roh) as PLKonfigurationsDatei; 
    } catch (fehler) {
      throw new Error(`GeheimnisVerwalter: Fehler beim Laden der Konfiguration: ${fehler instanceof Error ? fehler.message : String(fehler)}`);
    }
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
    } catch (fehler) {
      const nachricht = fehler instanceof Error ? fehler.message : String(fehler);
      throw new Error(`GeheimnisVerwalter: Fehler beim Laden der Konfiguration: ${nachricht}`);
    }
  }

  private ersetzePlatzhalter(label: PrivateLabelKonfiguration): PrivateLabelKonfiguration {
    const aufgeloest = { ...label };
    const PLATZHALTER_REGEX = /^\$\{(.+)\}$/;

    for (const [schluessel, wert] of Object.entries(aufgeloest)) {
      if (typeof wert === 'string') {
        const match = PLATZHALTER_REGEX.exec(wert);// match ist entweder null oder Array mit [ganzer String, Variable]
        if (match) {
          aufgeloest[schluessel] = process.env[match[1]] ?? '';// process.env[match[1]] ist der Wert der Umgebungsvariable
        }
      }
    }

    return aufgeloest;
  }

  private pruefePflichtfelder(label: PrivateLabelKonfiguration, labelName: string): void {
    const fehlendeFelder = PFLICHT_FELDER.filter(
      feld => !label[feld]?.trim()
    );

    if (fehlendeFelder.length > 0) {
      throw new Error(
        `GeheimnisVerwalter: PrivateLabel '${labelName}' fehlt Pflichtfeld(er): ${fehlendeFelder.join(', ')}`
      );
    }
  }

  private holeLabelIntern(labelName: string): Readonly<PrivateLabelKonfiguration> {
    const cached = this.zwischenspeicher.get(labelName);
    if (cached) return cached;

    this.stelleDatenSicher();

    if (!this.jsonDaten || !this.jsonDaten[labelName]) {
      throw new Error(
        `GeheimnisVerwalter: PrivateLabel '${labelName}' nicht in der Konfigurationsdatei gefunden.`
      );
    }

    let label = this.jsonDaten[labelName];
    label = this.ersetzePlatzhalter(label);
    this.pruefePflichtfelder(label, labelName);

    this.zwischenspeicher.set(labelName, label);
    return label;
  }

  