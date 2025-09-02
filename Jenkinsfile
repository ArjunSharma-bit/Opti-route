pipeline {
    agent any

    environment {
      GITHUB_REPO = 'git@github.com:ArjunSharma-bit/Opti-route.git'
      GITHUB_ACCOUNT = 'ArjunSharma-bit'
      GITHUB_CREDENTIALS = 'git-hub-pat-token'
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
            steps {
                script {
                githubNotify( context: 'E2E-Tests', status: 'PENDING', description: 'Running......', credentialsId: env.GITHUB_CREDENTIALS, repo: env.GITHUB_REPO, account: env.GITHUB_ACCOUNT, sha: env.GIT_COMMIT)
              }
                echo "Running E2E Tests"
                sh '''
                docker-compose -f docker-compose.test.yml run --rm app-test npm run test:e2e
                '''
            }
            post {
              success {
                script {
                  githubNotify (context: 'E2E-Tests', status: 'SUCCESS', description: 'Test Passed', credentialsId: env.GITHUB_CREDENTIALS, repo: env.GITHUB_REPO, account: env.GITHUB_ACCOUNT, sha: env.GIT_COMMIT)
                }
              }
              failure {
                script {
                  githubNotify (context: 'E2E-Tests', status: 'FAILURE', description: 'Test Failed', credentialsId: env.GITHUB_CREDENTIALS, repo: env.GITHUB_REPO, account: env.GITHUB_ACCOUNT, sha: env.GIT_COMMIT)
            }
        }
      }
    }
  }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker-compose -f docker-compose.test.yml down -v'
        }
    }
}
