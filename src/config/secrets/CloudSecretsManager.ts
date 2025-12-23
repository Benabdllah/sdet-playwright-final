// src/config/secrets/CloudSecretsManager.ts
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
// Für AWS: import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

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

export class CloudSecretsManager {
  private readonly cache = new Map<string, Readonly<PrivateLabelConfig>>();
  private client: SecretClient;

  constructor() {
    const vaultUrl = process.env.KEY_VAULT_URL;
    if (!vaultUrl) {
      throw new Error('KEY_VAULT_URL Umgebungsvariable fehlt');
    }
    // OIDC / Managed Identity – kein Secret im Code!
    const credential = new DefaultAzureCredential();
    this.client = new SecretClient(vaultUrl, credential);
  }

  private async fetchFromVault(labelName: string): Promise<PrivateLabelConfig> {
    try {
      const secret = await this.client.getSecret(`${labelName}-config`);
      return JSON.parse(secret.value!) as PrivateLabelConfig;
    } catch (error) {
      throw new Error(`Secret '${labelName}-config' nicht gefunden oder Fehler: ${error}`);
    }
  }

  public async getPrivateLabel(labelName: string): Promise<Readonly<PrivateLabelConfig>> {
    const cached = this.cache.get(labelName);
    if (cached) return cached;

    const config = await this.fetchFromVault(labelName);

    // Pflichtfelder validieren
    if (!config.URL?.trim() || !config.USER_MAIL?.trim() || !config.USER_PASSWORD?.trim() || !config.ENVIRONMENT?.trim()) {
      throw new Error(`PrivateLabel '${labelName}' ist unvollständig`);
    }

    const frozen = Object.freeze(config);
    this.cache.set(labelName, frozen);
    return frozen;
  }

  public async loadEnv(labelName: string): Promise<void> {
    const config = await this.getPrivateLabel(labelName);
    process.env.PL_URL = config.URL;
    process.env.PL_USER = config.USER_MAIL;
    process.env.PL_PASSWORD = config.USER_PASSWORD;
    process.env.environment = config.ENVIRONMENT;
    // ... weitere Zuordnungen
  }
}

export const cloudSecretsManager = new CloudSecretsManager();

export async function loadPrivateLabelFromEnv(): Promise<void> {
  const label = process.env.private_label;
  if (!label) throw new Error('private_label nicht gesetzt');
  await cloudSecretsManager.loadEnv(label);
}