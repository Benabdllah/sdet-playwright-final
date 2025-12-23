pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.57.0-noble'  // Aktuelle stabile Version, alle Deps + Browser vorinstalliert
            args '--user=root'  // Falls nötig für Rechte
        }
    }

    environment {
        // Git-Repository URL – besser als Credential handhaben
        GIT_REPO = 'https://github.com/dein-username/pw-practice-app.git'
        
        // PrivateLabel für Testumgebung
        PRIVATE_LABEL = 'SMX'
        
        // Playwright Config
        PLAYWRIGHT_OUTPUT = 'test-results'
        PLAYWRIGHT_REPORT = 'playwright-report'
    }

    parameters {
        choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit', 'all'], description: 'Browser-Projekt(e) ausführen')
        string(name: 'GREP', defaultValue: '', description: 'Optional: Tests filtern mit --grep "tag"')
        booleanParam(name: 'SHARDING', defaultValue: false, description: 'Sharding aktivieren (für große Suites)')
        integer(name: 'TOTAL_SHARDS', defaultValue: 3, description: 'Anzahl Shards bei aktiviertem Sharding')
    }

    options {
        timeout(time: 90, unit: 'MINUTES')
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '50'))
        disableConcurrentBuilds()  // Vermeidet Ressourcenkonflikte
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
                echo "🔹 Node Dependencies installieren (mit Cache)"
                sh 'npm ci --cache .npm-cache --prefer-offline'
                
                echo "🔹 Playwright Browser installieren (mit Deps)"
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Set PrivateLabel') {
            steps {
                echo "🔹 PrivateLabel Werte aus JSON laden"
                sh 'npx ts-node scripts/getPrivateLabel.ts'
            }
        }

        stage('Run Playwright Tests') {
            parallel {
                stage('Chromium') {
                    when { params.BROWSER == 'all' || params.BROWSER == 'chromium' }
                    steps { runTests('chromium') }
                }
                stage('Firefox') {
                    when { params.BROWSER == 'all' || params.BROWSER == 'firefox' }
                    steps { runTests('firefox') }
                }
                stage('WebKit') {
                    when { params.BROWSER == 'all' || params.BROWSER == 'webkit' }
                    steps { runTests('webkit') }
                }
            }
        }

        stage('Publish Reports') {
            steps {
                echo "🔹 HTML Report publishen"
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
            echo "🔹 Artefakte sichern"
            archiveArtifacts artifacts: "${PLAYWRIGHT_OUTPUT}/**", allowEmptyArchive: true
            archiveArtifacts artifacts: "${PLAYWRIGHT_REPORT}/**", allowEmptyArchive: true
            
            // JUnit für Jenkins Test Trends (in playwright.config.ts: reporter: [['junit', { outputFile: 'test-results/junit-report.xml' }]])
            junit testResults: "${PLAYWRIGHT_OUTPUT}/**/junit-report.xml", allowEmptyResults: true
            
            echo "🔹 Workspace aufräumen"
            cleanWs()
        }
        success {
            echo "✅ Alle Tests erfolgreich!"
        }
        failure {
            echo "❌ Tests fehlgeschlagen – siehe Report & Traces!"
        }
        unstable {
            echo "⚠️ Einige Tests flaky oder skipped"
        }
    }
}

// Helper Funktion für wiederverwendbare Test-Execution
def runTests(String project) {
    echo "🔹 Playwright Tests für ${project} starten"
    
    def shardOption = ''
    if (params.SHARDING) {
        def shardIndex = env.EXECUTOR_NUMBER ? (env.EXECUTOR_NUMBER.toInteger() + 1) : 1
        shardOption = "--shard=${shardIndex}/${params.TOTAL_SHARDS}"
    }
    
    def grepOption = params.GREP ? "--grep '${params.GREP}'" : ''
    
    sh """
    npx playwright test \
        --project=${project} \
        ${shardOption} \
        ${grepOption} \
        --reporter=html,list,junit \
        --output=${PLAYWRIGHT_OUTPUT} \
        --timeout=60000 \
        --headed=false \
        --retries=2 \
        --workers=4 \
        --trace=retain-on-failure \
        --video=retain-on-failure \
        --screenshot=only-on-failure
    """
}