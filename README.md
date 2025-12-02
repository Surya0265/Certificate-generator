# Certificate Studio - Professional Certificate Management System

A full-stack microservice for designing, generating, and managing digital certificates with drag-and-drop template editing and PDF generation.

## Features

- Template Designer: Drag-and-drop layout editor with PDF/image support
- Font Management: Upload and manage custom fonts
- Multi-field Support: Add unlimited text fields to certificate templates
- PDF Generation: Generate certificates as PDF files
- User Authentication: Token-based auth system
- Layout Confirmation: Draft and confirmed layout states
- Responsive Design: Modern UI with Vite and React

## Technology Stack

**Backend:**
- Express.js with TypeScript
- PDFKit for PDF generation
- Node.js runtime

**Frontend:**
- React 18 with TypeScript
- Fabric.js for canvas editing
- Vite build tool
- React Router for navigation

## Installation & Setup

### Prerequisites
- Node.js v16+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

## API Example: Certificate Generation

Send certificate data as follows:

```json
{
  "layoutId": "INFINITUM",
  "data": {
    "Name": "John Smith",
    "Class": "2024"
  }
}
```

**POST** `/api/certificates/generate`
- Returns: PDF file as download
- Filename: `John_Smith_INFINITUM_Certificate.pdf`

## Hosting Instructions

### Frontend (Vercel)

1. Push your frontend code to GitHub.
2. Go to [Vercel](https://vercel.com/) and import your repo.
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.onrender.com/api`
6. Deploy!

### Backend (Render)

1. Push your backend code to GitHub.
2. Go to [Render](https://render.com/) and create a new Web Service.
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Set environment variable:
   - `PORT=3001`
   - `CORS_ORIGIN=https://your-frontend-url.vercel.app`
6. Deploy!

## Dockerfiles

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "vite", "preview", "--port", "3000"]
```

## Jenkinsfile (CI/CD)

```groovy
pipeline {
  agent any
  stages {
    stage('Install Backend') {
      steps {
        dir('backend') {
          sh 'npm install'
          sh 'npm run build'
        }
      }
    }
    stage('Install Frontend') {
      steps {
        dir('frontend') {
          sh 'npm install'
          sh 'npm run build'
        }
      }
    }
    stage('Test') {
      steps {
        sh 'echo "Run your tests here"'
      }
    }
    stage('Deploy') {
      steps {
        sh 'echo "Deploy steps here (Vercel/Render)"'
      }
    }
  }
}
```

## License
MIT
