pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.57.0-noble'
            args '-u root:root'
        }
    }

    environment {
        PLAYWRIGHT_OUTPUT = 'test-results'
        PLAYWRIGHT_REPORT = 'playwright-report'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        ansiColor('xterm')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Set PrivateLabel') {
            steps {
                sh 'npx ts-node scripts/getPrivateLabel.ts || echo "PrivateLabel script optional"'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                sh '''
                npx playwright test \
                    --reporter=html,list,junit \
                    --output=${PLAYWRIGHT_OUTPUT} \
                    --retries=2 \
                    --workers=4 \
                    --trace=retain-on-failure \
                    --video=retain-on-failure
                '''
            }
        }

        stage('Publish Report') {
            steps {
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: '${PLAYWRIGHT_REPORT}',
                    reportFiles: 'index.html',
                    reportName: 'Playwright HTML Report'
                ])
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '${PLAYWRIGHT_OUTPUT}/**', allowEmptyArchive: true
            archiveArtifacts artifacts: '${PLAYWRIGHT_REPORT}/**', allowEmptyArchive: true
            junit testResults: '${PLAYWRIGHT_OUTPUT}/**/junit-report.xml', allowEmptyResults: true
            cleanWs()
        }
    }
}