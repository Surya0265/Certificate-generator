# Hosting Guide: Vercel (Frontend) & Render (Backend)

## Part 1: Host Frontend on Vercel

### Step 1: Prepare Your Repository
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin master
   ```

### Step 2: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "GitHub" and authorize
4. Verify email

### Step 3: Import Project to Vercel
1. In Vercel dashboard, click "New Project"
2. Select your "Certificate-generator" repository
3. Click "Import"

### Step 4: Configure Project Settings
1. **Framework Preset**: Select "Vite"
2. **Root Directory**: Set to `frontend/`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 5: Add Environment Variables
1. Scroll down to "Environment Variables"
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-render-url.onrender.com` (you'll get this after deploying backend)
   - Click "Add"

3. Save and continue

### Step 6: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Get your frontend URL (e.g., `https://certificate-generator.vercel.app`)

### Step 7: Update Backend CORS
Once you have the Vercel URL:
1. Go to your backend Render environment variables
2. Update `CORS_ORIGIN` to: `https://your-vercel-url.vercel.app`
3. Redeploy backend

---

## Part 2: Host Backend on Render

### Step 1: Prepare Backend Code
1. Ensure your `backend/package.json` has proper scripts:
   ```json
   {
     "scripts": {
       "dev": "ts-node src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js"
     }
   }
   ```

2. Create `.env.production` in backend:
   ```
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
   ```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Click "Sign Up"
3. Choose "GitHub" and authorize
4. Verify email

### Step 3: Create New Web Service
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Select the "Certificate-generator" repo
5. Click "Connect"

### Step 4: Configure Service
1. **Name**: `certificate-generator-backend`
2. **Environment**: `Node`
3. **Region**: Select closest to your users
4. **Branch**: `master`
5. **Build Command**: `cd backend && npm install && npm run build`
6. **Start Command**: `cd backend && npm start`
7. **Plan**: Select "Free" (or paid if needed)

### Step 5: Add Environment Variables
1. Scroll to "Environment"
2. Click "Add Environment Variable"
3. Add:
   ```
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
   ```
4. Click "Save"

### Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Get your backend URL (e.g., `https://certificate-generator-backend.onrender.com`)

### Step 7: Update Frontend Environment
1. Go back to Vercel project settings
2. Update `VITE_API_URL` to: `https://certificate-generator-backend.onrender.com`
3. Redeploy frontend

---

## Part 3: Dockerize Your Application

### Step 1: Backend Dockerfile (Already Created)
File: `backend/Dockerfile`
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Step 2: Frontend Dockerfile (Already Created)
File: `frontend/Dockerfile`
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "vite", "preview", "--port", "3000"]
```

### Step 3: Create docker-compose.yml
File: `docker-compose.yml` (in project root)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - CORS_ORIGIN=http://localhost:3000
    volumes:
      - ./backend/data:/app/data
    networks:
      - certificate-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:3001
    depends_on:
      - backend
    networks:
      - certificate-network

networks:
  certificate-network:
    driver: bridge
```

### Step 4: Build and Run with Docker
```bash
# Build images
docker-compose build

# Run containers
docker-compose up

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001

# Stop
docker-compose down
```

### Step 5: Build Individual Docker Images
```bash
# Backend
cd backend
docker build -t certificate-backend:1.0 .
docker run -p 3001:3001 certificate-backend:1.0

# Frontend
cd frontend
docker build -t certificate-frontend:1.0 .
docker run -p 3000:3000 certificate-frontend:1.0
```

---

## Part 4: Jenkins CI/CD Integration

### Step 1: Install Jenkins
**Option A: Local Installation**
```bash
# Windows (using Chocolatey)
choco install jenkins

# Linux
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list
sudo apt-get update
sudo apt-get install jenkins
sudo systemctl start jenkins
```

**Option B: Docker**
```bash
docker run -d -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:latest
```

### Step 2: Access Jenkins
1. Go to `http://localhost:8080`
2. Get initial password:
   ```bash
   # If Docker:
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   
   # If installed locally: check Jenkins logs
   ```
3. Paste password and continue
4. Click "Install suggested plugins"
5. Create first admin user

