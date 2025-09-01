pipeline {
    agent any

    stages {
        stage('Check Docker') {
            steps {
                script {
                    echo "Checking Docker installation..."
                    sh 'docker --version'
                    sh 'docker ps'
                }
            }
        }

        stage('Check Docker Compose') {
            steps {
                script {
                    echo "Checking Docker Compose installation..."
                    sh 'docker-compose --version'
                }
            }
        }

        stage('Test Docker Run') {
            steps {
                script {
                    echo "Running a test container..."
                    sh 'docker run --rm hello-world'
                }
            }
        }

        stage('Test Docker Compose Run') {
            steps {
                script {
                    echo "Creating a simple docker-compose.yml for test"
                    writeFile file: 'docker-compose.yml', text: '''
                    version: "3.9"
                    services:
                      alpine-test:
                        image: alpine
                        command: echo "Hello from docker-compose"
                    '''
                    sh 'docker-compose up --abort-on-container-exit'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker-compose down || true'
        }
    }
}
