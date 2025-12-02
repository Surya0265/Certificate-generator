pipeline {
  agent any

  environment {
    NODE_ENV = 'production'
    BACKEND_IMAGE = "certificate-backend:${BUILD_NUMBER}"
    FRONTEND_IMAGE = "certificate-frontend:${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Backend') {
      steps {
        dir('backend') {
          sh 'npm install'
          sh 'npm run build'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          sh 'npm install'
          sh 'npm run build'
        }
      }
    }

    stage('Build Docker Images') {
      when {
        branch 'master'
      }
      steps {
        script {
          sh 'docker build -t ${BACKEND_IMAGE} ./backend'
          sh 'docker build -t ${FRONTEND_IMAGE} ./frontend'
        }
      }
    }

    stage('Test') {
      steps {
        echo 'Running tests...'
        // Add test commands as needed
      }
    }

    stage('Deploy to Render (Backend)') {
      when {
        branch 'master'
      }
      steps {
        script {
          echo 'Triggering Render deployment...'
          // Replace with your actual Render deploy hook
          sh '''
            curl -X POST https://api.render.com/deploy/srv-YOUR-SERVICE-ID \
              -H "Authorization: Bearer YOUR_RENDER_API_KEY"
          '''
        }
      }
    }

    stage('Deploy to Vercel (Frontend)') {
      when {
        branch 'master'
      }
      steps {
        echo 'Vercel auto-deploys on GitHub push'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo 'Pipeline succeeded! Application deployed.'
    }
    failure {
      echo 'Pipeline failed! Check logs for details.'
    }
  }
}