### Step 3: Install Required Plugins
1. Go to "Manage Jenkins" → "Manage Plugins"
2. Install:
   - GitHub Integration
   - GitHub Branch Source
   - Docker Pipeline
   - NodeJS Plugin

### Step 4: Configure GitHub Credentials
1. Go to "Manage Jenkins" → "Manage Credentials"
2. Click "Global" → "Add Credentials"
3. Type: "GitHub Personal Access Token"
4. Token: Create one at [github.com/settings/tokens](https://github.com/settings/tokens)
5. Save

### Step 5: Create Pipeline Job
1. Click "New Item"
2. Enter name: `Certificate-Generator-Pipeline`
3. Select "Pipeline"
4. Click "OK"

### Step 6: Configure Pipeline
1. Scroll to "Pipeline" section
2. Select "Pipeline script from SCM"
3. SCM: "Git"
4. Repository URL: `https://github.com/YOUR-USERNAME/Certificate-generator.git`
5. Credentials: Select GitHub credentials
6. Branch: `*/master`
7. Script Path: `Jenkinsfile`
8. Click "Save"

### Step 7: Jenkinsfile (Already Created)
File: `Jenkinsfile` (in project root)
```groovy
pipeline {
  agent any
  
  environment {
    DOCKER_REGISTRY = 'your-docker-registry'
    BACKEND_IMAGE = 'certificate-backend:${BUILD_NUMBER}'
    FRONTEND_IMAGE = 'certificate-frontend:${BUILD_NUMBER}'
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
      steps {
        script {
          sh 'docker build -t ${BACKEND_IMAGE} ./backend'
          sh 'docker build -t ${FRONTEND_IMAGE} ./frontend'
        }
      }
    }

    stage('Test') {
      steps {
        sh 'echo "Running tests..."'
        // Add your test commands here
      }
    }

    stage('Deploy to Render') {
      steps {
        sh 'echo "Trigger Render deployment..."'
        // Use Render deploy hook
        sh '''
          curl -X POST \
            https://api.render.com/deploy/srv-YOUR-SERVICE-ID \
            -H "Authorization: Bearer YOUR_RENDER_API_KEY"
        '''
      }
    }

    stage('Notify Vercel') {
      steps {
        sh 'echo "Trigger Vercel deployment..."'
        // Vercel auto-deploys on GitHub push
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo 'Pipeline succeeded!'
    }
    failure {
      echo 'Pipeline failed!'
    }
  }
}
```

### Step 8: Configure Render Deploy Hook
1. Go to Render dashboard → Your service
2. Click "Settings"
3. Find "Deploy Hook"
4. Copy the hook URL
5. Update Jenkinsfile with your hook URL and API key

### Step 9: Run Pipeline
1. Go to Jenkins dashboard
2. Click `Certificate-Generator-Pipeline`
3. Click "Build Now"
4. Watch the build progress

---

## Part 5: Complete Workflow

### For Development:
```bash
# Local development
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2
```

### For Docker:
```bash
docker-compose up
```

### For Production:
1. Push to GitHub
2. Jenkins automatically triggers on push
3. Jenkins builds Docker images
4. Jenkins deploys to Render (backend) and Vercel (frontend)
5. Both services go live

---

## Troubleshooting

### Vercel Build Fails
- Check build logs in Vercel dashboard
- Ensure `vercel.json` is correct
- Verify environment variables are set

### Render Build Fails
- Check deploy logs
- Ensure Node version is 18+
- Verify build command and start command

### Docker Build Fails
- Ensure Dockerfile paths are correct
- Check npm dependencies
- Verify Node version in image

### Jenkins Pipeline Fails
- Check Jenkins logs: `docker logs jenkins`
- Verify GitHub credentials
- Check Render/Vercel API keys
- Ensure webhook is configured

---

## Next Steps

1. Commit all files: `git add . && git commit -m "Add deployment configs"`
2. Push to GitHub: `git push origin master`
3. Follow Vercel hosting steps
4. Follow Render hosting steps
5. Set up Jenkins for automation

Good luck with your deployment!
