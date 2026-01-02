/**
 * ============================================================================
 * ULTIMATE SDET AUTHENTICATION STATE GENERATOR (FINAL) +++++
 * ============================================================================
 * Comprehensive TypeScript utility for generating and managing auth states
 * Supports: Multiple auth methods, user roles, storage persistence,
 * Features: Cookie management, localStorage, sessionStorage, encrypted storage
 * Production-ready with extensive error handling, retry logic, and logging
 * ============================================================================
 */

import * as playwright from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuthUser {
  username: string;
  password: string;
  email?: string;
  role?: string;
  mfaSecret?: string;
  totp?: string;
}

interface AuthConfig {
  baseUrl: string;
  loginUrl: string;
  users: Record<string, AuthUser>;
  authStorageDir: string;
  encryptionKey?: string;
  browserType?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  timeout?: number;
  retryAttempts?: number;
  dryRun?: boolean;
  verbose?: boolean;
}

interface AuthState {
  cookies: playwright.BrowserContext['storageState'];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  metadata: {
    user: string;
    timestamp: string;
    browser: string;
    url: string;
    expiresAt?: string;
  };
}

interface LoginStrategy {
  name: string;
  selector: string;
  actions: LoginAction[];
}

interface LoginAction {
  type: 'fill' | 'click' | 'press' | 'navigate' | 'wait' | 'evaluate';
  selector?: string;
  value?: string;
  key?: string;
  url?: string;
  timeout?: number;
  script?: string;
}

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

// ============================================================================
// COLOR CODES FOR TERMINAL OUTPUT
// ============================================================================

const Colors = {
  RED: '\x1b[0;31m',
  GREEN: '\x1b[0;32m',
  YELLOW: '\x1b[1;33m',
  BLUE: '\x1b[0;34m',
  CYAN: '\x1b[0;36m',
  MAGENTA: '\x1b[0;35m',
  BOLD: '\x1b[1m',
  NC: '\x1b[0m',
};

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return Colors.RED;
      case LogLevel.WARN:
        return Colors.YELLOW;
      case LogLevel.SUCCESS:
        return Colors.GREEN;
      case LogLevel.INFO:
        return Colors.BLUE;
      case LogLevel.DEBUG:
        return Colors.CYAN;
      default:
        return Colors.NC;
    }
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return '❌';
      case LogLevel.WARN:
        return '⚠️ ';
      case LogLevel.SUCCESS:
        return '✅';
      case LogLevel.INFO:
        return 'ℹ️ ';
      case LogLevel.DEBUG:
        return '📝';
      default:
        return '•';
    }
  }

  log(level: LogLevel, message: string): void {
    if (level === LogLevel.DEBUG && !this.verbose) {
      return;
    }

    const color = this.getColor(level);
    const emoji = this.getEmoji(level);
    const timestamp = new Date().toISOString();

    console.log(`${color}${emoji} [${timestamp}] ${message}${Colors.NC}`);
  }

  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  success(message: string): void {
    this.log(LogLevel.SUCCESS, message);
  }

  warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  header(message: string): void {
    console.log(`\n${Colors.BOLD}${Colors.CYAN}${'='.repeat(70)}${Colors.NC}`);
    console.log(`${Colors.BOLD}${Colors.CYAN}${message}${Colors.NC}`);
    console.log(`${Colors.BOLD}${Colors.CYAN}${'='.repeat(70)}${Colors.NC}\n`);
  }

  section(message: string): void {
    console.log(`\n${Colors.MAGENTA}▶ ${message}${Colors.NC}`);
  }
}

// ============================================================================
// ENCRYPTION UTILITY
// ============================================================================

class EncryptionUtil {
  private key: string;

  constructor(key?: string) {
    this.key = key || process.env.AUTH_ENCRYPTION_KEY || 'default-insecure-key';
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(this.key, 'salt', 32), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(this.key, 'salt', 32), iv);
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}

// ============================================================================
// AUTHENTICATION GENERATOR CLASS
// ============================================================================

class AuthStateGenerator {
  private config: AuthConfig;
  private logger: Logger;
  private encryption: EncryptionUtil;
  private browser?: playwright.Browser;
  private context?: playwright.BrowserContext;

  constructor(config: AuthConfig) {
    this.config = {
      headless: true,
      timeout: 30000,
      retryAttempts: 3,
      ...config,
    };
    this.logger = new Logger(config.verbose || false);
    this.encryption = new EncryptionUtil(config.encryptionKey);
  }

