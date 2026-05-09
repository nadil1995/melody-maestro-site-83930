pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "nadil95/lashiweb:latest"
        EC2_HOST = "13.134.139.151"
        SSH_CREDENTIALS = "geo-ssh"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'v1', url: 'https://github.com/nadil1995/melody-maestro-site-83930.git'
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
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    ),
                    string(credentialsId: 'emailjs-service-id',      variable: 'VITE_EMAILJS_SERVICE_ID'),
                    string(credentialsId: 'emailjs-template-id',     variable: 'VITE_EMAILJS_TEMPLATE_ID'),
                    string(credentialsId: 'emailjs-public-key',      variable: 'VITE_EMAILJS_PUBLIC_KEY'),
                    string(credentialsId: 'aws-access-key-id2',       variable: 'VITE_AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key2',   variable: 'VITE_AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 's3-bucket2',               variable: 'VITE_S3_BUCKET'),
                    string(credentialsId: 's3-region2',               variable: 'VITE_S3_REGION'),
                    string(credentialsId: 's3-folder2',               variable: 'VITE_S3_FOLDER')
                ]) {
                    sh '''
                        echo "Logging in to Docker Hub..."
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        echo "Building Docker image with environment variables..."
                        export DOCKER_BUILDKIT=0
                        docker build \
                          --build-arg VITE_EMAILJS_SERVICE_ID="$VITE_EMAILJS_SERVICE_ID" \
                          --build-arg VITE_EMAILJS_TEMPLATE_ID="$VITE_EMAILJS_TEMPLATE_ID" \
                          --build-arg VITE_EMAILJS_PUBLIC_KEY="$VITE_EMAILJS_PUBLIC_KEY" \
                          --build-arg VITE_AWS_ACCESS_KEY_ID="$VITE_AWS_ACCESS_KEY_ID" \
                          --build-arg VITE_AWS_SECRET_ACCESS_KEY="$VITE_AWS_SECRET_ACCESS_KEY" \
                          --build-arg VITE_S3_BUCKET="$VITE_S3_BUCKET" \
                          --build-arg VITE_S3_REGION="$VITE_S3_REGION" \
                          --build-arg VITE_S3_FOLDER="$VITE_S3_FOLDER" \
                          -t $DOCKER_IMAGE .

                        echo "Pushing image to Docker Hub..."
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
                        echo "Deploying container on EC2..."
                        ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "
                            echo 'Stopping and removing old container if exists...' &&
                            sudo docker stop geoapp || true &&
                            sudo docker rm geoapp || true &&

                            echo 'Pulling latest image...' &&
                            sudo docker pull $DOCKER_IMAGE &&

                            echo 'Starting new container...' &&
                            sudo docker run -d -p 8081:80 --name geoapp $DOCKER_IMAGE
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
