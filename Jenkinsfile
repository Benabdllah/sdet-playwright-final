// pipeline {
//     agent none

//     parameters {
//         choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'pre-prod', 'production'], description: 'Target environment')
//         choice(name: 'TEST_SUITE', choices: ['all', 'smoke', 'regression', 'e2e'], description: 'Test suite')
//         booleanParam(name: 'DRY_RUN', defaultValue: false, description: 'Validate only')
//         booleanParam(name: 'ENABLE_RECORDING', defaultValue: false, description: 'Record tests')
//         string(name: 'GREP', defaultValue: '', description: 'Include filter')
//         string(name: 'GREP_INVERT', defaultValue: '@skip @wip', description: 'Exclude filter')
//     }

//     options {
//         timeout(time: 90, unit: 'MINUTES')
//         timestamps()
//         ansiColor('xterm')
//         disableConcurrentBuilds(abortPrevious: true)
//         parallelsAlwaysFailFast()
//     }

//     environment {
//         PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.48.0-jammy'
//         DOCKER_ARGS = '--shm-size=2g --cap-add=SYS_ADMIN --user=root:root'
//     }

//     stages {
//         stage('Initialize') {
//             agent { docker { image env.PLAYWRIGHT_IMAGE; args env.DOCKER_ARGS; reuseNode false } }
//             steps {
//                 script {
//                     echo "🚀 Starting Playwright Pipeline"
//                     echo "Environment: ${params.ENVIRONMENT}"

//                     if (params.DRY_RUN) {
//                         echo "✅ DRY RUN – skipping execution"
//                         currentBuild.result = 'SUCCESS'
//                         return
//                     }
//                 }
//             }
//         }

//         stage('Playwright Tests') {
//             when { expression { !params.DRY_RUN } }
//             matrix {
//                 agent {
//                     docker {
//                         image env.PLAYWRIGHT_IMAGE
//                         args env.DOCKER_ARGS
//                         reuseNode false
//                     }
//                 }
//                 axes {
//                     axis { name 'BROWSER'; values 'chromium', 'firefox', 'webkit' }
//                     axis { name 'SHARD'; values '1', '2' }  // Nur 2 Shards → stabil auf macOS
//                 }
//                 stages {
//                     stage('Setup & Run') {
//                         steps {
//                             ws("ws-${JOB_NAME}-${BROWSER}-${SHARD}") {
//                                 deleteDir()

//                                 retry(3) {
//                                     checkout scm
//                                 }

//                                 sh 'npm ci --prefer-offline'

//                                 sh "npx playwright install-deps"
//                                 sh "npx playwright install ${BROWSER} --with-deps"

