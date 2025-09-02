pipeline {
    agent any

    environment {
      GITHUB_REPO = 'git@github.com:ArjunSharma-bit/Opti-route.git'
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
            steps {
                script {
              }
                echo "Running E2E Tests"
                sh '''
                docker-compose -f docker-compose.test.yml run --rm app-test npm run test:e2e
                '''
            }
            post {
              success {
                script {
                }
              }
              failure {
                script {
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
