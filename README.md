# Certificate Generation Microservice

A production-ready microservice for managing certificate templates and generating certificates dynamically. Built with Node.js, Express, React, Fabric.js, and PDFKit.

## 🎯 Features

- **Phase 1: Template Setup**
  - Upload certificate templates (PNG, JPG, PDF)
  - Upload custom TTF fonts
  - Drag-and-drop UI to place dynamic text fields
  - Save layout configurations as JSON files
  - Lock layouts for production use

- **Phase 2: Certificate Generation**
  - Generate certificates on-demand via REST API
  - Support for custom fonts and text styling
  - Return certificates as PDF binary streams
  - No database required - file-based JSON storage

## 📁 Project Structure

```
Certificate-generator/
├── backend/
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── fileHandler.ts        # JSON file operations
│   │   │   └── pdfGenerator.ts       # PDFKit certificate generation
│   │   ├── controllers/
│   │   │   ├── uploadController.ts   # File upload handlers
│   │   │   ├── layoutController.ts   # Layout management
│   │   │   └── certificateController.ts  # Certificate generation
│   │   ├── routes/
│   │   │   ├── uploadRoutes.ts
│   │   │   ├── layoutRoutes.ts
│   │   │   └── certificateRoutes.ts
│   │   ├── middleware/
│   │   │   ├── upload.ts             # Multer configuration
│   │   │   └── errorHandler.ts       # Global error handling
│   │   ├── app.ts                    # Express app setup
│   │   └── index.ts                  # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── api.ts                # API client with Axios
│   │   ├── components/
│   │   │   ├── TemplateEditor.tsx    # Fabric.js canvas editor
│   │   │   └── TemplateEditor.css
│   │   ├── pages/
│   │   │   ├── LayoutEditor.tsx      # Main editor page
│   │   │   └── LayoutEditor.css
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.development
├── data/
│   ├── layouts/                      # JSON layout configs
│   └── uploads/
│       ├── templates/                # Uploaded template images
│       └── fonts/                    # Uploaded TTF fonts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend will start on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## 📋 API Reference

### Upload Endpoints

#### Upload Template
```http
POST /api/upload/template
Content-Type: multipart/form-data

file: <binary PNG/JPG/PDF>

Response:
{
  "success": true,
  "message": "Template uploaded successfully",
  "data": {
    "fileName": "550e8400-e29b-41d4-a716-446655440000.png",
    "originalName": "certificate.png",
    "size": 1024000,
    "mimetype": "image/png",
    "uploadedAt": "2025-12-01T10:30:00Z"
  }
}
```

#### Upload Font
```http
POST /api/upload/font
Content-Type: multipart/form-data

file: <binary TTF>

Response:
{
  "success": true,
  "message": "Font uploaded successfully",
  "data": {
    "fileName": "550e8400-e29b-41d4-a716-446655440001.ttf",
    "originalName": "Roboto-Regular.ttf",
    "size": 512000,
    "mimetype": "font/ttf",
    "uploadedAt": "2025-12-01T10:30:00Z"
  }
}
```

### Layout Management Endpoints

#### Save Layout
```http
POST /api/layouts
Content-Type: application/json

