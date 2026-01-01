// src/tests/support/plugins/index.ts
import CONFIG from '../env';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🔌 PLUGIN SYSTEM
 * Advanced plugin management for test infrastructure
 */

export interface PluginInterface {
  name: string;
  initialize: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

class PluginManager {
  private plugins: PluginInterface[] = [];
  private initialized: boolean = false;

  /**
   * Register a plugin
   */
  register(plugin: PluginInterface): void {
    this.plugins.push(plugin);
    console.log(`🔌 Plugin registered: ${plugin.name}`);
  }

  /**
   * Initialize all plugins
   */
  async initializeAll(): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️  Plugins already initialized');
      return;
    }

    console.log('\n🔌 ========================================');
    console.log('🔌           INITIALIZING PLUGINS');
    console.log('🔌   ========================================\n');

    for (const plugin of this.plugins) {
      try {
        await plugin.initialize();
        console.log(`✅ ${plugin.name} initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${plugin.name}:`, error);
      }
    }

    this.initialized = true;
    console.log('\n✅ All plugins initialized\n');
  }

  /**
   * Cleanup all plugins
   */
  async cleanupAll(): Promise<void> {
    console.log('\n🧹 Cleaning up plugins...\n');

    for (const plugin of this.plugins) {
      if (plugin.cleanup) {
        try {
          await plugin.cleanup();
          console.log(`✅ ${plugin.name} cleaned up`);
        } catch (error) {
          console.error(`❌ Failed to cleanup ${plugin.name}:`, error);
        }
      }
    }
  }
}

// Global plugin manager instance
const pluginManager = new PluginManager();

/**
 * 📊 METRICS PLUGIN
 * Collects and aggregates test metrics
 */
const metricsPlugin: PluginInterface = {
  name: 'Metrics Plugin',
  
  initialize: async () => {
    if (!CONFIG.features.metrics) {
      console.log('   ⏭️  Metrics disabled in config');
      return;
    }

    const metricsDir = path.resolve(process.cwd(), 'metrics');
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }

    // Initialize metrics storage
    const metricsFile = path.join(metricsDir, 'aggregated_metrics.json');
    if (!fs.existsSync(metricsFile)) {
      fs.writeFileSync(metricsFile, JSON.stringify({
        testRuns: [],
        summary: {
          totalTests: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          avgDuration: 0
        }
      }, null, 2));
    }

    console.log('   📊 Metrics collection enabled');
    console.log(`   📂 Metrics directory: ${metricsDir}`);
  },

  cleanup: async () => {
    // Aggregate all metrics
    const metricsDir = path.resolve(process.cwd(), 'metrics');
    const files = fs.readdirSync(metricsDir).filter(f => f.endsWith('.json') && f !== 'aggregated_metrics.json');
    
    const allMetrics = files.map(file => {
      const content = fs.readFileSync(path.join(metricsDir, file), 'utf-8');
      return JSON.parse(content);
    });

    // Calculate aggregates
    const summary = {
      totalTests: allMetrics.length,
      passed: allMetrics.filter(m => m.status === 'PASSED').length,
      failed: allMetrics.filter(m => m.status === 'FAILED').length,
      skipped: allMetrics.filter(m => m.status === 'SKIPPED').length,
      avgDuration: allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length || 0,
      timestamp: new Date().toISOString()
    };

    const aggregatedPath = path.join(metricsDir, 'aggregated_metrics.json');
    fs.writeFileSync(aggregatedPath, JSON.stringify({
      testRuns: allMetrics,
      summary
    }, null, 2));

    console.log(`   📊 Aggregated metrics: ${summary.totalTests} tests, ${summary.passed} passed, ${summary.failed} failed`);
  }
};

/**
 * ♿ ACCESSIBILITY PLUGIN
 * Automated accessibility testing integration
 */
const accessibilityPlugin: PluginInterface = {
  name: 'Accessibility Plugin',
  
  initialize: async () => {
    if (!CONFIG.features.accessibility) {
      console.log('   ⏭️  Accessibility testing disabled in config');
      return;
    }

    const a11yDir = path.resolve(process.cwd(), 'accessibility-reports');
    if (!fs.existsSync(a11yDir)) {
      fs.mkdirSync(a11yDir, { recursive: true });
    }

    console.log('   ♿ Accessibility testing enabled');
    console.log('   📌 WCAG Level: AA (default)');
    console.log(`   📂 Reports directory: ${a11yDir}`);
  }
};

/**
 * 🎨 VISUAL REGRESSION PLUGIN
 * Visual comparison and regression testing
 */
