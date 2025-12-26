// vars/qaLibrary.groovy
// Playwright SDET+++++ Shared Library - Ultimate Edition
// Version: 3.2.0
// Features: Flaky Detection, Metrics, Performance Baseline, Auto-Ticketing, Chaos Ready

/* =========================================================
   ==================== INITIALIZATION =====================
   ========================================================= */
def initializePipeline(Map cfg = [:]) {
    echo """
╔════════════════════════════════════════════════════════╗
║        PLAYWRIGHT SDET+++++ PIPELINE v3.2.0            ║
╠════════════════════════════════════════════════════════╣
║ Build       : ${cfg.buildVersion ?: env.BUILD_NUMBER}
║ Environment : ${cfg.environment ?: params.ENVIRONMENT ?: 'N/A'}
║ Browser     : ${cfg.browser ?: 'all'}
║ Suite       : ${cfg.suite ?: 'all'}
║ Sharding    : ${cfg.totalShards ? "Enabled (${cfg.totalShards} shards)" : 'Disabled'}
╚════════════════════════════════════════════════════════╝
    """.stripIndent()

    // Set build metadata
    currentBuild.displayName = "#${env.BUILD_NUMBER} - ${cfg.environment ?: params.ENVIRONMENT}"
    currentBuild.description = "Suite: ${cfg.suite ?: 'all'} | Browser: ${cfg.browser ?: 'all'}"
}

/* =========================================================
   ===================== CONFIG VALIDATION ==================
   ========================================================= */
def validateConfig(def params) {
    if (!params?.ENVIRONMENT) {
        error "❌ ENVIRONMENT parameter is required"
    }
    if (params.UPDATE_SNAPSHOTS && params.ENVIRONMENT in ['production', 'pre-prod']) {
        error "❌ Snapshot updates forbidden in ${params.ENVIRONMENT}"
    }
    if (params.ENABLE_CHAOS && params.ENVIRONMENT == 'production') {
        error "❌ Chaos testing not allowed in production"
    }
    echo "✅ Configuration validated successfully"
}

/* =========================================================
   ===================== SCM & CACHE =======================
   ========================================================= */
def checkoutCode(Map cfg = [:]) {
    checkout([
        $class: 'GitSCM',
        branches: [[name: cfg.branch ?: env.GIT_BRANCH ?: '*/main']],
        userRemoteConfigs: [[url: cfg.repoUrl ?: env.GIT_URL, credentialsId: cfg.credentialsId ?: 'github-credentials']],
        extensions: [
            [$class: 'CleanBeforeCheckout'],
            [$class: 'CloneOption', shallow: cfg.shallow != false, depth: cfg.depth ?: 1]
        ]
    ])
}

def restoreCaches() {
    echo "📦 Restoring NPM, Browser, and Turbo caches (preserved in workspace)"
    // Cache is preserved by Jenkins workspace – no action needed
}

/* =========================================================
   ==================== DEPENDENCIES ========================
   ========================================================= */
def installDependencies(Map cfg = [:]) {
    echo "🔧 Installing dependencies..."
    sh 'npm ci --prefer-offline --no-audit'

    def browserArg = cfg.browser ? cfg.browser : ''
    sh "npx playwright install ${browserArg} --with-deps"
}

/* =========================================================
   ================= ENVIRONMENT SETUP =====================
   ========================================================= */
def configureEnvironment(Map cfg = [:]) {
    env.BASE_URL = cfg.baseUrl ?: "https://${cfg.environment}.example.com"
    env.ENVIRONMENT = cfg.environment
    echo "🔐 Environment configured: ${env.BASE_URL}"
}

/* =========================================================
   ================= PLAYWRIGHT EXECUTION ===================
   ========================================================= */
def runPlaywrightShard(Map cfg) {
    def args = []

    args << "--project=${cfg.browser ?: 'chromium'}"
    args << "--shard=${cfg.shardIndex}/${cfg.totalShards}"
    args << "--timeout=${cfg.timeout ?: 60000}"
    args << "--reporter=html,list,junit,blob"

    if (cfg.grep)        args << "--grep='${cfg.grep}'"
    if (cfg.grepInvert)  args << "--grep-invert='${cfg.grepInvert}'"
    if (cfg.updateSnapshots) args << "--update-snapshots"

    def recording = cfg.recording
        ? "--video=on --trace=on --screenshot=on"
        : "--video=retain-on-failure --trace=retain-on-failure --screenshot=only-on-failure"

    def outputDir = cfg.outputDir ?: "playwright-report/shard-${cfg.shardIndex}"
    def junitFile = "${cfg.junitDir ?: 'junit-results'}/${cfg.browser}-shard-${cfg.shardIndex}.xml"

    sh """
        mkdir -p ${outputDir}
        npx playwright test \
            ${args.join(' ')} \
            ${recording} \
            --output=${outputDir} \
            --junit-output=${junitFile}
    """
}

/* =========================================================
   ===================== ARTIFACTS =========================
   ========================================================= */
