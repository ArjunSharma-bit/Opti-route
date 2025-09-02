pipeline {
    agent any
    stages {
        stage('Test Credential') {
            steps {
                withCredentials([string(credentialsId: 'git-hub-pat-token', variable: 'GHTOKEN')]) {
                    sh 'echo "Credential works!"'
                }
            }
        }
    }
}