const visualRegressionPlugin: PluginInterface = {
  name: 'Visual Regression Plugin',
  
  initialize: async () => {
    if (!CONFIG.features.visualRegression) {
      console.log('   ⏭️  Visual regression disabled in config');
      return;
    }

    const dirs = ['visual-baseline', 'visual-actual', 'visual-diff'];
    dirs.forEach(dir => {
      const dirPath = path.resolve(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    console.log('   🎨 Visual regression testing enabled');
    console.log('   📂 Baseline: ./visual-baseline');
    console.log('   📂 Actual: ./visual-actual');
    console.log('   📂 Diff: ./visual-diff');
  }
};

/**
 * 📹 VIDEO RECORDING PLUGIN
 * Automated video capture configuration
 */
const videoPlugin: PluginInterface = {
  name: 'Video Recording Plugin',
  
  initialize: async () => {
    if (!CONFIG.features.video) {
      console.log('   ⏭️  Video recording disabled in config');
      return;
    }

    const videoDir = path.resolve(process.cwd(), 'videos');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    console.log('   📹 Video recording enabled');
    console.log(`   📂 Videos directory: ${videoDir}`);
    console.log('   ⚙️  Video will be saved for failed tests');
  }
};

/**
 * 🔍 TRACING PLUGIN
 * Playwright trace configuration
 */
const tracingPlugin: PluginInterface = {
  name: 'Tracing Plugin',
  
  initialize: async () => {
    if (!CONFIG.features.trace) {
      console.log('   ⏭️  Tracing disabled in config');
      return;
    }

    const traceDir = path.resolve(process.cwd(), 'traces');
    if (!fs.existsSync(traceDir)) {
      fs.mkdirSync(traceDir, { recursive: true });
    }

    console.log('   🔍 Tracing enabled');
    console.log(`   📂 Traces directory: ${traceDir}`);
    console.log('   💡 View traces with: npx playwright show-trace <trace-file>');
  }
};

/**
 * 📝 REPORTING PLUGIN
 * Advanced HTML report generation
 */
const reportingPlugin: PluginInterface = {
  name: 'Reporting Plugin',
  
  initialize: async () => {
    const reportDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    console.log('   📝 HTML reporting enabled');
    console.log(`   📂 Reports directory: ${reportDir}`);
  },

  cleanup: async () => {
    const reportDir = path.resolve(process.cwd(), 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `test-report-${timestamp}.html`);

    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .metric { background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #4CAF50; }
        .metric.failed { border-left-color: #f44336; }
        .metric h3 { margin: 0; font-size: 2em; color: #333; }
        .metric p { margin: 10px 0 0; color: #666; }
        .config { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .config h2 { margin-top: 0; color: #1976d2; }
        .config ul { list-style: none; padding: 0; }
        .config li { padding: 5px 0; color: #555; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test Execution Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <div class="config">
            <h2>⚙️ Configuration</h2>
            <ul>
                <li><strong>Browser:</strong> ${CONFIG.browser}</li>
                <li><strong>Environment:</strong> ${CONFIG.env}</li>
                <li><strong>Headless:</strong> ${CONFIG.launchOptions.headless ? 'Yes' : 'No'}</li>
                <li><strong>Viewport:</strong> ${CONFIG.viewport.width}x${CONFIG.viewport.height}</li>
            </ul>
        </div>

        <h2>📊 Features Enabled</h2>
        <div class="config">
            <ul>
                <li>📹 Video Recording: ${CONFIG.features.video ? '✅' : '❌'}</li>
                <li>🔍 Tracing: ${CONFIG.features.trace ? '✅' : '❌'}</li>
                <li>📊 Metrics: ${CONFIG.features.metrics ? '✅' : '❌'}</li>
                <li>♿ Accessibility: ${CONFIG.features.accessibility ? '✅' : '❌'}</li>
                <li>🎨 Visual Regression: ${CONFIG.features.visualRegression ? '✅' : '❌'}</li>
            </ul>
        </div>

        <div class="footer">
            <p>🚀 Powered by Cucumber + Playwright + TypeScript</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    fs.writeFileSync(reportFile, htmlReport);
    console.log(`   📝 HTML report generated: ${reportFile}`);
  }
};

/**
 * 🚀 MAIN REGISTRATION FUNCTION
 * Register and initialize all plugins
 */
export async function registerPlugins(): Promise<void> {
  // Register all plugins
  pluginManager.register(metricsPlugin);
  pluginManager.register(accessibilityPlugin);
  pluginManager.register(visualRegressionPlugin);
  pluginManager.register(videoPlugin);
  pluginManager.register(tracingPlugin);
  pluginManager.register(reportingPlugin);

  // Initialize all registered plugins
  await pluginManager.initializeAll();
}

/**
 * 🧹 CLEANUP FUNCTION
 * Cleanup all plugins
 */
export async function cleanupPlugins(): Promise<void> {
  await pluginManager.cleanupAll();
}

// Export plugin manager for advanced usage
export { pluginManager };

export default registerPlugins;