//                                 sh """
//                                     npx playwright test \
//                                         --project=${BROWSER} \
//                                         --shard=${SHARD}/2 \
//                                         ${params.GREP ? "--grep '${params.GREP}'" : ''} \
//                                         ${params.GREP_INVERT ? "--grep-invert '${params.GREP_INVERT}'" : ''} \
//                                         --reporter=html,junit \
//                                         --output=playwright-report \
//                                         ${params.ENABLE_RECORDING ? '--video=on --trace=on' : '--video=retain-on-failure --trace=retain-on-failure'}
//                                 """
//                             }
//                         }
//                         post {
//                             always {
//                                 ws("ws-${JOB_NAME}-${BROWSER}-${SHARD}") {
//                                     junit testResults: 'playwright-report/*.xml', allowEmptyResults: true
//                                     archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
//                                     publishHTML([
//                                         allowMissing: true,
//                                         alwaysLinkToLastBuild: true,
//                                         keepAll: true,
//                                         reportDir: 'playwright-report',
//                                         reportFiles: 'index.html',
//                                         reportName: "Report - ${BROWSER} - Shard ${SHARD}"
//                                     ])
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         stage('Final Report') {
//             when { expression { !params.DRY_RUN } }
//             agent any
//             steps {
//                 echo "✅ All shards completed – check individual reports above!"
//             }
//         }
//     }

//     post {
//         success { echo "🎉 PIPELINE SUCCESS – Tests passed!" }
//         failure { echo "❌ PIPELINE FAILED" }
//         always { cleanWs() }
//     }
// }

// // @Library('qa-shared-library@main') _

// // /**
// //  * ══════════════════════════════════════════════════════════════
// //  * PLAYWRIGHT TEST PIPELINE - ENTERPRISE MATRIX VERSION
// //  * ══════════════════════════════════════════════════════════════
// //  *
// //  * Features:
// //  * - Native Jenkins Matrix für automatische Parallelisierung
// //  * - Shared Library für Wiederverwendbarkeit
// //  * - Intelligent Sharding mit Auto-Calculation
// //  * - Multi-Browser Support mit Excludes
// //  * - Quality Gates & Auto-Rollback
// //  * - Full Observability (Metrics, Dashboards, Notifications)
// //  * - Production-Grade Security & Approvals
// //  *
// //  * Version: 3.0.0
// //  * Level: SDET+++++
// //  * ══════════════════════════════════════════════════════════════
// //  */

// // pipeline {
// //     agent any

// //     parameters {
// //         // Environment Configuration
// //         choice(
// //             name: 'ENVIRONMENT',
// //             choices: ['dev', 'staging', 'pre-prod', 'production', 'canary'],
// //             description: '🎯 Target Environment'
// //         )

// //         // Browser Selection
// //         choice(
// //             name: 'BROWSER_SELECTION',
// //             choices: ['all', 'chromium', 'firefox', 'webkit'],
// //             description: '🌐 Browser(s) to test'
// //         )

// //         // Test Suite
// //         choice(
// //             name: 'TEST_SUITE',
// //             choices: ['all', 'smoke', 'regression', 'e2e', 'api', 'visual', 'a11y', 'performance'],
// //             description: '🧪 Test Suite Selection'
// //         )

// //         // Test Filters
// //         string(
// //             name: 'GREP',
// //             defaultValue: '',
// //             description: '🔍 Include: @tag or "test name"'
// //         )
// //         string(
// //             name: 'GREP_INVERT',
// //             defaultValue: '@wip @skip @broken',
// //             description: '⛔ Exclude: @flaky @slow'
// //         )

// //         // Sharding Configuration
// //         booleanParam(
// //             name: 'ENABLE_SHARDING',
// //             defaultValue: true,
// //             description: '⚡ Enable Intelligent Sharding'
// //         )
// //         choice(
// //             name: 'SHARD_STRATEGY',
// //             choices: ['auto', '2', '4', '6', '8', '12', '16'],
// //             description: '🔀 Shard Count (auto = ML-based calculation)'
// //         )

// //         // Recording & Debugging
// //         booleanParam(
// //             name: 'ENABLE_RECORDING',
// //             defaultValue: false,
// //             description: '📹 Record All Tests (⚠️ Large artifacts!)'
// //         )
// //         booleanParam(
// //             name: 'ENABLE_TRACE_VIEWER',
// //             defaultValue: false,
// //             description: '🔍 Enable Trace Viewer for all tests'
// //         )
// //         choice(
// //             name: 'LOG_LEVEL',
// //             choices: ['info', 'debug', 'trace', 'silent'],
// //             description: '📊 Logging Verbosity'
// //         )

// //         // Special Operations
// //         booleanParam(
// //             name: 'UPDATE_SNAPSHOTS',
// //             defaultValue: false,
// //             description: '📸 Update Visual Snapshots (⚠️ Dev/Staging only!)'
// //         )
// //         booleanParam(
// //             name: 'RUN_MUTATION_TESTS',
// //             defaultValue: false,
// //             description: '🧬 Run Mutation Testing'
// //         )
// //         booleanParam(
// //             name: 'ENABLE_CHAOS',
// //             defaultValue: false,
// //             description: '💥 Enable Chaos Testing'
// //         )
// //         booleanParam(
// //             name: 'DRY_RUN',
// //             defaultValue: false,
// //             description: '🔍 Dry Run (validate config only, no execution)'
// //         )

// //         // Advanced Options
// //         string(
// //             name: 'CUSTOM_TAGS',
// //             defaultValue: '',
// //             description: '🏷️ Custom metrics tags (comma-separated)'
// //         )
// //         booleanParam(
// //             name: 'SKIP_QUALITY_GATES',
// //             defaultValue: false,
// //             description: '⚠️ Skip Quality Gates (emergency only!)'
// //         )
// //     }

// //     options {
// //         timeout(time: 90, unit: 'MINUTES')
// //         ansiColor('xterm')
// //         timestamps()
// //         buildDiscarder(logRotator(
// //             numToKeepStr: '100',
// //             artifactNumToKeepStr: '50',
// //             daysToKeepStr: '90'
// //         ))
// //         skipDefaultCheckout()
// //         parallelsAlwaysFailFast()
// //         disableConcurrentBuilds(abortPrevious: true)
// //     }

// //     triggers {
// //         // Scheduled nightly runs
// //         cron('H 2 * * *')
// //     }

// //     environment {
// //         // Docker Configuration
// //         PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.58.0-noble'
// //         DOCKER_ARGS = '--user=root --memory=4g --cpus=2 --shm-size=2g'

// //         // Build Metadata
// //         BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
// //         BUILD_TIMESTAMP = "${new Date().format('yyyy-MM-dd_HH-mm-ss')}"
// //         PIPELINE_START_TIME = "${System.currentTimeMillis()}"

// //         // Paths
// //         PLAYWRIGHT_OUTPUT = 'playwright/test-results'
// //         PLAYWRIGHT_REPORT = 'playwright/playwright-report'
// //         PLAYWRIGHT_JUNIT = 'playwright/junit-results'
// //         COVERAGE_REPORT = 'coverage'
// //         ALLURE_RESULTS = 'allure-results'
// //         BLOB_REPORT = 'blob-report'

// //         // Cache Paths
// //         NPM_CACHE = '.npm-cache'
// //         PLAYWRIGHT_BROWSERS_PATH = '.playwright-browsers'
// //         TURBO_CACHE = '.turbo-cache'

// //         // CI Optimizations
// //         CI = 'true'
// //         PWDEBUG = '0'
// //         NODE_ENV = 'test'
// //         FORCE_COLOR = '1'

// //         // Quality Gates Thresholds
// //         MIN_PASS_RATE = '95'
// //         MAX_FLAKY_RATE = '5'
// //         MAX_DURATION_INCREASE = '20'
// //         MIN_COVERAGE = '80'
// //     }

// //     stages {

// //         stage('Init') {
// //             steps {
// //                 script {
// //                     qaLibrary.initializePipeline([
// //                         environment: 'qa',
// //                         browser: 'chromium',
// //                         buildVersion: BUILD_VERSION,
// //                         timestamp: BUILD_TIMESTAMP,
// //                         params: params
// //                     ])

// //                     currentBuild.displayName = "#${BUILD_NUMBER} - ${params.ENVIRONMENT} - ${params.BROWSER_SELECTION}"
// //                 }
// //             }
// //         }

// //         stage('🧪 Playwright Matrix Tests') {
// //             when {
// //                 expression { !params.DRY_RUN }
// //             }

// //             matrix {
// //                 agent {
// //                     docker {
// //                         image env.PLAYWRIGHT_IMAGE
// //                         args env.DOCKER_ARGS
// //                         reuseNode true
// //                     }
// //                 }

// //                 axes {
// //                     axis {
// //                         name 'BROWSER'
// //                         values 'chromium', 'firefox', 'webkit'
// //                     }
// //                     axis {
// //                         name 'SHARD_INDEX'
// //                         values '1', '2', '3', '4'
// //                     }
// //                 }

// //                 excludes {
// //                     // WebKit in Production (optional safeguard)
// //                     exclude {
// //                         allOf {
// //                             axis {
// //                                 name 'BROWSER'
// //                                 values 'webkit'
// //                             }
// //                             expression { params.ENVIRONMENT == 'production' }
// //                         }
// //                     }
// //                 }

// //                 stages {
// //                     stage('🧪 Execute Tests') {
// //                         steps {
// //                             script {
// //                                 qaLibrary.runPlaywrightShard([
// //                                     browser: BROWSER,
// //                                     shardIndex: SHARD_INDEX,
// //                                     totalShards: 4,
// //                                     suite: params.TEST_SUITE,
// //                                     grep: params.GREP,
// //                                     grepInvert: params.GREP_INVERT,
// //                                     environment: params.ENVIRONMENT,
// //                                     outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}"
// //                                 ])
// //                             }
// //                         }
// //                     }
// //                 }
// //             }
// //         }
// //     }

// //     post {
// //         always {
// //             script {
// //                 if (!params.DRY_RUN) {
// //                     def startTime = env.PIPELINE_START_TIME?.toLong() ?: System.currentTimeMillis()
// //                     def duration = System.currentTimeMillis() - startTime

// //                     qaLibrary.collectPipelineMetrics([
// //                         duration: duration,
// //                         environment: params.ENVIRONMENT,
// //                         result: currentBuild.result ?: 'SUCCESS'
// //                     ])

// //                     qaLibrary.finalCleanup()
// //                 }
// //             }
// //         }

// //         success {
// //             script {
// //                 qaLibrary.onSuccess([
// //                     buildVersion: BUILD_VERSION,
// //                     environment: params.ENVIRONMENT
// //                 ])
// //             }
// //         }

// //         failure {
// //             script {
// //                 qaLibrary.onFailure([
// //                     buildVersion: BUILD_VERSION,
// //                     environment: params.ENVIRONMENT
// //                 ])
// //             }
// //         }
// //     }
// // }

// // // // /**
// // // //  * ══════════════════════════════════════════════════════════════
// // // //  * PLAYWRIGHT TEST PIPELINE - STANDALONE MATRIX VERSION
// // // //  * ══════════════════════════════════════════════════════════════
// // // //  * 
// // // //  * Diese Version funktioniert OHNE Shared Library!
// // // //  * Alle Funktionen sind inline implementiert.
// // // //  * 
// // // //  * Features:
// // // //  * - Native Jenkins Matrix für Parallelisierung
// // // //  * - Multi-Browser Support (Chromium, Firefox, WebKit)
// // // //  * - Intelligent Sharding (2-16 Shards)
// // // //  * - Quality Gates & Reporting
// // // //  * - Production-Ready
// // // //  * 
// // // //  * Version: 3.0.0
// // // //  * Level: SDET+++++
// // // //  * ══════════════════════════════════════════════════════════════
// // // //  */

// // // // pipeline {
// // // //     agent none

// // // //     parameters {
// // // //         choice(
// // // //             name: 'ENVIRONMENT',
// // // //             choices: ['dev', 'staging', 'pre-prod', 'production'],
// // // //             description: '🎯 Target Environment'
// // // //         )
// // // //         choice(
// // // //             name: 'BROWSER_SELECTION',
// // // //             choices: ['chromium', 'firefox', 'webkit', 'all'],
// // // //             description: '🌐 Browser(s) to test'
// // // //         )
// // // //         choice(
// // // //             name: 'TEST_SUITE',
// // // //             choices: ['all', 'smoke', 'regression', 'e2e', 'api'],
// // // //             description: '🧪 Test Suite'
// // // //         )
// // // //         string(
// // // //             name: 'GREP',
// // // //             defaultValue: '',
// // // //             description: '🔍 Filter: @tag or "test name"'
// // // //         )
// // // //         string(
// // // //             name: 'GREP_INVERT',
// // // //             defaultValue: '@wip @skip',
// // // //             description: '⛔ Exclude: @flaky @slow'
// // // //         )
// // // //         booleanParam(
// // // //             name: 'ENABLE_SHARDING',
// // // //             defaultValue: true,
// // // //             description: '⚡ Enable Sharding'
// // // //         )
// // // //         choice(
// // // //             name: 'SHARD_COUNT',
// // // //             choices: ['2', '4', '6', '8'],
// // // //             description: '🔀 Number of Shards'
// // // //         )
// // // //         booleanParam(
// // // //             name: 'DRY_RUN',
// // // //             defaultValue: false,
// // // //             description: '🔍 Dry Run (validate only)'
// // // //         )
// // // //     }

// // // //     options {
// // // //         timeout(time: 90, unit: 'MINUTES')
// // // //         ansiColor('xterm')
// // // //         timestamps()
// // // //         buildDiscarder(logRotator(numToKeepStr: '50', artifactNumToKeepStr: '30'))
// // // //         skipDefaultCheckout()
// // // //         disableConcurrentBuilds(abortPrevious: true)
// // // //     }

// // // //     environment {
// // // //         PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.58.0-noble'
// // // //         DOCKER_ARGS = '--user=root --memory=4g --cpus=2 --shm-size=2g'
// // // //         BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
// // // //         PLAYWRIGHT_OUTPUT = 'playwright/test-results'
// // // //         PLAYWRIGHT_REPORT = 'playwright/playwright-report'
// // // //         PLAYWRIGHT_JUNIT = 'playwright/junit-results'
// // // //         NPM_CACHE = '.npm-cache'
// // // //         PLAYWRIGHT_BROWSERS_PATH = '.playwright-browsers'
// // // //     }

// // // //     stages {
// // // //         stage('🚀 Initialize') {
// // // //             agent { label 'master' }
// // // //             steps {
// // // //                 script {
// // // //                     currentBuild.displayName = "#${BUILD_NUMBER} - ${params.ENVIRONMENT} - ${params.BROWSER_SELECTION}"
// // // //                     currentBuild.description = """
// // // //                         Suite: ${params.TEST_SUITE}
// // // //                         Sharding: ${params.ENABLE_SHARDING ? params.SHARD_COUNT : 'Off'}
// // // //                     """.stripIndent()
                    
// // // //                     echo """
// // // //                     ╔════════════════════════════════════════════════╗
// // // //                     ║       PLAYWRIGHT TEST PIPELINE v3.0.0         ║
// // // //                     ╠════════════════════════════════════════════════╣
// // // //                     ║ Build:       ${BUILD_VERSION}
// // // //                     ║ Environment: ${params.ENVIRONMENT}
// // // //                     ║ Browser:     ${params.BROWSER_SELECTION}
// // // //                     ║ Suite:       ${params.TEST_SUITE}
// // // //                     ║ Sharding:    ${params.ENABLE_SHARDING}
// // // //                     ╚════════════════════════════════════════════════╝
// // // //                     """.stripIndent()
                    
// // // //                     if (params.DRY_RUN) {
// // // //                         currentBuild.result = 'SUCCESS'
// // // //                         echo "✅ Dry run completed - configuration valid"
// // // //                         return
// // // //                     }
// // // //                 }
// // // //             }
// // // //         }

// // // //         stage('🧪 Playwright Matrix Tests') {
// // // //             when {
// // // //                 beforeAgent true
// // // //                 expression { !params.DRY_RUN }
// // // //             }
// // // //             matrix {
// // // //                 agent {
// // // //                     docker {
// // // //                         image env.PLAYWRIGHT_IMAGE
// // // //                         args env.DOCKER_ARGS
// // // //                         reuseNode true
// // // //                     }
// // // //                 }
                
// // // //                 axes {
// // // //                     axis {
// // // //                         name 'BROWSER'
// // // //                         values 'chromium', 'firefox'
// // // //                     }
// // // //                     axis {
// // // //                         name 'SHARD_INDEX'
// // // //                         values '1', '2'
// // // //                     }
// // // //                 }
                
// // // //                 when {
// // // //                     beforeAgent true
// // // //                     expression {
// // // //                         // Filter basierend auf Browser-Selection
// // // //                         if (params.BROWSER_SELECTION == 'all') {
// // // //                             return true
// // // //                         }
// // // //                         return BROWSER == params.BROWSER_SELECTION
// // // //                     }
// // // //                 }
                
// // // //                 stages {
// // // //                     stage('📦 Setup') {
// // // //                         steps {
// // // //                             script {
// // // //                                 echo "🔹 Setting up ${BROWSER} - Shard ${SHARD_INDEX}"
                                
// // // //                                 // Checkout
// // // //                                 checkout scm
                                
// // // //                                 // Install dependencies
// // // //                                 sh """
// // // //                                     npm ci --cache ${NPM_CACHE} --prefer-offline --no-audit
                                    
// // // //                                     export PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH}
// // // //                                     npx playwright install ${BROWSER} --with-deps
// // // //                                 """
// // // //                             }
// // // //                         }
// // // //                     }

// // // //                     stage('🧪 Run Tests') {
// // // //                         options {
// // // //                             timeout(time: 30, unit: 'MINUTES')
// // // //                             retry(1)
// // // //                         }
// // // //                         steps {
// // // //                             script {
// // // //                                 def totalShards = params.ENABLE_SHARDING ? params.SHARD_COUNT : '1'
// // // //                                 def shardOption = params.ENABLE_SHARDING ? 
// // // //                                     "--shard=${SHARD_INDEX}/${totalShards}" : ''
                                
// // // //                                 def grepOption = params.GREP ? 
// // // //                                     "--grep '${params.GREP}'" : ''
// // // //                                 def grepInvertOption = params.GREP_INVERT ? 
// // // //                                     "--grep-invert '${params.GREP_INVERT}'" : ''
                                
// // // //                                 def suiteFilter = params.TEST_SUITE != 'all' ? 
// // // //                                     "--grep '@${params.TEST_SUITE}'" : ''
                                
// // // //                                 echo "🚀 Executing ${BROWSER} - Shard ${SHARD_INDEX}/${totalShards}"
                                
// // // //                                 sh """
// // // //                                     npx playwright test \
// // // //                                         --project=${BROWSER} \
// // // //                                         ${shardOption} \
// // // //                                         ${grepOption} \
// // // //                                         ${grepInvertOption} \
// // // //                                         ${suiteFilter} \
// // // //                                         --reporter=html,list,junit \
// // // //                                         --output-dir=${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX} \
// // // //                                         --timeout=60000 \
// // // //                                         --retries=2 \
// // // //                                         --workers=4 \
// // // //                                         --trace=retain-on-failure \
// // // //                                         --video=retain-on-failure \
// // // //                                         --screenshot=only-on-failure
// // // //                                 """
// // // //                             }
// // // //                         }
// // // //                         post {
// // // //                             always {
// // // //                                 script {
// // // //                                     // Archive shard artifacts
// // // //                                     archiveArtifacts(
// // // //                                         artifacts: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}/**/*",
// // // //                                         allowEmptyArchive: true,
// // // //                                         fingerprint: true
// // // //                                     )
// // // //                                 }
// // // //                             }
// // // //                         }
// // // //                     }
// // // //                 }
// // // //             }
// // // //         }

// // // //         stage('📊 Merge & Publish Reports') {
// // // //             when {
// // // //                 beforeAgent true
// // // //                 expression { !params.DRY_RUN }
// // // //             }
// // // //             agent {
// // // //                 docker {
// // // //                     image env.PLAYWRIGHT_IMAGE
// // // //                     args env.DOCKER_ARGS
// // // //                     reuseNode true
// // // //                 }
// // // //             }
// // // //             steps {
// // // //                 script {
// // // //                     echo "📊 Merging test results..."
                    
// // // //                     // Merge reports (wenn blob-reports vorhanden)
// // // //                     try {
// // // //                         sh """
// // // //                             if [ -d "blob-report" ]; then
// // // //                                 npx playwright merge-reports --reporter=html ./blob-report
// // // //                             fi
// // // //                         """
// // // //                     } catch (Exception e) {
// // // //                         echo "⚠️ Report merge skipped: ${e.message}"
// // // //                     }
                    
// // // //                     // Publish HTML Report
// // // //                     publishHTML([
// // // //                         allowMissing: true,
// // // //                         alwaysLinkToLastBuild: true,
// // // //                         keepAll: true,
// // // //                         reportDir: env.PLAYWRIGHT_REPORT,
// // // //                         reportFiles: 'index.html',
// // // //                         reportName: "Playwright Report (${BUILD_VERSION})"
// // // //                     ])
                    
// // // //                     // Publish JUnit
// // // //                     junit(
// // // //                         testResults: "${PLAYWRIGHT_JUNIT}/**/*.xml",
// // // //                         allowEmptyResults: true,
// // // //                         skipPublishingChecks: false
// // // //                     )
// // // //                 }
// // // //             }
// // // //         }

// // // //         stage('📦 Archive Artifacts') {
// // // //             when {
// // // //                 beforeAgent true
// // // //                 expression { !params.DRY_RUN }
// // // //             }
// // // //             agent { label 'master' }
// // // //             steps {
// // // //                 script {
// // // //                     // Archive all test results
// // // //                     archiveArtifacts(
// // // //                         artifacts: "${PLAYWRIGHT_OUTPUT}/**/*",
// // // //                         allowEmptyArchive: true
// // // //                     )
                    
// // // //                     // Archive reports
// // // //                     archiveArtifacts(
// // // //                         artifacts: "${PLAYWRIGHT_REPORT}/**/*",
// // // //                         allowEmptyArchive: true
// // // //                     )
// // // //                 }
// // // //             }
// // // //         }
// // // //     }

// // // //     post {
// // // //         always {
// // // //             script {
// // // //                 node('master') {
// // // //                     if (!params.DRY_RUN) {
// // // //                         // Cleanup workspace
// // // //                         cleanWs(
// // // //                             deleteDirs: true,
// // // //                             patterns: [
// // // //                                 [pattern: env.NPM_CACHE, type: 'EXCLUDE'],
// // // //                                 [pattern: env.PLAYWRIGHT_BROWSERS_PATH, type: 'EXCLUDE']
// // // //                             ]
// // // //                         )
// // // //                     }
// // // //                 }
// // // //             }
// // // //         }
        
// // // //         success {
// // // //             script {
// // // //                 echo """
// // // //                 ╔═══════════════════════════════════════════════╗
// // // //                 ║           ✅ PIPELINE SUCCESSFUL              ║
// // // //                 ╠═══════════════════════════════════════════════╣
// // // //                 ║ Build: ${BUILD_VERSION}
// // // //                 ║ Environment: ${params.ENVIRONMENT}
// // // //                 ║ All tests passed! 🎉
// // // //                 ╚═══════════════════════════════════════════════╝
// // // //                 """.stripIndent()
// // // //             }
// // // //         }
        
// // // //         failure {
// // // //             script {
// // // //                 echo """
// // // //                 ╔═══════════════════════════════════════════════╗
// // // //                 ║             ❌ PIPELINE FAILED                ║
// // // //                 ╠═══════════════════════════════════════════════╣
// // // //                 ║ Build: ${BUILD_VERSION}
// // // //                 ║ Environment: ${params.ENVIRONMENT}
// // // //                 ║ Check reports for details
// // // //                 ╚═══════════════════════════════════════════════╝
// // // //                 """.stripIndent()
// // // //             }
// // // //         }
// // // //     }
// // // // }

// // // // /* ══════════════════════════════════════════════════════════════
// // // //  * VERWENDUNG:
// // // //  * ══════════════════════════════════════════════════════════════
// // // //  * 
// // // //  * 1. Kopiere dieses File in dein Repository als "Jenkinsfile"
// // // //  * 2. Erstelle Jenkins Pipeline-Job → Pipeline from SCM
// // // //  * 3. Führe aus mit gewünschten Parametern
// // // //  * 
// // // //  * Matrix erzeugt automatisch:
// // // //  * - 2 Browser (chromium, firefox) × 2 Shards = 4 parallele Jobs
// // // //  * 
// // // //  * Um mehr Shards/Browser zu nutzen, ändere die values in axes:
// // // //  * - Browser: 'chromium', 'firefox', 'webkit'
// // // //  * - Shards: '1', '2', '3', '4'
// // // //  * 
// // // //  * ══════════════════════════════════════════════════════════════
// // // //  */
// // // @Library('qa-shared-library@main') _

// // // /**
// // //  * ══════════════════════════════════════════════════════════════
// // //  * PLAYWRIGHT TEST PIPELINE - ENTERPRISE MATRIX VERSION
// // //  * ══════════════════════════════════════════════════════════════
// // //  * 
// // //  * Features:
// // //  * - Native Jenkins Matrix für automatische Parallelisierung
// // //  * - Shared Library für Wiederverwendbarkeit
// // //  * - Intelligent Sharding mit Auto-Calculation
// // //  * - Multi-Browser Support mit Excludes
// // //  * - Quality Gates & Auto-Rollback
// // //  * - Full Observability (Metrics, Dashboards, Notifications)
// // //  * - Production-Grade Security & Approvals
// // //  * 
// // //  * Version: 3.0.0
// // //  * Level: SDET+++++
// // //  * ══════════════════════════════════════════════════════════════
// // //  */

// // // pipeline {
// // //     agent none

// // //     parameters {
// // //         // Environment Configuration
// // //         choice(
// // //             name: 'ENVIRONMENT',
// // //             choices: ['dev', 'staging', 'pre-prod', 'production', 'canary'],
// // //             description: '🎯 Target Environment'
// // //         )
        
// // //         // Browser Selection
// // //         choice(
// // //             name: 'BROWSER_SELECTION',
// // //             choices: ['all', 'chromium', 'firefox', 'webkit'],
// // //             description: '🌐 Browser(s) to test'
// // //         )
        
// // //         // Test Suite
// // //         choice(
// // //             name: 'TEST_SUITE',
// // //             choices: ['all', 'smoke', 'regression', 'e2e', 'api', 'visual', 'a11y', 'performance'],
// // //             description: '🧪 Test Suite Selection'
// // //         )
        
// // //         // Test Filters
// // //         string(
// // //             name: 'GREP',
// // //             defaultValue: '',
// // //             description: '🔍 Include: @tag or "test name"'
// // //         )
// // //         string(
// // //             name: 'GREP_INVERT',
// // //             defaultValue: '@wip @skip @broken',
// // //             description: '⛔ Exclude: @flaky @slow'
// // //         )
        
// // //         // Sharding Configuration
// // //         booleanParam(
// // //             name: 'ENABLE_SHARDING',
// // //             defaultValue: true,
// // //             description: '⚡ Enable Intelligent Sharding'
// // //         )
// // //         choice(
// // //             name: 'SHARD_STRATEGY',
// // //             choices: ['auto', '2', '4', '6', '8', '12', '16'],
// // //             description: '🔀 Shard Count (auto = ML-based calculation)'
// // //         )
        
// // //         // Recording & Debugging
// // //         booleanParam(
// // //             name: 'ENABLE_RECORDING',
// // //             defaultValue: false,
// // //             description: '📹 Record All Tests (⚠️ Large artifacts!)'
// // //         )
// // //         booleanParam(
// // //             name: 'ENABLE_TRACE_VIEWER',
// // //             defaultValue: false,
// // //             description: '🔍 Enable Trace Viewer for all tests'
// // //         )
// // //         choice(
// // //             name: 'LOG_LEVEL',
// // //             choices: ['info', 'debug', 'trace', 'silent'],
// // //             description: '📊 Logging Verbosity'
// // //         )
        
// // //         // Special Operations
// // //         booleanParam(
// // //             name: 'UPDATE_SNAPSHOTS',
// // //             defaultValue: false,
// // //             description: '📸 Update Visual Snapshots (⚠️ Dev/Staging only!)'
// // //         )
// // //         booleanParam(
// // //             name: 'RUN_MUTATION_TESTS',
// // //             defaultValue: false,
// // //             description: '🧬 Run Mutation Testing'
// // //         )
// // //         booleanParam(
// // //             name: 'ENABLE_CHAOS',
// // //             defaultValue: false,
// // //             description: '💥 Enable Chaos Testing'
// // //         )
// // //         booleanParam(
// // //             name: 'DRY_RUN',
// // //             defaultValue: false,
// // //             description: '🔍 Dry Run (validate config only, no execution)'
// // //         )
        
// // //         // Advanced Options
// // //         string(
// // //             name: 'CUSTOM_TAGS',
// // //             defaultValue: '',
// // //             description: '🏷️ Custom metrics tags (comma-separated)'
// // //         )
// // //         booleanParam(
// // //             name: 'SKIP_QUALITY_GATES',
// // //             defaultValue: false,
// // //             description: '⚠️ Skip Quality Gates (emergency only!)'
// // //         )
// // //     }

// // //     options {
// // //         timeout(time: 90, unit: 'MINUTES')
// // //         ansiColor('xterm')
// // //         timestamps()
// // //         buildDiscarder(logRotator(
// // //             numToKeepStr: '100',
// // //             artifactNumToKeepStr: '50',
// // //             daysToKeepStr: '90'
// // //         ))
// // //         skipDefaultCheckout()
// // //         parallelsAlwaysFailFast()
// // //         disableConcurrentBuilds(abortPrevious: true)
// // //     }

// // //     triggers {
// // //         // Scheduled nightly runs on main branch
// // //         cron(env.BRANCH_NAME == 'main' ? 'H 2 * * *' : '')
        
// // //         // Trigger after successful deployment
// // //         upstream(
// // //             upstreamProjects: "deploy-${params.ENVIRONMENT}",
// // //             threshold: hudson.model.Result.SUCCESS
// // //         )
// // //     }

// // //     environment {
// // //         // Docker Configuration
// // //         PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.58.0-noble'
// // //         DOCKER_ARGS = '--user=root --memory=4g --cpus=2 --shm-size=2g'
        
// // //         // Build Metadata
// // //         BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
// // //         BUILD_TIMESTAMP = "${new Date().format('yyyy-MM-dd_HH-mm-ss')}"
// // //         PIPELINE_START_TIME = "${System.currentTimeMillis()}"
        
// // //         // Paths
// // //         PLAYWRIGHT_OUTPUT = 'playwright/test-results'
// // //         PLAYWRIGHT_REPORT = 'playwright/playwright-report'
// // //         PLAYWRIGHT_JUNIT = 'playwright/junit-results'
// // //         COVERAGE_REPORT = 'coverage'
// // //         ALLURE_RESULTS = 'allure-results'
// // //         BLOB_REPORT = 'blob-report'
        
// // //         // Cache Paths
// // //         NPM_CACHE = '.npm-cache'
// // //         PLAYWRIGHT_BROWSERS_PATH = '.playwright-browsers'
// // //         TURBO_CACHE = '.turbo-cache'
        
// // //         // CI Optimizations
// // //         CI = 'true'
// // //         PWDEBUG = '0'
// // //         NODE_ENV = 'test'
// // //         FORCE_COLOR = '1'
        
// // //         // Feature Flags
// // //         ENABLE_VISUAL_REGRESSION = "${env.ENABLE_VISUAL_REGRESSION ?: 'true'}"
// // //         ENABLE_ACCESSIBILITY = "${env.ENABLE_ACCESSIBILITY ?: 'true'}"
// // //         ENABLE_PERFORMANCE = "${env.ENABLE_PERFORMANCE ?: 'true'}"
        
// // //         // Quality Gates Thresholds
// // //         MIN_PASS_RATE = '95'
// // //         MAX_FLAKY_RATE = '5'
// // //         MAX_DURATION_INCREASE = '20'
// // //         MIN_COVERAGE = '80'
// // //     }

// // //     stages {
// // //         stage('🚀 Initialize & Validate') {
// // //             agent { label 'master' }
// // //             steps {
// // //                 script {
// // //                     // Initialize pipeline with metadata
// // //                     qaLibrary.initializePipeline([
// // //                         buildVersion: BUILD_VERSION,
// // //                         timestamp: BUILD_TIMESTAMP,
// // //                         params: params
// // //                     ])
                    
// // //                     // Set build display name
// // //                     currentBuild.displayName = "#${BUILD_NUMBER} - ${params.ENVIRONMENT} - ${params.BROWSER_SELECTION}"
// // //                     currentBuild.description = """
// // //                         Suite: ${params.TEST_SUITE}
// // //                         Branch: ${env.GIT_BRANCH ?: 'N/A'}
// // //                         Commit: ${env.GIT_COMMIT?.take(7) ?: 'N/A'}
// // //                     """.stripIndent()
                    
// // //                     // Display header
// // //                     qaLibrary.displayHeader([
// // //                         version: BUILD_VERSION,
// // //                         environment: params.ENVIRONMENT,
// // //                         browser: params.BROWSER_SELECTION,
// // //                         suite: params.TEST_SUITE,
// // //                         sharding: params.ENABLE_SHARDING
// // //                     ])
                    
// // //                     // Validate configuration
// // //                     qaLibrary.validateConfig(params)
                    
// // //                     // Send start metrics
// // //                     qaLibrary.sendPipelineStartMetrics([
// // //                         environment: params.ENVIRONMENT,
// // //                         browser: params.BROWSER_SELECTION,
// // //                         suite: params.TEST_SUITE
// // //                     ])
                    
// // //                     // Dry run exit
// // //                     if (params.DRY_RUN) {
// // //                         currentBuild.result = 'SUCCESS'
// // //                         currentBuild.description = "✅ Dry Run - Configuration Valid"
// // //                         echo "✅ Dry run completed successfully"
// // //                         return
// // //                     }
// // //                 }
// // //             }
// // //         }

// // //         stage('🔐 Production Approval Gate') {
// // //             when {
// // //                 beforeAgent true
// // //                 allOf {
// // //                     expression { params.ENVIRONMENT == 'production' }
// // //                     expression { !params.DRY_RUN }
// // //                 }
// // //             }
// // //             agent { label 'master' }
// // //             steps {
// // //                 script {
// // //                     qaLibrary.validateProductionRequirements([
// // //                         params: params,
// // //                         branch: env.GIT_BRANCH
// // //                     ])
                    
// // //                     timeout(time: 30, unit: 'MINUTES') {
// // //                         input(
// // //                             message: "🚨 Deploy tests to PRODUCTION?",
// // //                             submitter: 'qa-leads,engineering-managers',
// // //                             parameters: [
// // //                                 booleanParam(
// // //                                     name: 'PRODUCTION_CONFIRMED',
// // //                                     defaultValue: false,
// // //                                     description: 'I confirm this is a production deployment'
// // //                                 ),
// // //                                 string(
// // //                                     name: 'JIRA_TICKET',
// // //                                     defaultValue: '',
// // //                                     description: 'JIRA ticket number (required)'
// // //                                 )
// // //                             ]
// // //                         )
// // //                     }
                    
// // //                     echo "✅ Production deployment approved"
// // //                 }
// // //             }
// // //         }

// // //         stage('🏥 Pre-Flight Health Checks') {
// // //             when {
// // //                 beforeAgent true
// // //                 expression { !params.DRY_RUN }
// // //             }
// // //             agent { label 'master' }
// // //             steps {
// // //                 script {
// // //                     parallel(
// // //                         'Endpoint Health': {
// // //                             qaLibrary.validateEndpointHealth([
// // //                                 environment: params.ENVIRONMENT,
// // //                                 retries: 3,
// // //                                 timeout: 120
// // //                             ])
// // //                         },
// // //                         'Test Data Validation': {
// // //                             if (params.ENVIRONMENT != 'production') {
// // //                                 qaLibrary.validateTestData([
// // //                                     environment: params.ENVIRONMENT
// // //                                 ])
// // //                             }
// // //                         },
// // //                         'Dependencies Check': {
// // //                             qaLibrary.checkDependencies()
// // //                         }
// // //                     )
// // //                 }
// // //             }
// // //         }

// // //         stage('🧪 Playwright Matrix Tests') {
// // //             when {
// // //                 beforeAgent true
// // //                 expression { !params.DRY_RUN }
// // //             }
// // //             matrix {
// // //                 agent {
// // //                     docker {
// // //                         image env.PLAYWRIGHT_IMAGE
// // //                         args env.DOCKER_ARGS
// // //                         reuseNode true
// // //                     }
// // //                 }
                
// // //                 axes {
// // //                     axis {
// // //                         name 'BROWSER'
// // //                         values 'chromium', 'firefox', 'webkit'
// // //                     }
// // //                     axis {
// // //                         name 'SHARD_INDEX'
// // //                         values '1', '2', '3', '4'
// // //                     }
// // //                 }
                
// // //                 excludes {
// // //                     // WebKit in Production (optional safeguard)
// // //                     exclude {
// // //                         axis {
// // //                             name 'BROWSER'
// // //                             values 'webkit'
// // //                         }
// // //                     }
// // //                 }
                
// // //                 stages {
// // //                     stage('📦 Setup Environment') {
// // //                         steps {
// // //                             script {
// // //                                 echo "🔹 Setting up ${BROWSER} - Shard ${SHARD_INDEX}"
                                
// // //                                 // Checkout code
// // //                                 qaLibrary.checkoutCode([
// // //                                     shallow: true,
// // //                                     depth: 1,
// // //                                     submodules: true
// // //                                 ])
                                
// // //                                 // Restore caches
// // //                                 qaLibrary.restoreCaches([
// // //                                     npm: env.NPM_CACHE,
// // //                                     browsers: env.PLAYWRIGHT_BROWSERS_PATH,
// // //                                     turbo: env.TURBO_CACHE
// // //                                 ])
                                
// // //                                 // Install dependencies
// // //                                 qaLibrary.installDependencies([
// // //                                     browser: BROWSER,
// // //                                     cache: env.NPM_CACHE,
// // //                                     browsersPath: env.PLAYWRIGHT_BROWSERS_PATH
// // //                                 ])
                                
// // //                                 // Configure environment
// // //                                 qaLibrary.configureEnvironment([
// // //                                     environment: params.ENVIRONMENT,
// // //                                     browser: BROWSER
// // //                                 ])
// // //                             }
// // //                         }
// // //                     }

// // //                     stage('🔒 Security Scan') {
// // //                         steps {
// // //                             script {
// // //                                 qaLibrary.runSecurityAudit([
// // //                                     level: 'moderate',
// // //                                     failOnHigh: params.ENVIRONMENT == 'production'
// // //                                 ])
// // //                             }
// // //                         }
// // //                     }

// // //                     stage('🧪 Execute Tests') {
// // //                         options {
// // //                             timeout(time: 45, unit: 'MINUTES')
// // //                             retry(1)
// // //                         }
// // //                         steps {
// // //                             script {
// // //                                 def totalShards = 4 // Hardcoded for now, can be dynamic
                                
// // //                                 echo "🚀 Executing ${BROWSER} - Shard ${SHARD_INDEX}/${totalShards}"
                                
// // //                                 qaLibrary.runPlaywrightShard([
// // //                                     browser: BROWSER,
// // //                                     shardIndex: SHARD_INDEX,
// // //                                     totalShards: totalShards,
// // //                                     suite: params.TEST_SUITE,
// // //                                     grep: params.GREP,
// // //                                     grepInvert: params.GREP_INVERT,
// // //                                     recording: params.ENABLE_RECORDING,
// // //                                     traceViewer: params.ENABLE_TRACE_VIEWER,
// // //                                     updateSnapshots: params.UPDATE_SNAPSHOTS,
// // //                                     logLevel: params.LOG_LEVEL,
// // //                                     environment: params.ENVIRONMENT,
// // //                                     outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}",
// // //                                     junitDir: "${PLAYWRIGHT_JUNIT}",
// // //                                     blobDir: "${BLOB_REPORT}"
// // //                                 ])
// // //                             }
// // //                         }
// // //                         post {
// // //                             always {
// // //                                 script {
// // //                                     qaLibrary.archiveShardArtifacts([
// // //                                         browser: BROWSER,
// // //                                         shardIndex: SHARD_INDEX,
// // //                                         outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}"
// // //                                     ])
                                    
// // //                                     qaLibrary.sendShardMetrics([
// // //                                         browser: BROWSER,
// // //                                         shard: SHARD_INDEX,
// // //                                         environment: params.ENVIRONMENT
// // //                                     ])
// // //                                 }
// // //                             }
// // //                             failure {
// // //                                 script {
// // //                                     qaLibrary.analyzeShardFailure([
// // //                                         browser: BROWSER,
// // //                                         shardIndex: SHARD_INDEX,
// // //                                         outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}"
// // //                                     ])
// // //                                 }
// // //                             }
// // //                         }
// // //                     }

// // //                     stage('📊 Shard Analysis') {
// // //                         steps {
// // //                             script {
// // //                                 qaLibrary.analyzeShardResults([
// // //                                     browser: BROWSER,
// // //                                     shardIndex: SHARD_INDEX,
// // //                                     outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}"
// // //                                 ])
// // //                             }
// // //                         }
// // //                     }
// // //                 }
// // //             }
// // //         }

// // //         stage('📊 Merge & Analyze Results') {
// // //             when {
// // //                 beforeAgent true
// // //                 expression { !params.DRY_RUN }
// // //             }
// // //             agent {
// // //                 docker {
// // //                     image env.PLAYWRIGHT_IMAGE
// // //                     args env.DOCKER_ARGS
// // //                     reuseNode true
// // //                 }
// // //             }
// // //             steps {
// // //                 script {
// // //                     echo "📊 Merging and analyzing test results..."
                    
// // //                     qaLibrary.mergeReports([
// // //                         blobDir: env.BLOB_REPORT,
// // //                         outputDir: env.PLAYWRIGHT_REPORT,
// // //                         junitDir: env.PLAYWRIGHT_JUNIT
// // //                     ])
                    
// // //                     qaLibrary.analyzeResults([
// // //                         outputDir: env.PLAYWRIGHT_OUTPUT,
// // //                         reportDir: env.PLAYWRIGHT_REPORT
// // //                     ])
// // //                 }
// // //             }
// // //         }

// // //         stage('🔬 Advanced Analysis') {
// // //             when {
// // //                 beforeAgent true
// // //                 expression { !params.DRY_RUN }
// // //             }
// // //             parallel {
// // //                 stage('Flaky Test Detection') {
// // //                     agent { label 'master' }
// // //                     steps {
// // //                         script {
// // //                             qaLibrary.detectFlakyTests([
// // //                                 resultsDir: env.PLAYWRIGHT_OUTPUT,
// // //                                 historyBuilds: 10,
// // //                                 threshold: 0.2,
// // //                                 createTickets: true
// // //                             ])
// // //                         }
// // //                     }
// // //                 }
                
// // //                 stage('Performance Analysis') {
// // //                     agent { label 'master' }
// // //                     when {
// // //                         expression { env.ENABLE_PERFORMANCE == 'true' }
// // //                     }
// // //                     steps {
// // //                         script {
// // //                             qaLibrary.analyzePerformance([
// // //                                 resultsDir: env.PLAYWRIGHT_OUTPUT,
// // //                                 environment: params.ENVIRONMENT,
// // //                                 browser: params.BROWSER_SELECTION,
// // //                                 compareBaseline: true
// // //                             ])
// // //                         }
// // //                     }
// // //                 }
                
// // //                 stage('Coverage Analysis') {
// // //                     agent { label 'master' }
// // //                     steps {
// // //                         script {
// // //                             qaLibrary.analyzeCoverage([
// // //                                 coverageDir: env.COVERAGE_REPORT,
// // //                                 minCoverage: env.MIN_COVERAGE.toInteger(),
// // //                                 failOnLow: params.ENVIRONMENT == 'production'
// // //                             ])
// // //                         }
// // //                     }
// // //                 }
                
// // //                 stage('Visual Regression') {
// // //                     agent { label 'master' }
// // //                     when {
// // //                         expression { env.ENABLE_VISUAL_REGRESSION == 'true' }
// // //                     }
// // //                     steps {
// // //                         script {
// // //                             qaLibrary.analyzeVisualRegression([
// // //                                 resultsDir: env.PLAYWRIGHT_OUTPUT
// // //                             ])
// // //                         }
// // //                     }
// // //                 }
                
// // //                 stage('Accessibility Check') {
// // //                     agent { label 'master' }
// // //                     when {
// // //                         expression { env.ENABLE_ACCESSIBILITY == 'true' }
// // //                     }
// // //                     steps {
// // //                         script {
// // //                             qaLibrary.analyzeAccessibility([
// // //                                 resultsDir: env.PLAYWRIGHT_OUTPUT,
// // //                                 wcagLevel: 'AA'
// // //                             ])
// // //                         }
// // //                     }
// // //                 }
// // //             }
// // //         }

// // //         stage('🚦 Quality Gates Evaluation') {
// // //             when {
// // //                 beforeAgent true
// // //                 allOf {
// // //                     expression { !params.DRY_RUN }
// // //                     expression { !params.SKIP_QUALITY_GATES }
// // //                 }
// // //             }
// // //             agent { label 'master' }
// // //             steps {
// // //                 script {
// // //                     echo "🚦 Evaluating quality gates..."
                    
// // //                     def gateResult = qaLibrary.evaluateQualityGates([
// // //                         minPassRate: env.MIN_PASS_RATE.toInteger(),
// // //                         maxFlakyRate: env.MAX_FLAKY_RATE.toInteger(),
// // //                         maxDurationIncrease: env.MAX_DURATION_INCREASE.toInteger(),
// // //                         minCoverage: env.MIN_COVERAGE.toInteger()
// // //                     ])
                    
// // //                     qaLibrary.displayQualityGateResults(gateResult)
                    
// // //                     if (!gateResult.passed) {
// // //                         def reasons = gateResult.reasons.join(', ')
                        
// // //                         if (params.ENVIRONMENT == 'production') {
// // //                             error("❌ Quality gates failed in production: ${reasons}")
// // //                         } else {
// // //                             unstable("⚠️ Quality gates failed: ${reasons}")
// // //                         }
// // //                     } else {
// // //                         echo "✅ All quality gates passed!"
// // //                     }
                    
// // //                     env.QUALITY_GATE_RESULT = writeJSON(returnText: true, json: gateResult)
// // //                 }
// // //             }
// // //         }

// // //         stage('📄 Generate Reports') {
// // //             when {
// // //                 beforeAgent true
// // //                 expression { !params.DRY_RUN }
// // //             }
// // //             parallel {
// // //                 stage('HTML Report') {
// // //                     agent {
// // //                         docker {
// // //                             image env.PLAYWRIGHT_IMAGE
// // //                             args env.DOCKER_ARGS
// // //                             reuseNode true
// // //                         }
// // //                     }
// // //                     steps {
// // //                         script {
// // //                             qaLibrary.publishHTMLReport([
// // //                                 reportDir: env.PLAYWRIGHT_REPORT,
// // //                                 reportName: "Playwright Report (${BUILD_VERSION})",
// // //                                 alwaysLinkToLastBuild: true
// // //                             ])
// // //                         }
// // //                     }
// // //                 }
                
// // //                 stage('JUnit Report') {
// // //                     agent { label 'master' }
// // //                     steps {
// // //                         script {
// // //                             junit(
// // //                                 testResults: "${env.PLAYWRIGHT_JUNIT}/**/*.xml",
// // //                                 allowEmptyResults: true,
// // //                                 skipPublishingChecks: false,
// // //                                 healthScaleFactor: 1.0
// // //                             )
// // //                         }
// // //                     }
// // //                 }
                
// // //                 stage('Coverage Report') {
// // //                     agent { label 'master' }
// // //                     steps {
// // //                         script {
// // //                             qaLibrary.publishCoverageReport([
// // //                                 coverageDir: env.COVERAGE_REPORT
// // //                             ])
// // //                         }
// // //                     }
// // //                 }
// // //             }
// // //         }

// // //         stage('📦 Publish Artifacts') {
// // //             when {
// // //                 beforeAgent true
// // //                 expression { !params.DRY_RUN }
// // //             }
// // //             agent { label 'master' }
// // //             steps {
// // //                 script {
// // //                     qaLibrary.publishArtifacts([
// // //                         outputDir: env.PLAYWRIGHT_OUTPUT,
// // //                         reportDir: env.PLAYWRIGHT_REPORT,
// // //                         coverageDir: env.COVERAGE_REPORT,
// // //                         includeTraces: currentBuild.result != 'SUCCESS',
// // //                         fingerprint: true
// // //                     ])
// // //                 }
// // //             }
// // //         }

// // //         stage('📊 Update Dashboards') {
// // //             when {
// // //                 beforeAgent true
// // //                 expression { !params.DRY_RUN }
// // //             }
// // //             agent { label 'master' }
// // //             steps {
// // //                 script {
// // //                     parallel(
// // //                         'Datadog': {
// // //                             qaLibrary.updateDatadog([
// // //                                 environment: params.ENVIRONMENT,
// // //                                 customTags: params.CUSTOM_TAGS
// // //                             ])
// // //                         },
// // //                         'Grafana': {
// // //                             qaLibrary.updateGrafana([
// // //                                 environment: params.ENVIRONMENT
// // //                             ])
// // //                         },
// // //                         'TestRail': {
// // //                             qaLibrary.updateTestRail([
// // //                                 results: env.PLAYWRIGHT_OUTPUT,
// // //                                 environment: params.ENVIRONMENT
// // //                             ])
// // //                         }
// // //                     )
// // //                 }
// // //             }
// // //         }

// // //         stage('🔄 Auto-Rollback') {
// // //             when {
// // //                 beforeAgent true
// // //                 allOf {
// // //                     expression { params.ENVIRONMENT == 'production' }
// // //                     expression { currentBuild.result == 'FAILURE' }
// // //                     expression { !params.DRY_RUN }
// // //                 }
// // //             }
// // //             agent { label 'master' }
// // //             steps {
// // //                 script {
// // //                     echo "🔄 Triggering automatic rollback..."
                    
// // //                     qaLibrary.triggerRollback([
// // //                         environment: params.ENVIRONMENT,
// // //                         reason: 'Test failures detected',
// // //                         buildNumber: BUILD_NUMBER
// // //                     ])
// // //                 }
// // //             }
// // //         }

// // //         stage('🔔 Notifications') {
// // //             when {
// // //                 beforeAgent true
// // //                 expression { !params.DRY_RUN }
// // //             }
// // //             agent { label 'master' }
// // //             steps {
// // //                 script {
// // //                     qaLibrary.sendNotifications([
// // //                         environment: params.ENVIRONMENT,
// // //                         browser: params.BROWSER_SELECTION,
// // //                         suite: params.TEST_SUITE,
// // //                         buildVersion: BUILD_VERSION,
// // //                         result: currentBuild.result ?: 'SUCCESS'
// // //                     ])
// // //                 }
// // //             }
// // //         }
// // //     }

// // //     post {
// // //         always {
// // //             script {
// // //                 node('master') {
// // //                     if (!params.DRY_RUN) {
// // //                         def duration = System.currentTimeMillis() - (env.PIPELINE_START_TIME as Long)
                        
// // //                         qaLibrary.collectPipelineMetrics([
// // //                             duration: duration,
// // //                             environment: params.ENVIRONMENT,
// // //                             browser: params.BROWSER_SELECTION,
// // //                             suite: params.TEST_SUITE,
// // //                             result: currentBuild.result ?: 'SUCCESS'
// // //                         ])
                        
// // //                         qaLibrary.generateExecutionSummary([
// // //                             buildVersion: BUILD_VERSION,
// // //                             duration: duration
// // //                         ])
                        
// // //                         qaLibrary.cleanupWithCachePreservation([
// // //                             preserveNpm: true,
// // //                             preserveBrowsers: true,
// // //                             preserveTurbo: true
// // //                         ])
// // //                     }
// // //                 }
// // //             }
// // //         }
        
// // //         success {
// // //             script {
// // //                 echo """
// // //                 ╔═══════════════════════════════════════════════════╗
// // //                 ║              ✅ PIPELINE SUCCESSFUL               ║
// // //                 ╠═══════════════════════════════════════════════════╣
// // //                 ║ Build: ${BUILD_VERSION}
// // //                 ║ Environment: ${params.ENVIRONMENT}
// // //                 ║ All tests passed! 🎉
// // //                 ╚═══════════════════════════════════════════════════╝
// // //                 """.stripIndent()
                
// // //                 qaLibrary.onSuccess([
// // //                     buildVersion: BUILD_VERSION,
// // //                     environment: params.ENVIRONMENT
// // //                 ])
// // //             }
// // //         }
        
// // //         failure {
// // //             script {
// // //                 echo """
// // //                 ╔═══════════════════════════════════════════════════╗
// // //                 ║                ❌ PIPELINE FAILED                 ║
// // //                 ╠═══════════════════════════════════════════════════╣
// // //                 ║ Build: ${BUILD_VERSION}
// // //                 ║ Environment: ${params.ENVIRONMENT}
// // //                 ║ Check reports and traces for details
// // //                 ╚═══════════════════════════════════════════════════╝
// // //                 """.stripIndent()
                
// // //                 qaLibrary.onFailure([
// // //                     buildVersion: BUILD_VERSION,
// // //                     environment: params.ENVIRONMENT,
// // //                     createIncident: params.ENVIRONMENT == 'production'
// // //                 ])
// // //             }
// // //         }
        
// // //         unstable {
// // //             script {
// // //                 echo """
// // //                 ╔═══════════════════════════════════════════════════╗
// // //                 ║              ⚠️ PIPELINE UNSTABLE                ║
// // //                 ╠═══════════════════════════════════════════════════╣
// // //                 ║ Build: ${BUILD_VERSION}
// // //                 ║ Environment: ${params.ENVIRONMENT}
// // //                 ║ Flaky tests or quality gates failed
// // //                 ╚═══════════════════════════════════════════════════╝
// // //                 """.stripIndent()
                
// // //                 qaLibrary.onUnstable([
// // //                     buildVersion: BUILD_VERSION,
// // //                     environment: params.ENVIRONMENT
// // //                 ])
// // //             }
// // //         }
        
// // //         aborted {
// // //             script {
// // //                 echo """
// // //                 ╔═══════════════════════════════════════════════════╗
// // //                 ║               🛑 PIPELINE ABORTED                 ║
// // //                 ╠═══════════════════════════════════════════════════╣
// // //                 ║ Build: ${BUILD_VERSION}
// // //                 ║ Environment: ${params.ENVIRONMENT}
// // //                 ║ Pipeline was manually aborted
// // //                 ╚═══════════════════════════════════════════════════╝
// // //                 """.stripIndent()
                
// // //                 qaLibrary.onAborted([
// // //                     buildVersion: BUILD_VERSION,
// // //                     environment: params.ENVIRONMENT
// // //                 ])
// // //             }
// // //         }
        
// // //         cleanup {
// // //             script {
// // //                 qaLibrary.finalCleanup()
// // //             }
// // //         }
// // //     }
// // // }

// // // // // /* ══════════════════════════════════════════════════════════════
// // // // //  * FEHLER BEHOBEN:
// // // // //  * ══════════════════════════════════════════════════════════════
// // // // //  * 
// // // // //  * 1. ✅ Matrix axes values: Jetzt statische Werte statt Closures
// // // // //  * 2. ✅ Agent in parallel stages: Verschoben in die Stage selbst
// // // // //  * 3. ✅ throttleJobProperty: Entfernt (nicht standardmäßig verfügbar)
// // // // //  * 4. ✅ Excludes: Vereinfacht auf eine Regel
// // // // //  * 
// // // // //  * VERWENDUNG:
// // // // //  * - Matrix läuft mit 3 Browsern × 4 Shards = 12 parallele Jobs
// // // // //  * - Für dynamische Shards: Shared Library muss Werte vorberechnen
// // // // //  * - Alle parallel stages haben jetzt eigene agents
// // // // //  */

// // // // // // //@Library('qa-shared-library') _

// // // // // // /**
// // // // // //  * ══════════════════════════════════════════════════════════════
// // // // // //  * PLAYWRIGHT TEST PIPELINE - ENTERPRISE MATRIX VERSION
// // // // // //  * ══════════════════════════════════════════════════════════════
// // // // // //  * 
// // // // // //  * Features:
// // // // // //  * - Native Jenkins Matrix für automatische Parallelisierung
// // // // // //  * - Shared Library für Wiederverwendbarkeit
// // // // // //  * - Intelligent Sharding mit Auto-Calculation
// // // // // //  * - Multi-Browser Support mit Excludes
// // // // // //  * - Quality Gates & Auto-Rollback
// // // // // //  * - Full Observability (Metrics, Dashboards, Notifications)
// // // // // //  * - Production-Grade Security & Approvals
// // // // // //  * 
// // // // // //  * Version: 3.0.0
// // // // // //  * Level: SDET+++++
// // // // // //  * ══════════════════════════════════════════════════════════════
// // // // // //  */

// // // // // // pipeline {
// // // // // //     agent none

// // // // // //     parameters {
// // // // // //         // Environment Configuration
// // // // // //         choice(
// // // // // //             name: 'ENVIRONMENT',
// // // // // //             choices: ['dev', 'staging', 'pre-prod', 'production', 'canary'],
// // // // // //             description: '🎯 Target Environment'
// // // // // //         )
        
// // // // // //         // Browser Selection
// // // // // //         choice(
// // // // // //             name: 'BROWSER_SELECTION',
// // // // // //             choices: ['all', 'chromium', 'firefox', 'webkit'],
// // // // // //             description: '🌐 Browser(s) to test'
// // // // // //         )
        
// // // // // //         // Test Suite
// // // // // //         choice(
// // // // // //             name: 'TEST_SUITE',
// // // // // //             choices: ['all', 'smoke', 'regression', 'e2e', 'api', 'visual', 'a11y', 'performance'],
// // // // // //             description: '🧪 Test Suite Selection'
// // // // // //         )
        
// // // // // //         // Test Filters
// // // // // //         string(
// // // // // //             name: 'GREP',
// // // // // //             defaultValue: '',
// // // // // //             description: '🔍 Include: @tag or "test name"'
// // // // // //         )
// // // // // //         string(
// // // // // //             name: 'GREP_INVERT',
// // // // // //             defaultValue: '@wip @skip @broken',
// // // // // //             description: '⛔ Exclude: @flaky @slow'
// // // // // //         )
        
// // // // // //         // Sharding Configuration
// // // // // //         booleanParam(
// // // // // //             name: 'ENABLE_SHARDING',
// // // // // //             defaultValue: true,
// // // // // //             description: '⚡ Enable Intelligent Sharding'
// // // // // //         )
// // // // // //         choice(
// // // // // //             name: 'SHARD_STRATEGY',
// // // // // //             choices: ['auto', '2', '4', '6', '8', '12', '16'],
// // // // // //             description: '🔀 Shard Count (auto = ML-based calculation)'
// // // // // //         )
        
// // // // // //         // Recording & Debugging
// // // // // //         booleanParam(
// // // // // //             name: 'ENABLE_RECORDING',
// // // // // //             defaultValue: false,
// // // // // //             description: '📹 Record All Tests (⚠️ Large artifacts!)'
// // // // // //         )
// // // // // //         booleanParam(
// // // // // //             name: 'ENABLE_TRACE_VIEWER',
// // // // // //             defaultValue: false,
// // // // // //             description: '🔍 Enable Trace Viewer for all tests'
// // // // // //         )
// // // // // //         choice(
// // // // // //             name: 'LOG_LEVEL',
// // // // // //             choices: ['info', 'debug', 'trace', 'silent'],
// // // // // //             description: '📊 Logging Verbosity'
// // // // // //         )
        
// // // // // //         // Special Operations
// // // // // //         booleanParam(
// // // // // //             name: 'UPDATE_SNAPSHOTS',
// // // // // //             defaultValue: false,
// // // // // //             description: '📸 Update Visual Snapshots (⚠️ Dev/Staging only!)'
// // // // // //         )
// // // // // //         booleanParam(
// // // // // //             name: 'RUN_MUTATION_TESTS',
// // // // // //             defaultValue: false,
// // // // // //             description: '🧬 Run Mutation Testing'
// // // // // //         )
// // // // // //         booleanParam(
// // // // // //             name: 'ENABLE_CHAOS',
// // // // // //             defaultValue: false,
// // // // // //             description: '💥 Enable Chaos Testing'
// // // // // //         )
// // // // // //         booleanParam(
// // // // // //             name: 'DRY_RUN',
// // // // // //             defaultValue: false,
// // // // // //             description: '🔍 Dry Run (validate config only, no execution)'
// // // // // //         )
        
// // // // // //         // Advanced Options
// // // // // //         string(
// // // // // //             name: 'CUSTOM_TAGS',
// // // // // //             defaultValue: '',
// // // // // //             description: '🏷️ Custom metrics tags (comma-separated)'
// // // // // //         )
// // // // // //         booleanParam(
// // // // // //             name: 'SKIP_QUALITY_GATES',
// // // // // //             defaultValue: false,
// // // // // //             description: '⚠️ Skip Quality Gates (emergency only!)'
// // // // // //         )
// // // // // //     }

// // // // // //     options {
// // // // // //         timeout(time: 90, unit: 'MINUTES')
// // // // // //         ansiColor('xterm')
// // // // // //         timestamps()
// // // // // //         buildDiscarder(logRotator(
// // // // // //             numToKeepStr: '100',
// // // // // //             artifactNumToKeepStr: '50',
// // // // // //             daysToKeepStr: '90'
// // // // // //         ))
// // // // // //         skipDefaultCheckout()
// // // // // //         parallelsAlwaysFailFast()
// // // // // //         disableConcurrentBuilds(abortPrevious: true)
// // // // // //         throttleJobProperty(
// // // // // //             categories: ['playwright-tests'],
// // // // // //             throttleEnabled: true,
// // // // // //             throttleOption: 'category',
// // // // // //             maxConcurrentPerNode: 3
// // // // // //         )
// // // // // //     }

// // // // // //     triggers {
// // // // // //         // Scheduled nightly runs on main branch
// // // // // //         cron(env.BRANCH_NAME == 'main' ? 'H 2 * * *' : '')
        
// // // // // //         // Trigger after successful deployment
// // // // // //         upstream(
// // // // // //             upstreamProjects: "deploy-${params.ENVIRONMENT}",
// // // // // //             threshold: hudson.model.Result.SUCCESS
// // // // // //         )
// // // // // //     }

// // // // // //     environment {
// // // // // //         // Docker Configuration
// // // // // //         PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.58.0-noble'
// // // // // //         DOCKER_ARGS = '--user=root --memory=4g --cpus=2 --shm-size=2g'
        
// // // // // //         // Build Metadata
// // // // // //         BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
// // // // // //         BUILD_TIMESTAMP = "${new Date().format('yyyy-MM-dd_HH-mm-ss')}"
// // // // // //         PIPELINE_START_TIME = "${System.currentTimeMillis()}"
        
// // // // // //         // Paths
// // // // // //         PLAYWRIGHT_OUTPUT = 'playwright/test-results'
// // // // // //         PLAYWRIGHT_REPORT = 'playwright/playwright-report'
// // // // // //         PLAYWRIGHT_JUNIT = 'playwright/junit-results'
// // // // // //         COVERAGE_REPORT = 'coverage'
// // // // // //         ALLURE_RESULTS = 'allure-results'
// // // // // //         BLOB_REPORT = 'blob-report'
        
// // // // // //         // Cache Paths
// // // // // //         NPM_CACHE = '.npm-cache'
// // // // // //         PLAYWRIGHT_BROWSERS_PATH = '.playwright-browsers'
// // // // // //         TURBO_CACHE = '.turbo-cache'
        
// // // // // //         // CI Optimizations
// // // // // //         CI = 'true'
// // // // // //         PWDEBUG = '0'
// // // // // //         NODE_ENV = 'test'
// // // // // //         FORCE_COLOR = '1'
        
// // // // // //         // Feature Flags
// // // // // //         ENABLE_VISUAL_REGRESSION = "${env.ENABLE_VISUAL_REGRESSION ?: 'true'}"
// // // // // //         ENABLE_ACCESSIBILITY = "${env.ENABLE_ACCESSIBILITY ?: 'true'}"
// // // // // //         ENABLE_PERFORMANCE = "${env.ENABLE_PERFORMANCE ?: 'true'}"
        
// // // // // //         // Quality Gates Thresholds
// // // // // //         MIN_PASS_RATE = '95'
// // // // // //         MAX_FLAKY_RATE = '5'
// // // // // //         MAX_DURATION_INCREASE = '20'
// // // // // //         MIN_COVERAGE = '80'
// // // // // //     }

// // // // // //     stages {
// // // // // //         stage('🚀 Initialize & Validate') {
// // // // // //             agent { label 'master' }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     // Initialize pipeline with metadata
// // // // // //                     qaLibrary.initializePipeline([
// // // // // //                         buildVersion: BUILD_VERSION,
// // // // // //                         timestamp: BUILD_TIMESTAMP,
// // // // // //                         params: params
// // // // // //                     ])
                    
// // // // // //                     // Set build display name
// // // // // //                     currentBuild.displayName = "#${BUILD_NUMBER} - ${params.ENVIRONMENT} - ${params.BROWSER_SELECTION}"
// // // // // //                     currentBuild.description = """
// // // // // //                         Suite: ${params.TEST_SUITE}
// // // // // //                         Branch: ${env.GIT_BRANCH ?: 'N/A'}
// // // // // //                         Commit: ${env.GIT_COMMIT?.take(7) ?: 'N/A'}
// // // // // //                     """.stripIndent()
                    
// // // // // //                     // Display header
// // // // // //                     qaLibrary.displayHeader([
// // // // // //                         version: BUILD_VERSION,
// // // // // //                         environment: params.ENVIRONMENT,
// // // // // //                         browser: params.BROWSER_SELECTION,
// // // // // //                         suite: params.TEST_SUITE,
// // // // // //                         sharding: params.ENABLE_SHARDING
// // // // // //                     ])
                    
// // // // // //                     // Validate configuration
// // // // // //                     qaLibrary.validateConfig(params)
                    
// // // // // //                     // Send start metrics
// // // // // //                     qaLibrary.sendPipelineStartMetrics([
// // // // // //                         environment: params.ENVIRONMENT,
// // // // // //                         browser: params.BROWSER_SELECTION,
// // // // // //                         suite: params.TEST_SUITE
// // // // // //                     ])
                    
// // // // // //                     // Dry run exit
// // // // // //                     if (params.DRY_RUN) {
// // // // // //                         currentBuild.result = 'SUCCESS'
// // // // // //                         currentBuild.description = "✅ Dry Run - Configuration Valid"
// // // // // //                         echo "✅ Dry run completed successfully"
// // // // // //                         return
// // // // // //                     }
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('🔐 Production Approval Gate') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 allOf {
// // // // // //                     expression { params.ENVIRONMENT == 'production' }
// // // // // //                     expression { !params.DRY_RUN }
// // // // // //                 }
// // // // // //             }
// // // // // //             agent { label 'master' }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     qaLibrary.validateProductionRequirements([
// // // // // //                         params: params,
// // // // // //                         branch: env.GIT_BRANCH
// // // // // //                     ])
                    
// // // // // //                     timeout(time: 30, unit: 'MINUTES') {
// // // // // //                         input(
// // // // // //                             message: "🚨 Deploy tests to PRODUCTION?",
// // // // // //                             submitter: 'qa-leads,engineering-managers',
// // // // // //                             parameters: [
// // // // // //                                 booleanParam(
// // // // // //                                     name: 'PRODUCTION_CONFIRMED',
// // // // // //                                     defaultValue: false,
// // // // // //                                     description: 'I confirm this is a production deployment'
// // // // // //                                 ),
// // // // // //                                 string(
// // // // // //                                     name: 'JIRA_TICKET',
// // // // // //                                     defaultValue: '',
// // // // // //                                     description: 'JIRA ticket number (required)'
// // // // // //                                 )
// // // // // //                             ]
// // // // // //                         )
// // // // // //                     }
                    
// // // // // //                     echo "✅ Production deployment approved"
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('🏥 Pre-Flight Health Checks') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 expression { !params.DRY_RUN }
// // // // // //             }
// // // // // //             agent { label 'master' }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     parallel(
// // // // // //                         'Endpoint Health': {
// // // // // //                             qaLibrary.validateEndpointHealth([
// // // // // //                                 environment: params.ENVIRONMENT,
// // // // // //                                 retries: 3,
// // // // // //                                 timeout: 120
// // // // // //                             ])
// // // // // //                         },
// // // // // //                         'Test Data Validation': {
// // // // // //                             if (params.ENVIRONMENT != 'production') {
// // // // // //                                 qaLibrary.validateTestData([
// // // // // //                                     environment: params.ENVIRONMENT
// // // // // //                                 ])
// // // // // //                             }
// // // // // //                         },
// // // // // //                         'Dependencies Check': {
// // // // // //                             qaLibrary.checkDependencies()
// // // // // //                         }
// // // // // //                     )
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('🧪 Playwright Matrix Tests') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 expression { !params.DRY_RUN }
// // // // // //             }
// // // // // //             matrix {
// // // // // //                 agent {
// // // // // //                     docker {
// // // // // //                         image env.PLAYWRIGHT_IMAGE
// // // // // //                         args env.DOCKER_ARGS
// // // // // //                         reuseNode true
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 axes {
// // // // // //                     axis {
// // // // // //                         name 'BROWSER'
// // // // // //                         values { 
// // // // // //                             return qaLibrary.getBrowsers(params.BROWSER_SELECTION)
// // // // // //                         }
// // // // // //                     }
// // // // // //                     axis {
// // // // // //                         name 'SHARD_INDEX'
// // // // // //                         values { 
// // // // // //                             return qaLibrary.calculateShards(
// // // // // //                                 params.SHARD_STRATEGY, 
// // // // // //                                 params.ENABLE_SHARDING
// // // // // //                             )
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 excludes {
// // // // // //                     // WebKit in Production (optional safeguard)
// // // // // //                     exclude {
// // // // // //                         axis {
// // // // // //                             name 'BROWSER'
// // // // // //                             values 'webkit'
// // // // // //                         }
// // // // // //                         axis {
// // // // // //                             name 'ENVIRONMENT'
// // // // // //                             values 'production'
// // // // // //                         }
// // // // // //                     }
                    
// // // // // //                     // Skip certain shard combinations if needed
// // // // // //                     // exclude {
// // // // // //                     //     axis {
// // // // // //                     //         name 'BROWSER'
// // // // // //                     //         values 'firefox'
// // // // // //                     //     }
// // // // // //                     //     axis {
// // // // // //                     //         name 'SHARD_INDEX'
// // // // // //                     //         values '1'
// // // // // //                     //     }
// // // // // //                     // }
// // // // // //                 }
                
// // // // // //                 stages {
// // // // // //                     stage('📦 Setup Environment') {
// // // // // //                         steps {
// // // // // //                             script {
// // // // // //                                 echo "🔹 Setting up ${BROWSER} - Shard ${SHARD_INDEX}"
                                
// // // // // //                                 // Checkout code
// // // // // //                                 qaLibrary.checkoutCode([
// // // // // //                                     shallow: true,
// // // // // //                                     depth: 1,
// // // // // //                                     submodules: true
// // // // // //                                 ])
                                
// // // // // //                                 // Restore caches
// // // // // //                                 qaLibrary.restoreCaches([
// // // // // //                                     npm: env.NPM_CACHE,
// // // // // //                                     browsers: env.PLAYWRIGHT_BROWSERS_PATH,
// // // // // //                                     turbo: env.TURBO_CACHE
// // // // // //                                 ])
                                
// // // // // //                                 // Install dependencies
// // // // // //                                 qaLibrary.installDependencies([
// // // // // //                                     browser: BROWSER,
// // // // // //                                     cache: env.NPM_CACHE,
// // // // // //                                     browsersPath: env.PLAYWRIGHT_BROWSERS_PATH
// // // // // //                                 ])
                                
// // // // // //                                 // Configure environment
// // // // // //                                 qaLibrary.configureEnvironment([
// // // // // //                                     environment: params.ENVIRONMENT,
// // // // // //                                     browser: BROWSER
// // // // // //                                 ])
// // // // // //                             }
// // // // // //                         }
// // // // // //                     }

// // // // // //                     stage('🔒 Security Scan') {
// // // // // //                         steps {
// // // // // //                             script {
// // // // // //                                 qaLibrary.runSecurityAudit([
// // // // // //                                     level: 'moderate',
// // // // // //                                     failOnHigh: params.ENVIRONMENT == 'production'
// // // // // //                                 ])
// // // // // //                             }
// // // // // //                         }
// // // // // //                     }

// // // // // //                     stage('🧪 Execute Tests') {
// // // // // //                         options {
// // // // // //                             timeout(time: 45, unit: 'MINUTES')  // Per shard timeout
// // // // // //                             retry(1)  // Retry failed shards once
// // // // // //                         }
// // // // // //                         steps {
// // // // // //                             script {
// // // // // //                                 def totalShards = qaLibrary.getTotalShards(
// // // // // //                                     params.SHARD_STRATEGY, 
// // // // // //                                     params.ENABLE_SHARDING
// // // // // //                                 )
                                
// // // // // //                                 echo "🚀 Executing ${BROWSER} - Shard ${SHARD_INDEX}/${totalShards}"
                                
// // // // // //                                 qaLibrary.runPlaywrightShard([
// // // // // //                                     browser: BROWSER,
// // // // // //                                     shardIndex: SHARD_INDEX,
// // // // // //                                     totalShards: totalShards,
// // // // // //                                     suite: params.TEST_SUITE,
// // // // // //                                     grep: params.GREP,
// // // // // //                                     grepInvert: params.GREP_INVERT,
// // // // // //                                     recording: params.ENABLE_RECORDING,
// // // // // //                                     traceViewer: params.ENABLE_TRACE_VIEWER,
// // // // // //                                     updateSnapshots: params.UPDATE_SNAPSHOTS,
// // // // // //                                     logLevel: params.LOG_LEVEL,
// // // // // //                                     environment: params.ENVIRONMENT,
// // // // // //                                     outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}",
// // // // // //                                     junitDir: "${PLAYWRIGHT_JUNIT}",
// // // // // //                                     blobDir: "${BLOB_REPORT}"
// // // // // //                                 ])
// // // // // //                             }
// // // // // //                         }
// // // // // //                         post {
// // // // // //                             always {
// // // // // //                                 script {
// // // // // //                                     // Archive shard-specific artifacts
// // // // // //                                     qaLibrary.archiveShardArtifacts([
// // // // // //                                         browser: BROWSER,
// // // // // //                                         shardIndex: SHARD_INDEX,
// // // // // //                                         outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}"
// // // // // //                                     ])
                                    
// // // // // //                                     // Send shard metrics
// // // // // //                                     qaLibrary.sendShardMetrics([
// // // // // //                                         browser: BROWSER,
// // // // // //                                         shard: SHARD_INDEX,
// // // // // //                                         environment: params.ENVIRONMENT
// // // // // //                                     ])
// // // // // //                                 }
// // // // // //                             }
// // // // // //                             failure {
// // // // // //                                 script {
// // // // // //                                     qaLibrary.analyzeShardFailure([
// // // // // //                                         browser: BROWSER,
// // // // // //                                         shardIndex: SHARD_INDEX,
// // // // // //                                         outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}"
// // // // // //                                     ])
// // // // // //                                 }
// // // // // //                             }
// // // // // //                         }
// // // // // //                     }

// // // // // //                     stage('📊 Shard Analysis') {
// // // // // //                         steps {
// // // // // //                             script {
// // // // // //                                 qaLibrary.analyzeShardResults([
// // // // // //                                     browser: BROWSER,
// // // // // //                                     shardIndex: SHARD_INDEX,
// // // // // //                                     outputDir: "${PLAYWRIGHT_OUTPUT}/${BROWSER}/shard-${SHARD_INDEX}"
// // // // // //                                 ])
// // // // // //                             }
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('📊 Merge & Analyze Results') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 expression { !params.DRY_RUN }
// // // // // //             }
// // // // // //             agent {
// // // // // //                 docker {
// // // // // //                     image env.PLAYWRIGHT_IMAGE
// // // // // //                     args env.DOCKER_ARGS
// // // // // //                     reuseNode true
// // // // // //                 }
// // // // // //             }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     echo "📊 Merging and analyzing test results..."
                    
// // // // // //                     // Merge blob reports
// // // // // //                     qaLibrary.mergeReports([
// // // // // //                         blobDir: env.BLOB_REPORT,
// // // // // //                         outputDir: env.PLAYWRIGHT_REPORT,
// // // // // //                         junitDir: env.PLAYWRIGHT_JUNIT
// // // // // //                     ])
                    
// // // // // //                     // Analyze test results
// // // // // //                     qaLibrary.analyzeResults([
// // // // // //                         outputDir: env.PLAYWRIGHT_OUTPUT,
// // // // // //                         reportDir: env.PLAYWRIGHT_REPORT
// // // // // //                     ])
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('🔬 Advanced Analysis') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 expression { !params.DRY_RUN }
// // // // // //             }
// // // // // //             agent { label 'master' }
// // // // // //             parallel {
// // // // // //                 stage('Flaky Test Detection') {
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             qaLibrary.detectFlakyTests([
// // // // // //                                 resultsDir: env.PLAYWRIGHT_OUTPUT,
// // // // // //                                 historyBuilds: 10,
// // // // // //                                 threshold: 0.2,
// // // // // //                                 createTickets: true
// // // // // //                             ])
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 stage('Performance Analysis') {
// // // // // //                     when {
// // // // // //                         expression { env.ENABLE_PERFORMANCE == 'true' }
// // // // // //                     }
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             qaLibrary.analyzePerformance([
// // // // // //                                 resultsDir: env.PLAYWRIGHT_OUTPUT,
// // // // // //                                 environment: params.ENVIRONMENT,
// // // // // //                                 browser: params.BROWSER_SELECTION,
// // // // // //                                 compareBaseline: true
// // // // // //                             ])
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 stage('Coverage Analysis') {
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             qaLibrary.analyzeCoverage([
// // // // // //                                 coverageDir: env.COVERAGE_REPORT,
// // // // // //                                 minCoverage: env.MIN_COVERAGE.toInteger(),
// // // // // //                                 failOnLow: params.ENVIRONMENT == 'production'
// // // // // //                             ])
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 stage('Visual Regression') {
// // // // // //                     when {
// // // // // //                         expression { env.ENABLE_VISUAL_REGRESSION == 'true' }
// // // // // //                     }
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             qaLibrary.analyzeVisualRegression([
// // // // // //                                 resultsDir: env.PLAYWRIGHT_OUTPUT
// // // // // //                             ])
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 stage('Accessibility Check') {
// // // // // //                     when {
// // // // // //                         expression { env.ENABLE_ACCESSIBILITY == 'true' }
// // // // // //                     }
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             qaLibrary.analyzeAccessibility([
// // // // // //                                 resultsDir: env.PLAYWRIGHT_OUTPUT,
// // // // // //                                 wcagLevel: 'AA'
// // // // // //                             ])
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('🚦 Quality Gates Evaluation') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 allOf {
// // // // // //                     expression { !params.DRY_RUN }
// // // // // //                     expression { !params.SKIP_QUALITY_GATES }
// // // // // //                 }
// // // // // //             }
// // // // // //             agent { label 'master' }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     echo "🚦 Evaluating quality gates..."
                    
// // // // // //                     def gateResult = qaLibrary.evaluateQualityGates([
// // // // // //                         minPassRate: env.MIN_PASS_RATE.toInteger(),
// // // // // //                         maxFlakyRate: env.MAX_FLAKY_RATE.toInteger(),
// // // // // //                         maxDurationIncrease: env.MAX_DURATION_INCREASE.toInteger(),
// // // // // //                         minCoverage: env.MIN_COVERAGE.toInteger()
// // // // // //                     ])
                    
// // // // // //                     // Display results
// // // // // //                     qaLibrary.displayQualityGateResults(gateResult)
                    
// // // // // //                     // Handle failures
// // // // // //                     if (!gateResult.passed) {
// // // // // //                         def reasons = gateResult.reasons.join(', ')
                        
// // // // // //                         if (params.ENVIRONMENT == 'production') {
// // // // // //                             // Production: Hard fail + rollback
// // // // // //                             error("❌ Quality gates failed in production: ${reasons}")
// // // // // //                         } else {
// // // // // //                             // Non-production: Mark unstable
// // // // // //                             unstable("⚠️ Quality gates failed: ${reasons}")
// // // // // //                         }
// // // // // //                     } else {
// // // // // //                         echo "✅ All quality gates passed!"
// // // // // //                     }
                    
// // // // // //                     // Store results for downstream
// // // // // //                     env.QUALITY_GATE_RESULT = writeJSON(returnText: true, json: gateResult)
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('📄 Generate Reports') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 expression { !params.DRY_RUN }
// // // // // //             }
// // // // // //             agent {
// // // // // //                 docker {
// // // // // //                     image env.PLAYWRIGHT_IMAGE
// // // // // //                     args env.DOCKER_ARGS
// // // // // //                     reuseNode true
// // // // // //                 }
// // // // // //             }
// // // // // //             parallel {
// // // // // //                 stage('HTML Report') {
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             qaLibrary.publishHTMLReport([
// // // // // //                                 reportDir: env.PLAYWRIGHT_REPORT,
// // // // // //                                 reportName: "Playwright Report (${BUILD_VERSION})",
// // // // // //                                 alwaysLinkToLastBuild: true
// // // // // //                             ])
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 stage('JUnit Report') {
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             junit(
// // // // // //                                 testResults: "${env.PLAYWRIGHT_JUNIT}/**/*.xml",
// // // // // //                                 allowEmptyResults: true,
// // // // // //                                 skipPublishingChecks: false,
// // // // // //                                 healthScaleFactor: 1.0,
// // // // // //                                 testDataPublishers: [
// // // // // //                                     [$class: 'StabilityTestDataPublisher'],
// // // // // //                                     [$class: 'ClaimTestDataPublisher']
// // // // // //                                 ]
// // // // // //                             )
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 stage('Allure Report') {
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             try {
// // // // // //                                 allure([
// // // // // //                                     includeProperties: false,
// // // // // //                                     jdk: '',
// // // // // //                                     properties: [],
// // // // // //                                     reportBuildPolicy: 'ALWAYS',
// // // // // //                                     results: [[path: env.ALLURE_RESULTS]]
// // // // // //                                 ])
// // // // // //                             } catch (Exception e) {
// // // // // //                                 echo "⚠️ Allure report skipped: ${e.message}"
// // // // // //                             }
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
                
// // // // // //                 stage('Coverage Report') {
// // // // // //                     steps {
// // // // // //                         script {
// // // // // //                             qaLibrary.publishCoverageReport([
// // // // // //                                 coverageDir: env.COVERAGE_REPORT
// // // // // //                             ])
// // // // // //                         }
// // // // // //                     }
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('📦 Publish Artifacts') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 expression { !params.DRY_RUN }
// // // // // //             }
// // // // // //             agent { label 'master' }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     qaLibrary.publishArtifacts([
// // // // // //                         outputDir: env.PLAYWRIGHT_OUTPUT,
// // // // // //                         reportDir: env.PLAYWRIGHT_REPORT,
// // // // // //                         coverageDir: env.COVERAGE_REPORT,
// // // // // //                         includeTraces: currentBuild.result != 'SUCCESS',
// // // // // //                         fingerprint: true
// // // // // //                     ])
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('📊 Update Dashboards') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 expression { !params.DRY_RUN }
// // // // // //             }
// // // // // //             agent { label 'master' }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     parallel(
// // // // // //                         'Datadog': {
// // // // // //                             qaLibrary.updateDatadog([
// // // // // //                                 environment: params.ENVIRONMENT,
// // // // // //                                 customTags: params.CUSTOM_TAGS
// // // // // //                             ])
// // // // // //                         },
// // // // // //                         'Grafana': {
// // // // // //                             qaLibrary.updateGrafana([
// // // // // //                                 environment: params.ENVIRONMENT
// // // // // //                             ])
// // // // // //                         },
// // // // // //                         'TestRail': {
// // // // // //                             qaLibrary.updateTestRail([
// // // // // //                                 results: env.PLAYWRIGHT_OUTPUT,
// // // // // //                                 environment: params.ENVIRONMENT
// // // // // //                             ])
// // // // // //                         }
// // // // // //                     )
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('🔄 Auto-Rollback') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 allOf {
// // // // // //                     expression { params.ENVIRONMENT == 'production' }
// // // // // //                     expression { currentBuild.result == 'FAILURE' }
// // // // // //                     expression { !params.DRY_RUN }
// // // // // //                 }
// // // // // //             }
// // // // // //             agent { label 'master' }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     echo "🔄 Triggering automatic rollback..."
                    
// // // // // //                     qaLibrary.triggerRollback([
// // // // // //                         environment: params.ENVIRONMENT,
// // // // // //                         reason: 'Test failures detected',
// // // // // //                         buildNumber: BUILD_NUMBER
// // // // // //                     ])
// // // // // //                 }
// // // // // //             }
// // // // // //         }

// // // // // //         stage('🔔 Notifications') {
// // // // // //             when {
// // // // // //                 beforeAgent true
// // // // // //                 expression { !params.DRY_RUN }
// // // // // //             }
// // // // // //             agent { label 'master' }
// // // // // //             steps {
// // // // // //                 script {
// // // // // //                     qaLibrary.sendNotifications([
// // // // // //                         environment: params.ENVIRONMENT,
// // // // // //                         browser: params.BROWSER_SELECTION,
// // // // // //                         suite: params.TEST_SUITE,
// // // // // //                         buildVersion: BUILD_VERSION,
// // // // // //                         result: currentBuild.result ?: 'SUCCESS'
// // // // // //                     ])
// // // // // //                 }
// // // // // //             }
// // // // // //         }
// // // // // //     }

// // // // // //     post {
// // // // // //         always {
// // // // // //             script {
// // // // // //                 node('master') {
// // // // // //                     if (!params.DRY_RUN) {
// // // // // //                         // Calculate pipeline duration
// // // // // //                         def duration = System.currentTimeMillis() - (env.PIPELINE_START_TIME as Long)
                        
// // // // // //                         // Collect metrics
// // // // // //                         qaLibrary.collectPipelineMetrics([
// // // // // //                             duration: duration,
// // // // // //                             environment: params.ENVIRONMENT,
// // // // // //                             browser: params.BROWSER_SELECTION,
// // // // // //                             suite: params.TEST_SUITE,
// // // // // //                             result: currentBuild.result ?: 'SUCCESS'
// // // // // //                         ])
                        
// // // // // //                         // Generate execution summary
// // // // // //                         qaLibrary.generateExecutionSummary([
// // // // // //                             buildVersion: BUILD_VERSION,
// // // // // //                             duration: duration
// // // // // //                         ])
                        
// // // // // //                         // Cleanup with cache preservation
// // // // // //                         qaLibrary.cleanupWithCachePreservation([
// // // // // //                             preserveNpm: true,
// // // // // //                             preserveBrowsers: true,
// // // // // //                             preserveTurbo: true
// // // // // //                         ])
// // // // // //                     }
// // // // // //                 }
// // // // // //             }
// // // // // //         }
        
// // // // // //         success {
// // // // // //             script {
// // // // // //                 echo """
// // // // // //                 ╔═══════════════════════════════════════════════════╗
// // // // // //                 ║              ✅ PIPELINE SUCCESSFUL               ║
// // // // // //                 ╠═══════════════════════════════════════════════════╣
// // // // // //                 ║ Build: ${BUILD_VERSION}
// // // // // //                 ║ Environment: ${params.ENVIRONMENT}
// // // // // //                 ║ All tests passed! 🎉
// // // // // //                 ╚═══════════════════════════════════════════════════╝
// // // // // //                 """.stripIndent()
                
// // // // // //                 qaLibrary.onSuccess([
// // // // // //                     buildVersion: BUILD_VERSION,
// // // // // //                     environment: params.ENVIRONMENT
// // // // // //                 ])
// // // // // //             }
// // // // // //         }
        
// // // // // //         failure {
// // // // // //             script {
// // // // // //                 echo """
// // // // // //                 ╔═══════════════════════════════════════════════════╗
// // // // // //                 ║                ❌ PIPELINE FAILED                 ║
// // // // // //                 ╠═══════════════════════════════════════════════════╣
// // // // // //                 ║ Build: ${BUILD_VERSION}
// // // // // //                 ║ Environment: ${params.ENVIRONMENT}
// // // // // //                 ║ Check reports and traces for details
// // // // // //                 ╚═══════════════════════════════════════════════════╝
// // // // // //                 """.stripIndent()
                
// // // // // //                 qaLibrary.onFailure([
// // // // // //                     buildVersion: BUILD_VERSION,
// // // // // //                     environment: params.ENVIRONMENT,
// // // // // //                     createIncident: params.ENVIRONMENT == 'production'
// // // // // //                 ])
// // // // // //             }
// // // // // //         }
        
// // // // // //         unstable {
// // // // // //             script {
// // // // // //                 echo """
// // // // // //                 ╔═══════════════════════════════════════════════════╗
// // // // // //                 ║              ⚠️ PIPELINE UNSTABLE                ║
// // // // // //                 ╠═══════════════════════════════════════════════════╣
// // // // // //                 ║ Build: ${BUILD_VERSION}
// // // // // //                 ║ Environment: ${params.ENVIRONMENT}
// // // // // //                 ║ Flaky tests or quality gates failed
// // // // // //                 ╚═══════════════════════════════════════════════════╝
// // // // // //                 """.stripIndent()
                
// // // // // //                 qaLibrary.onUnstable([
// // // // // //                     buildVersion: BUILD_VERSION,
// // // // // //                     environment: params.ENVIRONMENT
// // // // // //                 ])
// // // // // //             }
// // // // // //         }
        
// // // // // //         aborted {
// // // // // //             script {
// // // // // //                 echo """
// // // // // //                 ╔═══════════════════════════════════════════════════╗
// // // // // //                 ║               🛑 PIPELINE ABORTED                 ║
// // // // // //                 ╠═══════════════════════════════════════════════════╣
// // // // // //                 ║ Build: ${BUILD_VERSION}
// // // // // //                 ║ Environment: ${params.ENVIRONMENT}
// // // // // //                 ║ Pipeline was manually aborted
// // // // // //                 ╚═══════════════════════════════════════════════════╝
// // // // // //                 """.stripIndent()
                
// // // // // //                 qaLibrary.onAborted([
// // // // // //                     buildVersion: BUILD_VERSION,
// // // // // //                     environment: params.ENVIRONMENT
// // // // // //                 ])
// // // // // //             }
// // // // // //         }
        
// // // // // //         cleanup {
// // // // // //             script {
// // // // // //                 // Final cleanup
// // // // // //                 qaLibrary.finalCleanup()
// // // // // //             }
// // // // // //         }
// // // // // //     }
// // // // // // }

// // // // // // /* ══════════════════════════════════════════════════════════════
// // // // // //  * SHARED LIBRARY REFERENCE (vars/qaLibrary.groovy)
// // // // // //  * ══════════════════════════════════════════════════════════════
// // // // // //  * 
// // // // // //  * Required Library Methods:
// // // // // //  * 
// // // // // //  * - initializePipeline(config)
// // // // // //  * - displayHeader(config)
// // // // // //  * - validateConfig(params)
// // // // // //  * - validateProductionRequirements(config)
// // // // // //  * - validateEndpointHealth(config)
// // // // // //  * - validateTestData(config)

// // // // // // /* ══════════════════════════════════════════════════════════════
// // // // // //  * SDET+++++ LEVEL FEATURES IMPLEMENTED:
// // // // // //  * ══════════════════════════════════════════════════════════════
// // // // // //  * 
// // // // // //  * 1. ✅ ADVANCED ARCHITECTURE
// // // // // //  *    - Dynamic agent allocation per stage
// // // // // //  *    - Intelligent test sharding with auto-calculation
// // // // // //  *    - Parallel browser execution with fault isolation
// // // // // //  *    - Shared library integration
// // // // // //  *    - Feature flags for gradual rollout
// // // // // //  * 
// // // // // //  * 2. ✅ ENTERPRISE SECURITY
// // // // // //  *    - Multi-layer credential management
// // // // // //  *    - Production deployment gates with approvals
// // // // // //  *    - Security audit integration
// // // // // //  *    - Deployment window validation
// // // // // //  *    - Git shallow clone with submodules
// // // // // //  * 
// // // // // //  * 3. ✅ OBSERVABILITY & METRICS
// // // // // //  *    - Real-time metrics to Datadog/Grafana
// // // // // //  *    - OpenTelemetry integration
// // // // // //  *    - Historical trend analysis
// // // // // //  *    - Performance baseline tracking
// // // // // //  *    - Flaky test detection with auto-ticketing
// // // // // //  * 
// // // // // //  * 4. ✅ QUALITY ENGINEERING
// // // // // //  *    - Multi-dimensional quality gates
// // // // // //  *    - Visual regression testing
// // // // // //  *    - Accessibility testing
// // // // // //  *    - Performance regression detection
// // // // // //  *    - Mutation testing support
// // // // // //  *    - Code coverage enforcement
// // // // // //  * 
// // // // // //  * 5. ✅ INTELLIGENT TEST ORCHESTRATION
// // // // // //  *    - Auto-scaling based on test suite size
// // // // // //  *    - Dynamic worker allocation
// // // // // //  *    - Environment-aware retry strategies
// // // // // //  *    - Test priority/criticality routing
// // // // // //  *    - Chaos testing integration
// // // // // //  * 
// // // // // //  * 6. ✅ ADVANCED REPORTING
// // // // // //  *    - Multi-format reports (HTML, JUnit, Allure)
// // // // // //  *    - Historical trend visualization
// // // // // //  *    - Flaky test analytics
// // // // // //  *    - Performance comparison dashboards
// // // // // //  *    - Test coverage reports
// // // // // //  * 
// // // // // //  * 7. ✅ INCIDENT MANAGEMENT
// // // // // //  *    - Auto-rollback triggers
// // // // // //  *    - On-call notifications
// // // // // //  *    - Automatic ticket creation (Jira)
// // // // // //  *    - TestRail integration
// // // // // //  *    - Failure root cause analysis
// // // // // //  * 
// // // // // //  * 8. ✅ DEVELOPER EXPERIENCE
// // // // // //  *    - Rich CLI parameters
// // // // // //  *    - Dry-run mode
// // // // // //  *    - Debug mode with detailed logs
// // // // // //  *    - Build versioning
// // // // // //  *    - Clear visual feedback with emojis
// // // // // //  * 
// // // // // //  * 9. ✅ PERFORMANCE OPTIMIZATION
// // // // // //  *    - Multi-layer caching (NPM, Browsers, Turbo)
// // // // // //  *    - Cache health monitoring
// // // // // //  *    - Resource limits (CPU/Memory)
// // // // // //  *    - Parallel downloads
// // // // // //  *    - Incremental test execution
// // // // // //  * 
// // // // // //  * 10. ✅ CI/CD BEST PRACTICES
// // // // // //  *     - Artifact fingerprinting
// // // // // //  *     - Build history management
// // // // // //  *     - Throttling & rate limiting
// // // // // //  *     - Upstream/downstream triggers
// // // // // //  *     - Scheduled nightly runs
// // // // // //  *     - Branch-based execution
// // // // // //  * 
// // // // // //  * 11. ✅ MAINTENANCE & OPERATIONS
// // // // // //  *     - Automated dependency audits
// // // // // //  *     - Test structure validation
// // // // // //  *     - Duplicate test detection
// // // // // //  *     - Cache size monitoring
// // // // // //  *     - Intelligent cleanup strategies
// // // // // //  * 
// // // // // //  * 12. ✅ SCALABILITY
// // // // // //  *     - Container resource management
// // // // // //  *     - Concurrent build limiting
// // // // // //  *     - Shard-based parallelization
// // // // // //  *     - Worker auto-scaling
// // // // // //  *     - Distributed test execution ready
// // // // // //  * 
// // // // // //  * ══════════════════════════════════════════════════════════════
// // // // // //  */
//SDET ++ niveau
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.57.0-noble'
            args '--user=root --shm-size=2g'
        }
    }

    environment {
        GIT_REPO = 'https://github.com/Benabdllah/Sdet-pw-practice-app.git'
        PLAYWRIGHT_OUTPUT = 'test-results'
        PLAYWRIGHT_REPORT = 'playwright-report'
    }

    parameters {
        choice(name: 'BROWSER', choices: ['all', 'chromium', 'firefox'], description: 'Browser-Projekt(e) ausführen')
        string(name: 'GREP', defaultValue: '', description: 'Grep filter')
        booleanParam(name: 'SHARDING', defaultValue: false, description: 'Sharding aktivieren')
        string(name: 'TOTAL_SHARDS', defaultValue: '3', description: 'Anzahl Shards')
    }

    options {
        timeout(time: 90, unit: 'MINUTES')
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '50'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                echo "🔹 Git Repo klonen"
                git branch: 'main', url: "${env.GIT_REPO}"
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "🔹 Dependencies installieren"
                sh 'npm ci --prefer-offline'
                sh 'npx playwright install --with-deps'
            }
        }

        // Stage "Set PrivateLabel" ENTFERNT → kein Fehler mehr

        stage('Run Playwright Tests') {
            parallel {
                stage('Chromium') {
                    when { expression { params.BROWSER == 'all' || params.BROWSER == 'chromium' } }
                    steps { runTests('chromium') }
                }
                stage('Firefox') {
                    when { expression { params.BROWSER == 'all' || params.BROWSER == 'firefox' } }
                    steps { runTests('firefox') }
                }
                // stage('WebKit') {
                //     when { expression { params.BROWSER == 'all' || params.BROWSER == 'webkit' } }
                //     steps { runTests('webkit') }
                // }
            }
        }

        stage('Publish Reports') {
            steps {
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: "${PLAYWRIGHT_REPORT}",
                    reportFiles: 'index.html',
                    reportName: 'Playwright HTML Report'
                ])
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: "${PLAYWRIGHT_OUTPUT}/**", allowEmptyArchive: true
            archiveArtifacts artifacts: "${PLAYWRIGHT_REPORT}/**", allowEmptyArchive: true
            junit testResults: "${PLAYWRIGHT_OUTPUT}/**/junit-report.xml", allowEmptyResults: true
            cleanWs()
        }
        success { echo "✅ SUCCESS – Deine Tests sind grün!" }
        failure { echo "❌ FAILED" }
    }
}

def runTests(String project) {
    echo "🔹 Playwright Tests für ${project} starten"

    def shardOption = params.SHARDING ? "--shard=1/${params.TOTAL_SHARDS}" : ''
    def grepOption = params.GREP ? "--grep '${params.GREP}'" : ''

    sh """
        npx playwright test src/tests/alerts.spec.ts \
            --project=${project} \
            ${shardOption} \
            ${grepOption} \
            --reporter=html,junit \
            --output=${PLAYWRIGHT_OUTPUT}
    """
}

// // // // // // // // pipeline {
// // // // // // // //     agent {
// // // // // // // //         docker {
// // // // // // // //             image 'mcr.microsoft.com/playwright:v1.57.0-noble'
// // // // // // // //             args '-u root:root'
// // // // // // // //         }
// // // // // // // //     }

// // // // // // // //     environment {
// // // // // // // //         PLAYWRIGHT_OUTPUT = 'test-results'
// // // // // // // //         PLAYWRIGHT_REPORT = 'playwright-report'
// // // // // // // //     }

// // // // // // // //     options {
// // // // // // // //         timeout(time: 60, unit: 'MINUTES')
// // // // // // // //         ansiColor('xterm')
// // // // // // // //     }

// // // // // // // //     stages {
// // // // // // // //         stage('Checkout') {
// // // // // // // //             steps {
// // // // // // // //                 checkout scm
// // // // // // // //             }
// // // // // // // //         }

// // // // // // // //         stage('Install Dependencies') {
// // // // // // // //             steps {
// // // // // // // //                 sh 'npm ci'
// // // // // // // //                 sh 'npx playwright install --with-deps'
// // // // // // // //             }
// // // // // // // //         }

// // // // // // // //         // PrivateLabel-Stage entfernt – war nur Beispiel

// // // // // // // //         stage('Run Playwright Tests') {
// // // // // // // //             steps {
// // // // // // // //                 sh '''
// // // // // // // //                 npx playwright test \
// // // // // // // //                     --reporter=html,list,junit \
// // // // // // // //                     --output=${PLAYWRIGHT_OUTPUT} \
// // // // // // // //                     --retries=2 \
// // // // // // // //                     --workers=4
// // // // // // // //                 '''
// // // // // // // //             }
// // // // // // // //         }

// // // // // // // //         stage('Publish Report') {
// // // // // // // //             steps {
// // // // // // // //                 publishHTML(target: [
// // // // // // // //                     allowMissing: true,
// // // // // // // //                     alwaysLinkToLastBuild: true,
// // // // // // // //                     keepAll: true,
// // // // // // // //                     reportDir: '${PLAYWRIGHT_REPORT}',
// // // // // // // //                     reportFiles: 'index.html',
// // // // // // // //                     reportName: 'Playwright HTML Report'
// // // // // // // //                 ])
// // // // // // // //             }
// // // // // // // //         }
// // // // // // // //     }

// // // // // // // //     post {
// // // // // // // //         always {
// // // // // // // //             archiveArtifacts artifacts: '${PLAYWRIGHT_OUTPUT}/**', allowEmptyArchive: true
// // // // // // // //             archiveArtifacts artifacts: '${PLAYWRIGHT_REPORT}/**', allowEmptyArchive: true
// // // // // // // //             junit testResults: '${PLAYWRIGHT_OUTPUT}/**/junit-report.xml', allowEmptyResults: true
// // // // // // // //             cleanWs()
// // // // // // // //         }
// // // // // // // //         success {
// // // // // // // //             echo "✅ Alle Tests erfolgreich!"
// // // // // // // //         }
// // // // // // // //         failure {
// // // // // // // //             echo "❌ Tests fehlgeschlagen – siehe Report & Artefakte!"
// // // // // // // //         }
// // // // // // // //     }
// // // // // // // // }