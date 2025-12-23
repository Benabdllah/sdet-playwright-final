// sdet-secrets-plus-plus.ts  (die echte SDET+++ Version)
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';



export class SecretsManager {
  private jsonFilePath;
  private jsonData;


  constructor(jsonFile = 'PL_config.json') {
    this.jsonFilePath = path.resolve(jsonFile);
    const rawData = fs.readFileSync(this.jsonFilePath, 'utf-8');
    this.jsonData = JSON.parse(rawData);
  }
// 2. Zentrale Validierung der Pflichtfelder
  private validateLabel(label, labelName){
    if (!label.URL?.trim()) {
      throw new Error(`PrivateLabel '${labelName}' fehlt URL`);
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
  public async getPrivateLabel(labelName){

    const label = this.jsonData[labelName]; // label zB { URL: "...", USER_MAIL: "...", ... } und labelName zB "CRS"
   

    // Platzhalter auflösen: ${MY_VAR} → process.env.MY_VAR
    const resolvedLabel = { ...label };
    for (const key in label) { // key zB "URL", "USER_MAIL", ...  label["URL"] zB "${MY_VAR}" label zB { URL: "${MY_VAR}", USER_MAIL: "...", ... }
      const value = label[key];//label[key] zB "${MY_VAR}"
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envKey = value.slice(2, -1); //envKey zB "MY_VAR"
        resolvedLabel[key] = process.env[envKey] || '';//zB process.env["MY_VAR"] resolvedLabel["URL"]
      }
    }

    // Pflichtfelder prüfen (nach Platzhalter-Auflösung!)
    this.validateLabel(resolvedLabel, labelName);


 
    return resolvedLabel;
  }

  // Sync-Wrapper für die alten Aufrufe (kompatibel bleiben)
  public getPrivateLabelSync(labelName){
    const label = this.jsonData[labelName]

    const resolved= { ...label };
    for (const key in label) {
      const value = label[key];
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        resolved[key] = process.env[value.slice(2, -1)] || '';
      }
    }

    this.validateLabel(resolved, labelName);
   
    return resolved;
  }

  // Bequemlichkeits-Methode: alles in process.env laden (wie bisher)
  public async loadEnv(labelName){
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

  public getSecret(labelName, key){

    return this.getPrivateLabelSync(labelName)[key];
  }
}

// Singleton – bleibt gleich, aber jetzt mit async-fähigem Inhalt
export const secretsManager = new SecretsManager();

/**
 * Lädt das Private Label – jetzt async, weil die Zukunft async ist weil der Secrets Manager async ist
 */
export async function loadPrivateLabelFromEnv() {
  const labelName = process.env.private_label;
  await secretsManager.loadEnv(labelName);
}