  async generateAuthStates(): Promise<void> {
    this.logger.header('ULTIMATE SDET AUTH STATE GENERATOR (FINAL) +++++');

    this.logger.info(`Base URL: ${this.config.baseUrl}`);
    this.logger.info(`Storage Dir: ${this.config.authStorageDir}`);
    this.logger.info(`Users: ${Object.keys(this.config.users).length}`);
    this.logger.info(`Dry Run: ${this.config.dryRun}`);

    try {
      // Ensure storage directory exists
      await this.ensureStorageDir();

      // Launch browser
      if (!this.config.dryRun) {
        await this.launchBrowser();
      }

      // Generate auth states for each user
      for (const [userKey, user] of Object.entries(this.config.users)) {
        this.logger.section(`Generating auth state for user: ${userKey}`);

        try {
          await this.generateAuthStateForUser(userKey, user);
        } catch (error) {
          this.logger.error(`Failed to generate auth state for ${userKey}: ${error}`);
        }
      }

      // Close browser
      if (this.browser && !this.config.dryRun) {
        await this.browser.close();
      }

      this.logger.success('Auth state generation completed');
    } catch (error) {
      this.logger.error(`Auth state generation failed: ${error}`);
      throw error;
    }
  }

  private async generateAuthStateForUser(userKey: string, user: AuthUser): Promise<void> {
    if (this.config.dryRun) {
      this.logger.info(`[DRY RUN] Would generate auth state for ${userKey}`);
      return;
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    let attempt = 0;
    const maxAttempts = this.config.retryAttempts || 3;

    while (attempt < maxAttempts) {
      try {
        const context = await this.browser.newContext();
        this.context = context;

        // Navigate to login page
        const page = await context.newPage();
        this.logger.debug(`Navigating to ${this.config.loginUrl}`);
        await page.goto(this.config.loginUrl, { waitUntil: 'networkidle' });

        // Perform login
        await this.performLogin(page, user);

        // Wait for navigation to complete
        await page.waitForURL(/.*/, { timeout: this.config.timeout });

        // Extract storage state
        const storageState = await context.storageState();
        const localStorage = await page.evaluate(() => {
          const storage: Record<string, string> = {};
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key) {
              storage[key] = window.localStorage.getItem(key) || '';
            }
          }
          return storage;
        });

        const sessionStorage = await page.evaluate(() => {
          const storage: Record<string, string> = {};
          for (let i = 0; i < window.sessionStorage.length; i++) {
            const key = window.sessionStorage.key(i);
            if (key) {
              storage[key] = window.sessionStorage.getItem(key) || '';
            }
          }
          return storage;
        });

        // Create auth state object
        const authState: AuthState = {
          cookies: storageState,
          localStorage,
          sessionStorage,
          metadata: {
            user: userKey,
            timestamp: new Date().toISOString(),
            browser: this.config.browserType || 'chromium',
            url: page.url(),
            expiresAt: this.calculateExpirationTime(),
          },
        };

        // Save auth state
        await this.saveAuthState(userKey, authState);

        this.logger.success(`Auth state generated for ${userKey}`);

        // Close context
        await context.close();
        return;
      } catch (error) {
        attempt++;
        if (attempt < maxAttempts) {
          this.logger.warn(`Attempt ${attempt} failed, retrying... (${error})`);
          await this.delay(this.config.timeout || 1000);
        } else {
          throw error;
        }
      }
    }
  }

  private async performLogin(page: playwright.Page, user: AuthUser): Promise<void> {
    this.logger.debug(`Logging in as ${user.username}`);

    // Standard login form
    const loginSelectors = {
      usernameInput: 'input[type="text"], input[name*="user"], input[name*="email"], input[id*="user"], input[id*="email"]',
      passwordInput: 'input[type="password"]',
      submitButton: 'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
    };

    try {
      // Fill username
      const usernameInput = page.locator(loginSelectors.usernameInput).first();
      if (await usernameInput.isVisible()) {
        await usernameInput.fill(user.username);
        this.logger.debug('Username entered');
      }

      // Fill password
      const passwordInput = page.locator(loginSelectors.passwordInput);
      if (await passwordInput.isVisible()) {
        await passwordInput.fill(user.password);
        this.logger.debug('Password entered');
      }

      // Submit form
      const submitButton = page.locator(loginSelectors.submitButton).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        this.logger.debug('Login form submitted');
      }

      // Wait for login to complete
      await page.waitForLoadState('networkidle', { timeout: this.config.timeout });

      // Handle MFA if needed
      if (user.mfaSecret || user.totp) {
        await this.handleMFA(page, user);
      }
    } catch (error) {
      this.logger.error(`Login failed: ${error}`);
      throw new Error(`Failed to login as ${user.username}: ${error}`);
    }
  }

  private async handleMFA(page: playwright.Page, user: AuthUser): Promise<void> {
    this.logger.debug('Handling MFA...');

    const mfaSelectors = {
      codeInput: 'input[name*="mfa"], input[name*="code"], input[name*="token"], input[id*="mfa"]',
      submitButton: 'button[type="submit"]',
    };

    try {
      const codeInput = page.locator(mfaSelectors.codeInput).first();

      if (await codeInput.isVisible()) {
        // If TOTP is provided, use it
        if (user.totp) {
          await codeInput.fill(user.totp);
          this.logger.debug('MFA code entered');

          const submitButton = page.locator(mfaSelectors.submitButton).first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    } catch (error) {
      this.logger.warn(`MFA handling failed: ${error}`);
    }
  }

  private async saveAuthState(userKey: string, authState: AuthState): Promise<void> {
    const filePath = path.join(this.config.authStorageDir, `${userKey}.json`);
    const filePathEncrypted = path.join(this.config.authStorageDir, `${userKey}.enc.json`);

    try {
      // Save plain JSON
      fs.writeFileSync(filePath, JSON.stringify(authState, null, 2));
      this.logger.debug(`Auth state saved: ${filePath}`);

      // Save encrypted version if encryption key is provided
      if (this.config.encryptionKey) {
        const encrypted = this.encryption.encrypt(JSON.stringify(authState));
        fs.writeFileSync(filePathEncrypted, JSON.stringify({ encrypted }, null, 2));
        this.logger.debug(`Encrypted auth state saved: ${filePathEncrypted}`);
      }
    } catch (error) {
      throw new Error(`Failed to save auth state for ${userKey}: ${error}`);
    }
  }

  private async launchBrowser(): Promise<void> {
    try {
      this.logger.debug('Launching browser...');
      this.browser = await playwright.chromium.launch({
        headless: this.config.headless !== false,
      });
      this.logger.success('Browser launched');
    } catch (error) {
      throw new Error(`Failed to launch browser: ${error}`);
    }
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      if (!fs.existsSync(this.config.authStorageDir)) {
        fs.mkdirSync(this.config.authStorageDir, { recursive: true });
        this.logger.debug(`Storage directory created: ${this.config.authStorageDir}`);
      }
    } catch (error) {
      throw new Error(`Failed to create storage directory: ${error}`);
    }
  }

  private calculateExpirationTime(hoursValid: number = 24): string {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursValid);
    return expirationDate.toISOString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// CONFIGURATION LOADER
// ============================================================================

class ConfigLoader {
  static loadFromEnv(): Partial<AuthConfig> {
    return {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      loginUrl: process.env.LOGIN_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/login`,
      authStorageDir: process.env.AUTH_STORAGE_DIR || './playwright/auth',
      browserType: (process.env.BROWSER_TYPE as 'chromium' | 'firefox' | 'webkit') || 'chromium',
      headless: process.env.HEADLESS !== 'false',
      timeout: parseInt(process.env.AUTH_TIMEOUT || '30000', 10),
      retryAttempts: parseInt(process.env.AUTH_RETRY_ATTEMPTS || '3', 10),
      dryRun: process.env.DRY_RUN === 'true',
      verbose: process.env.VERBOSE === 'true',
    };
  }

  static loadFromFile(filePath: string): AuthConfig {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load config from ${filePath}: ${error}`);
    }
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main(): Promise<void> {
  try {
    // Load configuration
    let config: AuthConfig;

    const configFile = process.env.AUTH_CONFIG || './config/auth-config.json';

    if (fs.existsSync(configFile)) {
      config = ConfigLoader.loadFromFile(configFile);
      // Merge with environment variables
      config = { ...ConfigLoader.loadFromEnv(), ...config } as AuthConfig;
    } else {
      // Use default configuration with environment overrides
      config = {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        loginUrl: process.env.LOGIN_URL || 'http://localhost:3000/login',
        authStorageDir: process.env.AUTH_STORAGE_DIR || './playwright/auth',
        users: {
          admin: {
            username: process.env.ADMIN_USERNAME || 'admin',
            password: process.env.ADMIN_PASSWORD || 'admin123',
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            role: 'admin',
          },
          user: {
            username: process.env.USER_USERNAME || 'user',
            password: process.env.USER_PASSWORD || 'user123',
            email: process.env.USER_EMAIL || 'user@example.com',
            role: 'user',
          },
        },
        ...ConfigLoader.loadFromEnv(),
      } as AuthConfig;
    }

    // Generate auth states
    const generator = new AuthStateGenerator(config);
    await generator.generateAuthStates();

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { AuthStateGenerator, ConfigLoader, EncryptionUtil, Logger };
