pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Jenkins automatically checks out PR branch
                checkout scm
            }
        }

        stage('Run E2E Tests in Docker') {
            steps {
                sh '''
                  echo "Starting test environment..."
                  docker compose -f docker-compose.test.yml up -d --build
                  sleep 15 # wait for DB/Redis to be ready

                  echo "Running E2E tests..."
                  npm run test:e2e
                '''
            }
        }
    }

    post {
        always {
            echo " Cleaning up..."
            sh 'docker compose -f docker-compose.test.yml down'
        }
        success {
            echo 'E2E tests passed'
        }
        failure {
            echo 'E2E tests failed'
        }
    }
}
