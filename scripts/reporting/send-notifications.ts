import axios, { AxiosInstance } from 'axios';
import { Logger } from '@utils/loggerUtil';

export enum NotificationStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  flaky?: number;
  total: number;
  duration: number; // in ms
  timestamp: string;
  environment?: string;
  branch?: string;
  commit?: string;
  testSuite?: string;
  buildUrl?: string;
  reportUrl?: string;
  failureDetails?: FailureDetail[];
  tags?: string[];
}

export interface FailureDetail {
  testName: string;
  errorMessage: string;
  stackTrace?: string;
  screenshotUrl?: string;
  videoUrl?: string;
  traceUrl?: string;
}

interface NotificationConfig {
  teamsWebhook?: string;
  slackWebhook?: string;
  discordWebhook?: string;
  genericWebhook?: string;
}

interface NotificationPayload {
  name: string;
  payload: Record<string, any>;
  url?: string;
}

export class NotificationService {
  private readonly config: NotificationConfig;
  private readonly logger = new Logger();
  private readonly axiosInstance: AxiosInstance;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  constructor() {
    this.config = {
      teamsWebhook: process.env.TEAMS_WEBHOOK_URL,
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      discordWebhook: process.env.DISCORD_WEBHOOK_URL,
      genericWebhook: process.env.GENERIC_WEBHOOK_URL,
    };

    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async sendNotifications(results: TestResults): Promise<void> {
    const status = this.determineStatus(results);
    const notifications = this.buildNotifications(results, status);

    this.logger.info(`🚀 Starting notification dispatch (${notifications.length} channels)`);

    const promises = notifications.map(notification => this.sendWithRetry(notification));
    const results_sent = await Promise.allSettled(promises);

    const successful = results_sent.filter(r => r.status === 'fulfilled').length;
    const failed = results_sent.filter(r => r.status === 'rejected').length;

    this.logger.info(`📢 Notification dispatch completed: ${successful} successful, ${failed} failed`);

    // ✅ FIX 1: Fehlerbericht hinzugefügt
    if (failed > 0) {
      const errors = results_sent
        .filter(r => r.status === 'rejected')
        .map((r: any) => r.reason?.message || 'Unknown error');
      
      this.logger.error(`⚠️  Failed notifications:\n${errors.join('\n')}`);
    }
  }

  private async sendWithRetry(notification: NotificationPayload, attempt: number = 1): Promise<void> {
    const { name, payload, url } = notification;

    if (!url) {
      this.logger.warn(`⚠️  ${name} webhook not configured – skipping`);
      return;
    }

    try {
      await this.axiosInstance.post(url, payload);
      this.logger.info(`✅ ${name} notification sent (attempt ${attempt})`);
    } catch (error: any) {
      if (attempt < this.maxRetries) {
        // ✅ FIX 2: Exponential Backoff implementiert
        const exponentialDelay = this.retryDelay * Math.pow(2, attempt - 1);
        this.logger.warn(`⚠️  ${name} notification failed (attempt ${attempt}/${this.maxRetries}). Retrying in ${exponentialDelay}ms...`);
        await this.delay(exponentialDelay);
        return this.sendWithRetry(notification, attempt + 1);
      }

      const errorMessage = error.response?.statusText || error.message || 'Unknown error';
      const statusCode = error.response?.status || 'N/A';
      this.logger.error(`❌ Failed to send ${name} notification after ${this.maxRetries} attempts (${statusCode}: ${errorMessage})`);
      throw new Error(`Notification failed: ${name} – ${errorMessage}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private determineStatus(results: TestResults): NotificationStatus {
    if (results.failed > 0) return NotificationStatus.FAILURE;
    if (results.skipped > 0 || (results.flaky ?? 0) > 0) return NotificationStatus.WARNING;
    return NotificationStatus.SUCCESS;
  }

  private buildNotifications(results: TestResults, status: NotificationStatus): NotificationPayload[] {
    return [
      { name: 'Teams', payload: this.formatTeams(results, status), url: this.config.teamsWebhook },
      { name: 'Slack', payload: this.formatSlack(results, status), url: this.config.slackWebhook },
      { name: 'Discord', payload: this.formatDiscord(results, status), url: this.config.discordWebhook },
      { name: 'Generic', payload: this.formatGeneric(results, status), url: this.config.genericWebhook },
    ];
  }

  private formatTeams(results: TestResults, status: NotificationStatus) {
    const themeColor = {
      [NotificationStatus.SUCCESS]: '28a745',
      [NotificationStatus.WARNING]: 'ffc107',
      [NotificationStatus.FAILURE]: 'dc3545',
      [NotificationStatus.INFO]: '0078d4',
    }[status];

    const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : '0';

    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor,
      summary: `Test Results: ${results.passed}/${results.total} passed (${passRate}%)`,
      title: `🧪 Automated Test Report – ${status}`,
      sections: [
        {
          activityTitle: status === NotificationStatus.SUCCESS ? '🎉 All Tests Passed!' : '⚠️ Tests Completed',
          activitySubtitle: new Date(results.timestamp).toLocaleString('de-DE', { timeZoneName: 'short' }),
          activityImage: status === NotificationStatus.SUCCESS
            ? 'https://img.icons8.com/fluency/96/ok.png'
            : 'https://img.icons8.com/fluency/96/close-window.png',
          facts: [
            { name: '📦 Suite', value: results.testSuite || 'Playwright Tests' },
            { name: '🌍 Environment', value: results.environment || 'N/A' },
            { name: '🔀 Branch', value: results.branch || 'N/A' },
            { name: '🔨 Commit', value: results.commit?.slice(0, 7) || 'N/A' },
            { name: '⏱️ Duration', value: `${(results.duration / 1000).toFixed(2)}s` },
            { name: '📊 Total', value: results.total.toString() },
            { name: '✅ Passed', value: results.passed.toString() },
            { name: '❌ Failed', value: results.failed.toString() },
            { name: '⏭️ Skipped', value: results.skipped.toString() },
            { name: '🔄 Flaky', value: (results.flaky || 0).toString() },
            { name: '📈 Pass Rate', value: `${passRate}%` },
          ],
          markdown: true,
        },
        ...(results.failureDetails && results.failureDetails.length > 0
          ? [this.formatTeamsFailures(results.failureDetails)]
          : []),
      ],
      potentialAction: [
        ...(results.buildUrl ? [{
          '@type': 'OpenUri',
          name: '🔗 View Build',
          targets: [{ os: 'default', uri: results.buildUrl }],
        }] : []),
        ...(results.reportUrl ? [{
          '@type': 'OpenUri',
          name: '📊 View Report',
          targets: [{ os: 'default', uri: results.reportUrl }],
        }] : []),
      ],
    };
  }

  private formatSlack(results: TestResults, status: NotificationStatus) {
    const emoji = {
      [NotificationStatus.SUCCESS]: '🎉',
      [NotificationStatus.FAILURE]: '🚨',
      [NotificationStatus.WARNING]: '⚠️',
      [NotificationStatus.INFO]: 'ℹ️',
    }[status];

    const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : '0';

    return {
      username: 'SDET+++++ Bot',
      icon_emoji: ':robot_face:',
      text: `${emoji} *Test Results*: ${results.passed}/${results.total} passed (${passRate}%)`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `${emoji} Automated Test Report` },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Suite:*\n${results.testSuite || 'Playwright'}` },
            { type: 'mrkdwn', text: `*Environment:*\n${results.environment || 'N/A'}` },
            { type: 'mrkdwn', text: `*Branch:*\n${results.branch || 'N/A'}` },
            { type: 'mrkdwn', text: `*Duration:*\n${(results.duration / 1000).toFixed(2)}s` },
            { type: 'mrkdwn', text: `*Total:*\n${results.total}` },
            { type: 'mrkdwn', text: `*Passed:*\n${results.passed} ✅` },
            { type: 'mrkdwn', text: `*Failed:*\n${results.failed} ❌` },
            { type: 'mrkdwn', text: `*Pass Rate:*\n${passRate}%` },
          ],
        },
        ...(results.failureDetails && results.failureDetails.length > 0
          ? [{
              type: 'section',
              text: { type: 'mrkdwn', text: `*❌ Failures (${results.failureDetails.length})*` },
            }]
          : []),
        {
          type: 'actions',
          elements: [
            ...(results.buildUrl ? [{ type: 'button', text: { type: 'plain_text', text: 'View Build' }, url: results.buildUrl }] : []),
            ...(results.reportUrl ? [{ type: 'button', text: { type: 'plain_text', text: 'View Report' }, url: results.reportUrl }] : []),
          ],
        },
      ],
    };
  }

  private formatDiscord(results: TestResults, status: NotificationStatus) {
    const color = {
      [NotificationStatus.SUCCESS]: 0x28a745,
      [NotificationStatus.WARNING]: 0xffc107,
      [NotificationStatus.FAILURE]: 0xdc3545,
      [NotificationStatus.INFO]: 0x0078d4,
    }[status];

    const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : '0';

    return {
      embeds: [{
        title: '🧪 Automated Test Report',
        description: `**${status}** – ${results.passed}/${results.total} passed (${passRate}%)`,
        color,
        timestamp: results.timestamp,
        fields: [
          { name: 'Suite', value: results.testSuite || 'Playwright', inline: true },
          { name: 'Environment', value: results.environment || 'N/A', inline: true },
          { name: 'Branch', value: results.branch || 'N/A', inline: true },
          { name: 'Duration', value: `${(results.duration / 1000).toFixed(2)}s`, inline: true },
          { name: 'Passed', value: `${results.passed} ✅`, inline: true },
          { name: 'Failed', value: `${results.failed} ❌`, inline: true },
          { name: 'Skipped', value: `${results.skipped} ⏭️`, inline: true },
          { name: 'Pass Rate', value: `${passRate}%`, inline: true },
        ],
        footer: { text: 'SDET+++++ Notification Service' },
      }],
    };
  }

  private formatGeneric(results: TestResults, status: NotificationStatus) {
    return {
      text: `Test Results: ${status}\nPassed: ${results.passed}/${results.total}\nDuration: ${(results.duration / 1000).toFixed(2)}s`,
      status,
      results,
    };
  }

  private formatTeamsFailures(failures: FailureDetail[]) {
    return {
      type: 'section',
      activityTitle: `❌ ${failures.length} Failed Test(s)`,
      facts: failures.slice(0, 10).map(f => ({
        name: f.testName,
        value: f.errorMessage.substring(0, 200) + (f.errorMessage.length > 200 ? '...' : ''),
      })),
      markdown: true,
    };
  }
}

// Singleton Export
export default new NotificationService();