{
  "templateFile": "550e8400-e29b-41d4-a716-446655440000.png",
  "fonts": [
    { "name": "Roboto-Regular", "file": "550e8400-e29b-41d4-a716-446655440001.ttf" }
  ],
  "fields": [
    {
      "name": "Name",
      "x": 250,
      "y": 380,
      "fontSize": 42,
      "fontFamily": "Roboto-Regular",
      "color": "#000000"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Layout saved successfully",
  "data": {
    "layoutId": "LAY_a1b2c3d4",
    "templateFile": "550e8400-e29b-41d4-a716-446655440000.png",
    "fonts": [...],
    "fields": [...],
    "createdAt": "2025-12-01T10:35:00Z",
    "updatedAt": "2025-12-01T10:35:00Z",
    "confirmed": false
  }
}
```

#### Get Layout
```http
GET /api/layouts/{layoutId}

Response:
{
  "success": true,
  "message": "Layout retrieved successfully",
  "data": { /* Layout object */ }
}
```

#### Get All Layouts
```http
GET /api/layouts

Response:
{
  "success": true,
  "message": "Found 5 layout(s)",
  "data": [ /* Array of layouts */ ]
}
```

#### Update Layout
```http
PUT /api/layouts/{layoutId}
Content-Type: application/json

{
  "fields": [
    {
      "name": "Name",
      "x": 260,
      "y": 390,
      "fontSize": 48,
      "fontFamily": "Roboto-Bold",
      "color": "#1a472a"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Layout updated successfully",
  "data": { /* Updated layout */ }
}
```

#### Confirm Layout (Lock for Production)
```http
POST /api/layouts/{layoutId}/confirm

Response:
{
  "success": true,
  "message": "Layout confirmed successfully",
  "data": {
    "layoutId": "LAY_a1b2c3d4",
    "confirmed": true
    /* ... rest of layout */
  }
}
```

#### Delete Layout
```http
DELETE /api/layouts/{layoutId}

Response:
{
  "success": true,
  "message": "Layout deleted successfully",
  "data": { "layoutId": "LAY_a1b2c3d4" }
}
```

### Certificate Generation Endpoints

#### Generate Certificate (Return as PDF Stream)
```http
POST /api/certificates/generate
Content-Type: application/json

{
  "layoutId": "LAY_a1b2c3d4",
  "data": {
    "Name": "John Doe",
    "EventName": "AI Expo 2025",
    "Date": "Dec 01 2025"
  }
}

Response:
- Content-Type: application/pdf
- Binary PDF stream for download
```

#### Generate and Save Certificate
```http
POST /api/certificates/generate-and-save
Content-Type: application/json

{
  "layoutId": "LAY_a1b2c3d4",
  "data": {
    "Name": "Jane Smith",
    "EventName": "Hackathon 2025",
    "Date": "Dec 02 2025"
  }
}

Response:
{
  "success": true,
  "message": "Certificate generated and saved successfully",
  "data": {
    "fileName": "cert_550e8400-e29b-41d4.pdf",
    "fileSize": 102400
  }
}
```

#### Download Certificate
```http
GET /api/certificates/download/{fileName}

Response:
- Content-Type: application/pdf
- Binary PDF stream for download
```

## 🔌 Integration with Main Website

### Example: Using cURL

```bash
# 1. Generate certificate
curl -X POST http://localhost:3001/api/certificates/generate \
  -H "Content-Type: application/json" \
  -d '{
    "layoutId": "LAY_a1b2c3d4",
    "data": {
      "Name": "John Doe",
      "EventName": "AI Expo 2025",
      "Date": "Dec 01 2025"
    }
  }' \
  --output certificate.pdf
```

### Example: Using JavaScript/Node.js

```javascript
const axios = require('axios');

async function generateCertificate(layoutId, certificateData) {
  try {
    const response = await axios.post(
      'http://localhost:3001/api/certificates/generate',
      {
        layoutId,
        data: certificateData
      },
      { responseType: 'blob' }
    );

    // Save to file
    const fs = require('fs');
    fs.writeFileSync('certificate.pdf', response.data);
    
    return 'Certificate generated successfully';
  } catch (error) {
    console.error('Error generating certificate:', error);
  }
}

// Usage
generateCertificate('LAY_a1b2c3d4', {
  Name: 'John Doe',
  EventName: 'AI Expo 2025',
  Date: 'Dec 01 2025'
});
```

### Example: Using Python

```python
import requests
import json

def generate_certificate(layout_id, certificate_data):
    url = 'http://localhost:3001/api/certificates/generate'
    
    payload = {
        'layoutId': layout_id,
        'data': certificate_data
    }
    
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        with open('certificate.pdf', 'wb') as f:
            f.write(response.content)
        print('Certificate generated successfully')
    else:
        print(f'Error: {response.status_code}')
        print(response.json())

# Usage
generate_certificate('LAY_a1b2c3d4', {
    'Name': 'John Doe',
    'EventName': 'AI Expo 2025',
    'Date': 'Dec 01 2025'
})
```

## 📋 Layout JSON Format

Example layout configuration file (`data/layouts/LAY001.json`):

```json
{
  "layoutId": "LAY001",
  "templateFile": "550e8400-e29b-41d4-a716-446655440000.png",
  "fonts": [
    {
      "name": "Roboto-Regular",
      "file": "550e8400-e29b-41d4-a716-446655440001.ttf"
    },
    {
      "name": "Roboto-Bold",
      "file": "550e8400-e29b-41d4-a716-446655440002.ttf"
    }
  ],
  "fields": [
    {
      "name": "Name",
      "x": 250,
      "y": 380,
      "fontSize": 48,
      "fontFamily": "Roboto-Bold",
      "color": "#1a472a",
      "bold": true,
      "alignment": "center"
    },
    {
      "name": "EventName",
      "x": 150,
      "y": 280,
      "fontSize": 28,
      "fontFamily": "Roboto-Regular",
      "color": "#333333",
      "alignment": "center"
    },
    {
      "name": "Date",
      "x": 600,
      "y": 520,
      "fontSize": 20,
      "fontFamily": "Roboto-Regular",
      "color": "#666666",
      "alignment": "right"
    }
  ],
  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2025-12-01T10:00:00Z",
  "confirmed": true
}
```

## 🎨 Frontend Usage

1. **Open** http://localhost:3000
2. **Upload** a certificate template (PNG/JPG)
3. **Upload** custom fonts (optional, TTF format)
4. **Add Fields** using the sidebar (Name, EventName, Date, etc.)
5. **Position** fields on the canvas using drag-and-drop
6. **Save** the layout with a unique ID
7. **Confirm** the layout to lock it for generation

Once confirmed, the layout can be used to generate certificates via the API.

## 🛠 Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.development)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## 📦 File Storage Structure

```
data/
├── layouts/              # JSON configuration files
│   ├── LAY001.json
│   └── LAY002.json
├── uploads/
│   ├── templates/        # PNG, JPG, PDF files
│   └── fonts/            # TTF font files
└── certificates/         # Generated PDF certificates
```

## 🔒 Security Considerations

1. **File Validation**: All uploaded files are validated by type and size
2. **Directory Traversal Prevention**: Paths are sanitized to prevent attacks
3. **CORS Configuration**: Configurable origin restrictions
4. **Error Handling**: Sensitive information is not exposed in error messages
5. **File Permissions**: Ensure proper file system permissions on server

## 🚢 Deployment

### Docker Example

Create `Dockerfile` for backend:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/src ./src
COPY backend/tsconfig.json ./

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `CORS_ORIGIN` settings
- [ ] Configure environment variables properly
- [ ] Set up regular backups for layout and certificate files
- [ ] Use HTTPS for all API communications
- [ ] Implement rate limiting on API endpoints
- [ ] Set up monitoring and logging
- [ ] Configure proper file permissions

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3002
```

### Template Image Not Loading
- Ensure file is uploaded successfully
- Check browser console for CORS errors
- Verify file exists in `data/uploads/templates/`

### Font Not Applied to Certificate
- Ensure TTF font is uploaded
- Verify font name matches in layout configuration
- Check font file path in layout JSON

### Certificate Generation Fails
- Verify layoutId exists and is confirmed
- Check template file exists
- Ensure all fonts in configuration are uploaded
- Check error logs for details

## 📄 License

MIT
