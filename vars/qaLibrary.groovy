// vars/qaLibrary.groovy
// Playwright SDET+++++ Shared Library
// Version: 3.1.0

/* =========================================================
   ================ PIPELINE BOOTSTRAP =====================
   ========================================================= */

def initializePipeline(Map cfg = [:]) {
    echo "🚀 Initializing Playwright Enterprise Pipeline"
    echo "Build Version : ${cfg.buildVersion ?: env.BUILD_NUMBER}"
    echo "Environment   : ${cfg.environment ?: 'N/A'}"
}

/* =========================================================
   ===================== HEADER ============================
   ========================================================= */

def displayHeader(Map cfg = [:]) {
    echo """
╔════════════════════════════════════════════════════════╗
║        PLAYWRIGHT ENTERPRISE PIPELINE                  ║
╠════════════════════════════════════════════════════════╣
║ Build       : ${cfg.version ?: env.BUILD_NUMBER}
║ Environment : ${cfg.environment ?: 'N/A'}
║ Browser     : ${cfg.browser ?: 'chromium'}
║ Suite       : ${cfg.suite ?: 'default'}
║ Sharding    : ${cfg.totalShards ? 'Enabled' : 'Disabled'}
╚════════════════════════════════════════════════════════╝
""".stripIndent()
}

/* =========================================================
   ================= CONFIG VALIDATION ====================
   ========================================================= */

def validateConfig(def params) {
    if (!params?.ENVIRONMENT) {
        error "❌ ENVIRONMENT parameter is mandatory"
    }

    if (params.UPDATE_SNAPSHOTS &&
        params.ENVIRONMENT in ['production', 'pre-prod']) {
        error "❌ Snapshot updates are forbidden in ${params.ENVIRONMENT}"
    }

    echo "✅ Configuration validated"
}

/* =========================================================
   ==================== SCM CHECKOUT ======================
   ========================================================= */

def checkoutCode(Map cfg = [:]) {
    checkout([
        $class: 'GitSCM',
        branches: [[name: cfg.branch ?: env.GIT_BRANCH ?: '*/main']],
        userRemoteConfigs: [[
            url: cfg.repoUrl ?: env.GIT_URL,
            credentialsId: cfg.credentialsId ?: 'github-credentials'
        ]],
        extensions: [
            [$class: 'CleanBeforeCheckout'],
            [$class: 'CloneOption',
                shallow: cfg.shallow != false,
                depth: cfg.depth ?: 1
            ]
        ]
    ])
}

/* =========================================================
   ================= DEPENDENCIES ==========================
   ========================================================= */

def installDependencies(Map cfg = [:]) {
    echo "🔧 Installing dependencies"
    sh 'npm ci --no-audit --prefer-offline'

    def browser = cfg.browser ?: ''
    sh "npx playwright install ${browser} --with-deps"
}

/* =========================================================
   ================= ENV CONFIGURATION =====================
   ========================================================= */

def configureEnvironment(Map cfg = [:]) {
    if (!cfg.environment) {
        error "❌ Missing environment configuration"
    }

    env.BASE_URL = cfg.baseUrl ?: "https://${cfg.environment}.example.com"
    echo "🔐 Environment configured for ${cfg.environment}"
}

/* =========================================================
   ================= PLAYWRIGHT EXECUTION ==================
   ========================================================= */

def runPlaywrightShard(Map cfg) {
    def args = []

    args << "--project=${cfg.browser ?: 'chromium'}"
    args << "--timeout=${cfg.timeout ?: 60000}"
    args << "--reporter=html,list,junit"
    args << "--output=${cfg.outputDir ?: 'playwright-report'}"
    args << "--junit-output=${cfg.junitDir ?: 'junit-results'}/" +
            "${cfg.browser}-shard-${cfg.shardIndex ?: 1}.xml"

    if (cfg.totalShards) {
        args << "--shard=${cfg.shardIndex}/${cfg.totalShards}"
    }
    if (cfg.grep)        args << "--grep='${cfg.grep}'"
    if (cfg.grepInvert)  args << "--grep-invert='${cfg.grepInvert}'"
    if (cfg.updateSnapshots) args << "--update-snapshots"

    def recording = cfg.recording
        ? "--video=on --trace=on"
        : "--video=retain-on-failure --trace=retain-on-failure"

    sh """
        npx playwright test \
        ${args.join(' ')} \
        ${recording}
    """
}

/* =========================================================
   ==================== ARTIFACTS ==========================
   ========================================================= */

def archiveArtifactsSafe(String path) {
    archiveArtifacts artifacts: path, allowEmptyArchive: true
}

def archiveShardArtifacts(Map cfg = [:]) {
    archiveArtifactsSafe("${cfg.outputDir ?: 'playwright-report'}/**/*")
    archiveArtifactsSafe("${cfg.junitDir ?: 'junit-results'}/**/*.xml")
}

/* =========================================================
   ================= REPORT MERGING ========================
   ========================================================= */

def mergeReports(Map cfg = [:]) {
    sh """
        npx playwright merge-reports \
        --reporter html \
        ${cfg.blobDir ?: 'blob-report'} \
        -o ${cfg.outputDir ?: 'playwright-report'}
    """
}

def publishHTMLReport(Map cfg = [:]) {
    publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: cfg.reportDir ?: 'playwright-report',
        reportFiles: 'index.html',
        reportName: cfg.reportName ?: 'Playwright Report'
    ])
}

/* =========================================================
   ================= NOTIFICATIONS =========================
   ========================================================= */

def sendNotifications(Map cfg = [:]) {
    def status = currentBuild.currentResult
    def color  = status == 'SUCCESS' ? 'good' : 'danger'

    def message = """
Playwright Tests: ${status}
Build #${env.BUILD_NUMBER}
Environment: ${cfg.environment}
""".trim()

    try {
        slackSend channel: cfg.slackChannel ?: '#qa',
                  color: color,
                  message: message
    } catch (ignored) {
        echo "ℹ️ Slack notification skipped"
    }
}

/* =========================================================
   ================= PIPELINE EVENTS =======================
   ========================================================= */

def onSuccess()  { echo "🎉 All tests passed" }
def onFailure()  { echo "❌ Pipeline failed – see reports & traces" }
def onUnstable() { echo "⚠️ Unstable build – flaky tests detected" }

/* =========================================================
   ====================== CLEANUP ==========================
   ========================================================= */

def cleanup() {
    cleanWs(
        deleteDirs: true,
        notFailBuild: true,
        cleanWhenNotBuilt: false
    )
}
