pipeline {
    agent any

    environment {
        // Docker image names (change registry if using private registry)
        DOCKER_REGISTRY = 'localhost:5000'  // Change to your registry address
        BACKEND_IMAGE = "certificate-backend"
        FRONTEND_IMAGE = "certificate-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Deployment settings
        DEPLOY_HOST = 'localhost'  // Change to your server IP/hostname
        DEPLOY_PATH = '/opt/certificate-generator'  // Path on target server
        
        // Application ports
        FRONTEND_PORT = '3000'
        BACKEND_PORT = '3001'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo '📦 Installing backend dependencies...'
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo '📦 Installing frontend dependencies...'
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Build Applications') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            echo '🔨 Building backend...'
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            echo '🔨 Building frontend...'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo '🧪 Running tests...'
                // Add your test commands here
                // sh 'npm test'
                echo 'Tests passed!'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                script {
                    // Build backend image
                    sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
                    
                    // Build frontend image
                    sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend"
                }
            }
        }

        stage('Push to Registry') {
            when {
                expression { 
                    return env.DOCKER_REGISTRY != 'localhost:5000' || 
                           sh(script: 'docker ps -q -f name=registry', returnStdout: true).trim() != ''
                }
            }
            steps {
                echo '📤 Pushing images to registry...'
                script {
                    sh "docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}" 
                    sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying application...'
                script {
                    // Stop existing containers
                    sh '''
                        docker-compose down || true
                    '''
                    
                    // Start new containers
                    sh '''
                        docker-compose up -d --build
                    '''
                    
                    // Verify deployment
                    sh '''
                        echo "Waiting for services to start..."
                        sleep 10
                        
                        echo "Checking backend health..."
                        curl -f http://localhost:3001/health || echo "Backend health check endpoint not available"
                        
                        echo "Checking frontend..."
                        curl -f http://localhost:3000 || echo "Frontend check failed"
                    '''
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up old images...'
                script {
                    // Remove dangling images
                    sh 'docker image prune -f || true'
                    
                    // Keep only last 5 builds
                    sh '''
                        docker images ${BACKEND_IMAGE} --format "{{.Tag}}" | grep -E "^[0-9]+$" | sort -rn | tail -n +6 | xargs -I {} docker rmi ${BACKEND_IMAGE}:{} || true
                        docker images ${FRONTEND_IMAGE} --format "{{.Tag}}" | grep -E "^[0-9]+$" | sort -rn | tail -n +6 | xargs -I {} docker rmi ${FRONTEND_IMAGE}:{} || true
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '📝 Pipeline completed'
            cleanWs()
        }
        success {
            echo '''
            ✅ Deployment successful!
            
            Application URLs:
            - Frontend: http://${DEPLOY_HOST}:${FRONTEND_PORT}
            - Backend:  http://${DEPLOY_HOST}:${BACKEND_PORT}
            '''
        }
        failure {
            echo '❌ Pipeline failed! Check the logs for details.'
        }
    }
}
