pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "nadil95/flute:latest"
        EC2_HOST = "13.40.154.215" 
        SSH_CREDENTIALS = "geo-ssh"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/nadil1995/melody-maestro-site-83930.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build React App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "🔑 Logging in to Docker Hub..."
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        echo "🚀 Building Docker image..."
                        # Disable BuildKit to avoid missing buildx error
                        export DOCKER_BUILDKIT=0
                        docker build -t $DOCKER_IMAGE .

                        echo "📦 Pushing image to Docker Hub..."
                        docker push $DOCKER_IMAGE

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy Build to EC2') {
            steps {
                sshagent([SSH_CREDENTIALS]) {
                    sh '''
                        echo "🚀 Deploying container on EC2..."
                        ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "
                            echo '🧹 Stopping and removing old container if exists...' &&
                            sudo docker stop geoapp || true &&
                            sudo docker rm geoapp || true &&

                            echo '📦 Pulling latest image...' &&
                            sudo docker pull $DOCKER_IMAGE &&

                            echo '🚀 Starting new container...' &&
                            sudo docker run -d -p 8081:80 --name geoapp $DOCKER_IMAGE
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}
