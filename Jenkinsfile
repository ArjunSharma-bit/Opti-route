pipeline {
    agent any

    stages {
        stage("Checkout") {
            steps {
                checkout scm
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
                githubNotify context: 'E2E-Tests', status: 'PENDING', description: 'Running......', credentialsId: 'github-token'
              }
                echo "Running E2E Tests"
                sh '''
                docker-compose -f docker-compose.test.yml run --rm app-test npm run test:e2e
                '''
            }
            post {
              success {
                script {
                  githubNotify context: 'E2E-Tests', status: 'SUCCESS', description: 'Test Passed', credentialsId: 'github-token'
                }
              }
              failure {
                script {
                  githubNotify context: 'E2E-Tests', status: 'FAILURE', description: 'Test Failed', credentialsId: 'github-token'
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
