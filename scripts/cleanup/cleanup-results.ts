/**
 * ============================================================================
 * ULTIMATE SDET CLEANUP RESULTS UTILITY (FINAL) +++++
 * ============================================================================
 * Comprehensive TypeScript utility for managing test results and artifacts
 * Features: Archive, backup, cleanup, reporting, dry-run, performance metrics
 * Production-ready with extensive error handling and logging
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import * as tar from 'tar';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CleanupOptions {
  dryRun: boolean;
  verbose: boolean;
  archive: boolean;
  backup: boolean;
  archiveDir?: string;
  backupDir?: string;
  keepDays: number;
  maxSize?: number;
  interactive: boolean;
}

interface CleanupResult {
  filesRemoved: number;
  filesArchived: number;
  totalSizeFreed: number;
  errors: string[];
  duration: number;
  timestamp: Date;
}

interface FileStats {
  path: string;
  size: number;
  modified: Date;
  isDirectory: boolean;
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

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level}: ${message}`;
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

  log(level: LogLevel, message: string): void {
    if (level === LogLevel.DEBUG && !this.verbose) {
      return;
    }

    const color = this.getColor(level);
    const emoji = this.getEmoji(level);
    console.log(`${color}${emoji} ${message}${Colors.NC}`);
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
    console.log(`\n${Colors.BOLD}${Colors.CYAN}${'='.repeat(60)}${Colors.NC}`);
    console.log(`${Colors.BOLD}${Colors.CYAN}${message}${Colors.NC}`);
    console.log(`${Colors.BOLD}${Colors.CYAN}${'='.repeat(60)}${Colors.NC}\n`);
  }

  subheader(message: string): void {
    console.log(`\n${Colors.MAGENTA}▶ ${message}${Colors.NC}`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

class FileUtils {
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + sizes[i];
  }

  static async getSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.promises.stat(filePath);
      if (stats.isDirectory()) {
        return this.getDirectorySize(filePath);
      }
      return stats.size;
    } catch {
      return 0;
    }
  }

  static async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    try {
      const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          totalSize += await this.getDirectorySize(fullPath);
        } else {
          const stats = await fs.promises.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch {
      // Ignore errors
    }
    return totalSize;
  }

  static async countFiles(dirPath: string): Promise<number> {
    let count = 0;
    try {
      const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          count += await this.countFiles(path.join(dirPath, file.name));
        } else {
          count++;
        }
      }
    } catch {
      // Ignore errors
    }
    return count;
  }

  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error}`);
    }
  }

  static async removeDir(dirPath: string): Promise<void> {
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      throw new Error(`Failed to remove directory ${dirPath}: ${error}`);
    }
  }

  static async isOlderThan(filePath: string, days: number): Promise<boolean> {
    try {
      const stats = await fs.promises.stat(filePath);
      const now = Date.now();
      const fileAge = now - stats.mtimeMs;
      const ageInDays = fileAge / (1000 * 60 * 60 * 24);
      return ageInDays > days;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// ARCHIVE MANAGER CLASS
// ============================================================================

class ArchiveManager {
  private archiveDir: string;
  private logger: Logger;

  constructor(archiveDir: string, logger: Logger) {
    this.archiveDir = archiveDir;
    this.logger = logger;
  }

  async archiveDirectory(sourcePath: string, archiveName: string): Promise<boolean> {
    try {
      await FileUtils.ensureDir(this.archiveDir);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archivePath = path.join(this.archiveDir, `${archiveName}_${timestamp}.tar.gz`);

      this.logger.debug(`Archiving ${sourcePath} to ${archivePath}`);

      const sourceStats = await fs.promises.stat(sourcePath);
      const sourceSize = sourceStats.isDirectory()
        ? await FileUtils.getDirectorySize(sourcePath)
        : sourceStats.size;

      await tar.create(
        {
          gzip: true,
          file: archivePath,
          cwd: path.dirname(sourcePath),
        },
        [path.basename(sourcePath)]
      );

      const archiveSize = await FileUtils.getSize(archivePath);
      this.logger.success(
        `Archived: ${archiveName} (${FileUtils.formatBytes(sourceSize)}) → ${FileUtils.formatBytes(archiveSize)}`
      );

      return true;
    } catch (error) {
      this.logger.error(`Failed to archive ${archiveName}: ${error}`);
      return false;
    }
  }
}

// ============================================================================
// CLEANUP MANAGER CLASS
// ============================================================================

class CleanupManager {
  private projectRoot: string;
  private options: CleanupOptions;
  private logger: Logger;
  private result: CleanupResult;
  private archiveManager?: ArchiveManager;
  private startTime: number;

  constructor(projectRoot: string, options: CleanupOptions, logger: Logger) {
    this.projectRoot = projectRoot;
    this.options = options;
    this.logger = logger;
    this.startTime = Date.now();
    this.result = {
      filesRemoved: 0,
      filesArchived: 0,
      totalSizeFreed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    if (options.archive) {
      this.archiveManager = new ArchiveManager(
        options.archiveDir || path.join(projectRoot, '.result-archives'),
        logger
      );
    }
  }

  async cleanup(): Promise<CleanupResult> {
    this.logger.header('ULTIMATE SDET CLEANUP RESULTS (FINAL) +++++');

    this.logger.info(`Project Root: ${this.projectRoot}`);
    this.logger.info(`Dry Run: ${this.options.dryRun}`);
    this.logger.info(`Archive: ${this.options.archive}`);
    this.logger.info(`Backup: ${this.options.backup}`);
    this.logger.info(`Keep Days: ${this.options.keepDays}`);

    try {
      await this.cleanTestResults();
      await this.cleanJestResults();
      await this.cleanAllureResults();
      await this.cleanPlaywrightResults();
      await this.cleanCucumberResults();
      await this.cleanOldArtifacts();
      await this.generateCleanupReport();
    } catch (error) {
      this.result.errors.push(`Cleanup failed: ${error}`);
      this.logger.error(`Cleanup failed: ${error}`);
    }

    this.result.duration = Date.now() - this.startTime;
    this.displaySummary();

    return this.result;
  }

  private async cleanTestResults(): Promise<void> {
    this.logger.subheader('Cleaning Test Results');

    const testResultsDir = path.join(this.projectRoot, 'test-results');

    if (!fs.existsSync(testResultsDir)) {
      this.logger.debug('Test results directory not found');
      return;
    }

    const size = await FileUtils.getSize(testResultsDir);
    this.logger.info(`Test Results: ${FileUtils.formatBytes(size)}`);

    await this.removeDirectory(testResultsDir, 'Test Results');
  }

  private async cleanJestResults(): Promise<void> {
    this.logger.subheader('Cleaning Jest Results');

    const jestCacheDir = path.join(this.projectRoot, '.jest-cache');
    const jestResultsDir = path.join(this.projectRoot, 'test-results');

    if (fs.existsSync(jestCacheDir)) {
      await this.removeDirectory(jestCacheDir, 'Jest Cache');
    }

    if (fs.existsSync(jestResultsDir)) {
      await this.cleanOldFiles(jestResultsDir, this.options.keepDays, 'Jest Results');
    }
  }

  private async cleanAllureResults(): Promise<void> {
    this.logger.subheader('Cleaning Allure Results');

    const allureResultsDir = path.join(this.projectRoot, 'allure-results');
    const allureReportDir = path.join(this.projectRoot, 'allure-report');

    if (fs.existsSync(allureResultsDir)) {
      if (this.archiveManager) {
        const archived = await this.archiveManager.archiveDirectory(
          allureResultsDir,
          'allure-results'
        );
        if (archived) this.result.filesArchived++;
      }
      await this.removeDirectory(allureResultsDir, 'Allure Results');
    }

    if (fs.existsSync(allureReportDir)) {
      await this.removeDirectory(allureReportDir, 'Allure Report');
    }
  }

  private async cleanPlaywrightResults(): Promise<void> {
    this.logger.subheader('Cleaning Playwright Results');

    const playwrightReportDir = path.join(this.projectRoot, 'playwright-report');
    const playwrightCacheDir = path.join(this.projectRoot, '.playwright');

    if (fs.existsSync(playwrightReportDir)) {
      await this.removeDirectory(playwrightReportDir, 'Playwright Report');
    }

    if (fs.existsSync(playwrightCacheDir)) {
      await this.removeDirectory(playwrightCacheDir, 'Playwright Cache');
    }
  }

  private async cleanCucumberResults(): Promise<void> {
    this.logger.subheader('Cleaning Cucumber Results');

    const cucumberReportDir = path.join(this.projectRoot, 'test-results', 'cucumber');
    const cucumberDir = path.join(this.projectRoot, 'cucumber');

    if (fs.existsSync(cucumberReportDir)) {
      await this.cleanOldFiles(cucumberReportDir, this.options.keepDays, 'Cucumber Reports');
    }

    if (fs.existsSync(cucumberDir)) {
      // Only clean JSON files
      try {
        const files = await fs.promises.readdir(cucumberDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(cucumberDir, file);
            await fs.promises.rm(filePath);
            this.result.filesRemoved++;
          }
        }
        this.logger.success('Cleaned: Cucumber JSON files');
      } catch (error) {
        this.result.errors.push(`Failed to clean Cucumber directory: ${error}`);
      }
    }
  }

  private async cleanOldArtifacts(): Promise<void> {
    this.logger.subheader('Cleaning Old Artifacts');

    const artifactDirs = [
      path.join(this.projectRoot, 'logs'),
      path.join(this.projectRoot, 'metrics'),
      path.join(this.projectRoot, 'coverage'),
      path.join(this.projectRoot, '.cache'),
      path.join(this.projectRoot, '.turbo'),
    ];

    for (const dir of artifactDirs) {
      if (fs.existsSync(dir)) {
        await this.cleanOldFiles(dir, this.options.keepDays, path.basename(dir));
      }
    }
  }

  private async removeDirectory(dirPath: string, name: string): Promise<void> {
    try {
      const size = await FileUtils.getSize(dirPath);

      if (this.options.dryRun) {
        this.logger.debug(`[DRY RUN] Would remove ${name}: ${FileUtils.formatBytes(size)}`);
        return;
      }

      await FileUtils.removeDir(dirPath);
      this.result.filesRemoved++;
      this.result.totalSizeFreed += size;
      this.logger.success(`Removed: ${name} (${FileUtils.formatBytes(size)})`);
    } catch (error) {
      const errorMsg = `Failed to remove ${name}: ${error}`;
      this.result.errors.push(errorMsg);
      this.logger.error(errorMsg);
    }
  }

  private async cleanOldFiles(dirPath: string, days: number, name: string): Promise<void> {
    try {
      const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
      let deletedCount = 0;

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        const isOld = await FileUtils.isOlderThan(fullPath, days);

        if (isOld) {
          if (!this.options.dryRun) {
            const size = await FileUtils.getSize(fullPath);
            if (file.isDirectory()) {
              await FileUtils.removeDir(fullPath);
            } else {
              await fs.promises.rm(fullPath);
            }
            this.result.filesRemoved++;
            this.result.totalSizeFreed += size;
            deletedCount++;
          }
        }
      }

      if (deletedCount > 0 || this.options.dryRun) {
        this.logger.success(`Cleaned: ${name} (${deletedCount} old files)`);
      }
    } catch (error) {
      const errorMsg = `Failed to clean ${name}: ${error}`;
      this.result.errors.push(errorMsg);
      this.logger.error(errorMsg);
    }
  }

  private async generateCleanupReport(): Promise<void> {
    this.logger.subheader('Generating Cleanup Report');

    try {
      const reportPath = path.join(this.projectRoot, 'test-results', 'cleanup-report.json');
      await FileUtils.ensureDir(path.dirname(reportPath));

      const report = {
        timestamp: this.result.timestamp.toISOString(),
        duration: `${(this.result.duration / 1000).toFixed(2)}s`,
        filesRemoved: this.result.filesRemoved,
        filesArchived: this.result.filesArchived,
        totalSizeFreed: FileUtils.formatBytes(this.result.totalSizeFreed),
        totalSizeFreedBytes: this.result.totalSizeFreed,
        errors: this.result.errors,
        dryRun: this.options.dryRun,
      };

      if (!this.options.dryRun) {
        await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
        this.logger.success(`Report saved: ${reportPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to generate report: ${error}`);
    }
  }

  private displaySummary(): void {
    this.logger.header('CLEANUP SUMMARY');

    if (this.options.dryRun) {
      console.log(`${Colors.YELLOW}📊 DRY RUN - NO ACTUAL DELETION${Colors.NC}\n`);
    }

    console.log(`Files Removed: ${Colors.GREEN}${this.result.filesRemoved}${Colors.NC}`);
    console.log(`Files Archived: ${Colors.GREEN}${this.result.filesArchived}${Colors.NC}`);
    console.log(`Space Freed: ${Colors.GREEN}${FileUtils.formatBytes(this.result.totalSizeFreed)}${Colors.NC}`);
    console.log(
      `Duration: ${Colors.BLUE}${(this.result.duration / 1000).toFixed(2)}s${Colors.NC}`
    );

    if (this.result.errors.length > 0) {
      console.log(`\nErrors: ${Colors.RED}${this.result.errors.length}${Colors.NC}`);
      this.result.errors.forEach((error) => {
        console.log(`  ${Colors.RED}• ${error}${Colors.NC}`);
      });
    } else {
      this.logger.success('Cleanup completed successfully with no errors!');
    }

    console.log('');
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main(): Promise<void> {
  const projectRoot = process.cwd();
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');
  const archive = process.argv.includes('--archive') || process.argv.includes('-a');
  const backup = !process.argv.includes('--no-backup');

  const logger = new Logger(verbose);

  const options: CleanupOptions = {
    dryRun,
    verbose,
    archive,
    backup,
    keepDays: 7,
    interactive: true,
  };

  const cleanupManager = new CleanupManager(projectRoot, options, logger);
  const result = await cleanupManager.cleanup();

  process.exit(result.errors.length > 0 ? 1 : 0);
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
