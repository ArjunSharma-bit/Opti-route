pipeline {
    agent any

    environment {
        GITHUB_REPO    = 'git@github.com:ArjunSharma-bit/Opti-route.git'
        GITHUB_ACCOUNT = 'ArjunSharma-bit'
    }

    stages {
        stage("Checkout") {
            steps {
                checkout scm
                script {
                    echo "Current Branch: ${env.BRANCH_NAME}"
                    echo "Current commit: ${env.GIT_COMMIT}"
                }
            }
        }

        stage('Check Docker') {
            steps {
                script {
                    echo "Checking Docker installation..."
                    sh 'docker --version'
                    sh 'docker ps'
                }
            }
        }

        stage('Start Test Env') {
            steps {
                script {
                    echo "Running Test Build"
                    sh '''
                        docker-compose -f docker-compose.test.yml up -d --build
                        sleep 15
                        docker-compose -f docker-compose.test.yml ps
                    '''
                }
            }
        }

        stage('Run E2E Tests') {
            when {
                expression { 
                    return env.CHANGE_ID != null 
                }
<<<<<<< HEAD
            }
            steps {
                withCredentials([string(credentialsId: 'git-hub-pat-token', variable: 'GITHUB_TOKEN')]) {
                    script {
                        githubNotify(
                            context: 'E2E-Tests',
                            status: 'PENDING',
                            description: 'Running E2E tests...',
                            credentialsId: 'git-hub-pat-token',
                            repo: env.GITHUB_REPO,
                            account: env.GITHUB_ACCOUNT,
                            sha: env.GIT_COMMIT
                        )

                        echo "Running E2E Tests"
                        sh '''
                            docker-compose -f docker-compose.test.yml run --rm app-test npm run test:e2e
                        '''
                    }
                }
            }
            post {
                success {
                    script {
                        withCredentials([string(credentialsId: 'git-hub-pat-token', variable: 'GITHUB_TOKEN')]) {
                            githubNotify(
                                context: 'E2E-Tests',
                                status: 'SUCCESS',
                                description: 'E2E tests passed',
                                credentialsId: 'git-hub-pat-token',
                                repo: env.GITHUB_REPO,
                                account: env.GITHUB_ACCOUNT,
                                sha: env.GIT_COMMIT
                            )
                        }
                    }
                }
                failure {
                    script {
                        withCredentials([string(credentialsId: 'git-hub-pat-token', variable: 'GITHUB_TOKEN')]) {
                            githubNotify(
                                context: 'E2E-Tests',
                                status: 'FAILURE',
                                description: 'E2E tests failed',
                                credentialsId: 'git-hub-pat-token',
                                repo: env.GITHUB_REPO,
                                account: env.GITHUB_ACCOUNT,
                                sha: env.GIT_COMMIT
                            )
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up test environment...'
            sh 'docker-compose -f docker-compose.test.yml down -v'
        }
    }
}