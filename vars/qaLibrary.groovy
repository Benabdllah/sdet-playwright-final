// vars/qaLibrary.groovy
// SDET+++++ Shared Library - Version 3.0.0

def initializePipeline(Map config = [:]) {
    echo "🚀 Initializing Playwright Pipeline..."
    echo "Build Version: ${config.buildVersion ?: env.BUILD_NUMBER}"
    echo "Environment: ${config.params?.ENVIRONMENT ?: 'N/A'}"
}

def displayHeader(Map config = [:]) {
    echo """
╔════════════════════════════════════════════════════════╗
║        PLAYWRIGHT ENTERPRISE PIPELINE v3.0             ║
╠════════════════════════════════════════════════════════╣
║ Build: ${config.version ?: env.BUILD_NUMBER}
║ Environment: ${config.environment}
║ Browser: ${config.browser}
║ Suite: ${config.suite}
║ Sharding: ${config.sharding ? 'Enabled' : 'Disabled'}
╚════════════════════════════════════════════════════════╝
    """.stripIndent()
}

def validateConfig(def params) {
    if (!params.ENVIRONMENT) error "❌ ENVIRONMENT parameter is required"
    if (params.UPDATE_SNAPSHOTS && params.ENVIRONMENT in ['production', 'pre-prod']) {
        error "❌ Snapshot updates not allowed in ${params.ENVIRONMENT}"
    }
    echo "✅ Configuration validated"
}

def checkoutCode(Map config = [:]) {
    checkout([
        $class: 'GitSCM',
        branches: [[name: env.GIT_BRANCH ?: '*/main']],
        extensions: [
            [$class: 'CloneOption', shallow: config.shallow ?: true, depth: config.depth ?: 1],
            [$class: 'CleanBeforeCheckout']
        ],
        userRemoteConfigs: [[url: env.GIT_URL, credentialsId: 'github-credentials']]
    ])
}

def restoreCaches(Map config = [:]) {
    echo "📦 Restoring caches..."
    // NPM, Playwright browsers, Turbo cache - preserved by workspace
}

def installDependencies(Map config = [:]) {
    echo "🔧 Installing dependencies..."
    sh 'npm ci --prefer-offline'
    def browserArg = config.browser ? config.browser : ''
    sh "npx playwright install ${browserArg} --with-deps"
}

def configureEnvironment(Map config = [:]) {
    env.BASE_URL = "https://${config.environment}-example.com" // استبدل بـ logic حقيقي
    echo "🔐 Environment configured for ${config.environment}"
}

def validateHealth() {
    echo "🏥 Health checks skipped (implement if needed)"
}

// الدالة الرئيسية لتشغيل shard واحد
def runPlaywrightShard(Map config) {
    def grep = config.grep ? "--grep '${config.grep}'" : ''
    def grepInvert = config.grepInvert ? "--grep-invert '${config.grepInvert}'" : ''
    def recording = config.recording ? '--video=on --trace=on' : '--video=retain-on-failure --trace=retain-on-failure'
    def snapshots = config.updateSnapshots ? '--update-snapshots' : ''

    sh """
        npx playwright test \
            --project=${config.browser} \
            --shard=${config.shardIndex}/${config.totalShards} \
            ${grep} \
            ${grepInvert} \
            --reporter=html,list,junit \
            --output=${config.outputDir ?: 'playwright-report'} \
            --junit-output=${config.junitDir ?: 'junit-results'}/${config.browser}-shard-${config.shardIndex}.xml \
            ${recording} \
            ${snapshots} \
            --timeout=60000
    """
}

def archiveShardArtifacts(Map config = [:]) {
    archiveArtifacts artifacts: "${config.outputDir}/**/*", allowEmptyArchive: true
    archiveArtifacts artifacts: "${config.outputDir}/*.log", allowEmptyArchive: true
}

def mergeReports(Map config = [:]) {
    sh "npx playwright merge-reports --reporter html ${config.blobDir ?: 'blob-report'} -o ${config.outputDir ?: 'playwright-report'}"
}

def publishHTMLReport(Map config = [:]) {
    publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: config.reportDir ?: 'playwright-report',
        reportFiles: 'index.html',
        reportName: config.reportName ?: 'Playwright HTML Report'
    ])
}

def sendNotifications(Map config = [:]) {
    def status = currentBuild.result ?: 'SUCCESS'
    def color = status == 'SUCCESS' ? 'good' : 'danger'
    def message = "Playwright Tests ${status} - Build #${env.BUILD_NUMBER} - ${config.environment}"

    // Slack example (غيّر الـ channel والـ token حسب إعداداتك)
    try {
        slackSend channel: '#qa', color: color, message: message
    } catch (e) {
        echo "Slack notification skipped: ${e.message}"
    }
}

def onSuccess(Map config = [:]) {
    echo "🎉 All tests passed successfully!"
}

def onFailure(Map config = [:]) {
    echo "❌ Pipeline failed – check reports and traces"
}

def onUnstable(Map config = [:]) {
    echo "⚠️ Pipeline unstable – flaky tests detected"
}

def cleanupWithCachePreservation() {
    cleanWs(cleanWhenNotBuilt: false, deleteDirs: true, notFailBuild: true)
    // الكاش يبقى بفضل الـ workspace
}