def archiveShardArtifacts(Map cfg = [:]) {
    def dir = cfg.outputDir ?: 'playwright-report'
    archiveArtifacts artifacts: "${dir}/**/*", allowEmptyArchive: true, fingerprint: true
    archiveArtifacts artifacts: "${cfg.junitDir ?: 'junit-results'}/**/*.xml", allowEmptyArchive: true
}

/* =========================================================
   ===================== REPORT MERGING =====================
   ========================================================= */
def mergeReports(Map cfg = [:]) {
    sh "npx playwright merge-reports --reporter html ${cfg.blobDir ?: 'blob-report'} -o ${cfg.outputDir ?: 'playwright-report'}"
}

/* =========================================================
   =================== FLAKY DETECTION ======================
   ========================================================= */
def detectFlakyTests(Map cfg = [:]) {
    echo "🔍 Running flaky test detection (history: ${cfg.history ?: 10} builds)"

    sh """
        node scripts/detect-flaky-tests.js \
            --input ${cfg.resultsDir ?: 'playwright-report'} \
            --history ${cfg.history ?: 10} \
            --threshold ${cfg.threshold ?: 0.2} \
            --output flaky-report.json || true
    """

    if (fileExists('flaky-report.json')) {
        def report = readJSON file: 'flaky-report.json'
        if (report.flakyTests.size() > 0) {
            echo "⚠️ Found ${report.flakyTests.size()} flaky tests"
            if (cfg.createTickets) {
                report.flakyTests.each { test ->
                    createJiraTicket([
                        project: 'QA',
                        summary: "Flaky Test: ${test.name}",
                        description: "Flaky rate: ${(test.flakyRate*100).round(2)}%\nPath: ${test.path}",
                        labels: ['flaky', 'automation'],
                        priority: test.flakyRate > 0.5 ? 'High' : 'Medium'
                    ])
                }
            }
        }
        archiveArtifacts artifacts: 'flaky-report.json', allowEmptyArchive: true
    }
}

/* =========================================================
   ======================= METRICS ==========================
   ========================================================= */
def sendMetric(String name, value, Map tags = [:]) {
    def defaultTags = [
        job: env.JOB_NAME,
        build: env.BUILD_NUMBER,
        environment: params.ENVIRONMENT,
        branch: env.GIT_BRANCH
    ] + tags

    def tagsStr = defaultTags.collect { k, v -> "${k}:${v}" }.join(',')

    sh """
        curl -X POST "https://api.datadoghq.com/api/v1/series" \
            -H "DD-API-KEY: \${DATADOG_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{
                "series": [{
                    "metric": "playwright.${name}",
                    "points": [[${System.currentTimeMillis()/1000}, ${value}]],
                    "type": "gauge",
                    "tags": ["${tagsStr}"]
                }]
            }' || true
    """
}

def collectPipelineMetrics(Map cfg = [:]) {
    sendMetric('pipeline.duration', cfg.duration / 1000, [status: cfg.result])
    sendMetric('tests.total', cfg.totalTests ?: 0)
    sendMetric('tests.passed', cfg.passedTests ?: 0)
    sendMetric('tests.failed', cfg.failedTests ?: 0)
    sendMetric('tests.flaky', cfg.flakyTests ?: 0)
}

/* =========================================================
   ==================== NOTIFICATIONS =======================
   ========================================================= */
def sendNotifications(Map cfg = [:]) {
    def status = currentBuild.currentResult
    def color = status == 'SUCCESS' ? 'good' : (status == 'UNSTABLE' ? 'warning' : 'danger')

    def message = """
*Playwright Tests ${status}*
Build #${env.BUILD_NUMBER}
Environment: ${cfg.environment}
Duration: ${cfg.duration ? formatDuration(cfg.duration) : 'N/A'}
View: ${env.BUILD_URL}
    """.trim()

    try {
        slackSend channel: cfg.channel ?: '#qa-automation', color: color, message: message
    } catch (e) {
        echo "ℹ️ Slack notification skipped: ${e.message}"
    }
}

/* =========================================================
   ===================== PIPELINE EVENTS ====================
   ========================================================= */
def onSuccess()  { echo "🎉 Pipeline completed successfully!" }
def onFailure()  { echo "❌ Pipeline failed – check reports, traces, and videos" }
def onUnstable() { echo "⚠️ Pipeline unstable – review flaky tests and quality gates" }

/* =========================================================
   ====================== CLEANUP ==========================
   ========================================================= */
def cleanup() {
    cleanWs(
        deleteDirs: true,
        notFailBuild: true,
        cleanWhenNotBuilt: false,
        patterns: [[pattern: '.npm-cache', type: 'EXCLUDE'],
                   [pattern: '.playwright-browsers', type: 'EXCLUDE']]
    )
}

def formatDuration(long ms) {
    def minutes = ms / 60000
    def seconds = (ms % 60000) / 1000
    return "${minutes}m ${seconds}s"
}