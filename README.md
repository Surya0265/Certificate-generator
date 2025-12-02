# Certificate Generator - Microservice

A complete certificate generation microservice with a professional UI for creating, editing, and generating certificates with customizable layouts.

## 🚀 Features

✅ **User Authentication** - Secure login system with predefined credentials  
✅ **Layout Editor** - Drag-and-drop template editor with field positioning  
✅ **Predefined Fields** - Name, Event, College, Class, Year (customizable per layout)  
✅ **Font Management** - Upload custom fonts (TTF) and use them in layouts  
✅ **Certificate Generation** - Generate PDFs with dynamic text overlay  
✅ **Adaptive Font Sizing** - Intelligent font size adjustment for Name and College fields  
✅ **Smart Naming** - Certificates named as: `{EventName}_{PersonName}.pdf`  
✅ **Test Page** - Admin interface to test certificate generation  
✅ **Responsive Design** - Works on desktop and mobile devices  

## 📋 Prerequisites

- **Node.js** (v16+)
- **npm** or **yarn**
- **Postman** (optional, for API testing)

## 🏗️ Project Structure

```
certificate-generator/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── app.ts          # Express app configuration
│   │   ├── index.ts        # Server entry point
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   ├── data/
│   │   ├── users.json      # User credentials
│   │   ├── layouts/        # Saved layout configurations
│   │   ├── certificates/   # Generated certificates
│   │   └── uploads/        # Uploaded templates and fonts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # React + TypeScript UI
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context (Auth)
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # App entry point
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🔐 Default Credentials

The application comes with three demo users:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| teacher | teacher123 | Educator |
| user | user123 | General User |

**Note:** In production, replace `data/users.json` with a proper database and authentication system.

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/Surya0265/Certificate-generator.git
cd Certificate-generator

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

**Login** with any of the demo credentials above.

## 📚 Workflow

### Step 1: Create a Layout

1. Click **"1. Upload Template"** - Upload a PDF, PNG, or JPG certificate template
2. Click **"2. Upload Fonts"** - (Optional) Upload custom TTF font files
3. Enter **"Event Name"** - This becomes the layout identifier
4. Select **"Fields"** - Choose which fields to include (Name, Event, College, Class, Year)
5. Drag fields on canvas to position them
6. Adjust font size and color as needed
7. Click **"Save Layout"** to save the configuration
8. Click **"Confirm & Lock"** to finalize the layout

### Step 2: Test Certificate Generation

1. Click the **"Test"** button in the header
2. Select a confirmed layout
3. Fill in test data (Name is required)
4. Click **"Generate & Download Certificate"**
5. The PDF will download with filename: `{EventName}_{PersonName}.pdf`

### Step 3: Generate Certificates via API

Use the `/api/certificates/generate` endpoint with the layout ID and recipient data.

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/login
Body: { "username": "admin", "password": "admin123" }
Response: { "token": "jwt_token" }
```

### Layout Management
```
GET    /api/layouts                    # List all layouts
POST   /api/layouts                    # Create layout
GET    /api/layouts/:layoutId          # Get specific layout
PUT    /api/layouts/:layoutId          # Update layout
POST   /api/layouts/:layoutId/confirm  # Confirm/lock layout
DELETE /api/layouts/:layoutId          # Delete layout
```

### File Uploads
```
POST /api/uploads/template             # Upload template (PDF/PNG/JPG)
POST /api/uploads/font                 # Upload font (TTF)
```

### Certificate Generation
```
POST /api/certificates/generate              # Generate & download PDF
POST /api/certificates/generate-and-save     # Generate & save to disk
GET  /api/certificates/download/:fileName    # Download saved certificate
```

## 📝 Certificate Generation Example

### Request:
```bash
curl -X POST http://localhost:3001/api/certificates/generate \
  -H "Content-Type: application/json" \
  -d '{
    "layoutId": "Annual_Awards_2024",
    "data": {
      "Name": "John Smith",
      "Event": "Annual Awards 2024",
      "College": "Engineering Department",
      "Class": "2024",
      "Year": "2024"
    }
  }'
```

### Response:
- **Status:** 200
- **Content-Type:** application/pdf
- **Content-Disposition:** attachment; filename="Annual_Awards_2024_John_Smith.pdf"
- **Body:** Binary PDF data

## 🎨 UI Features

### Login Page
- Blue gradient background
- Professional card design
- Demo credentials displayed for reference

### Layout Editor
- Real-time canvas preview with proper scale ratio
- Drag-and-drop field positioning
- Font size adjustment with smooth scaling
- Color picker for text
- Field toggle (enable/disable)
- Custom font preview in editor

### Test Page
- Dropdown to select confirmed layouts
- Form to fill in certificate data
- One-click PDF generation and download
- Real-time validation and feedback

## 🔧 Configuration

### Backend Configuration

**Environment Variables** (if needed):
```env
PORT=3001
NODE_ENV=development
```

### Frontend Configuration

**API Base URL:** `http://localhost:3001`

To change, update:
- `frontend/src/services/api.ts`

## 📦 Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **PDF Generation:** PDFKit, pdf-lib, fontkit
- **File Upload:** Multer
- **Authentication:** JWT (custom)

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Canvas:** Fabric.js v5.3.0
- **PDF Viewer:** PDF.js v3.11.174
- **Routing:** React Router v6
- **Notifications:** React Toastify
- **Styling:** CSS3

## 🚀 Deployment

### Backend Deployment (Example: Heroku)

```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Frontend Deployment (Example: Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

## 🐛 Troubleshooting

### Issue: "Layout not found"
- Ensure the layout is created and confirmed before generating certificates
- Check the layoutId matches exactly

### Issue: "Font not rendering"
- Verify the font file is uploaded in TTF format
- Check font name in the layout matches the uploaded font

### Issue: "Preview text looks small"
- This is normal - the preview shows at editor resolution
- The actual certificate will render at full PDF resolution
- The scale ratio is automatically calculated to match the final output

### Issue: "Certificate download fails"
- Ensure Name field is provided (it's required)
- Check that all field data is valid strings
- Verify the backend is running on port 3001

## 📄 File Naming Convention

### Layouts
- **Format:** `{EventName}.json`
- **Example:** `Annual_Awards_2024.json`
- **Location:** `backend/data/layouts/`

### Certificates
- **Format:** `{EventName}_{PersonName}.pdf`
- **Example:** `Annual_Awards_2024_John_Smith.pdf`
- **Location:** `backend/data/certificates/` (if saved)

## 🔄 Font Sizing Logic

### Name Field
- If text length > 35 characters: reduce by 1.2px per extra character
- Minimum size: 18px

### College Field
- **40-49 chars:** Reduce by 0.8px per character, min 18px
- **49-60 chars:** Reduce by 0.8px per character, min 14px
- **60-70 chars:** Reduce by 1.2px per character, min 11px
- **70+ chars:** Reduce by 0.8px per character, min 9px

### Other Fields
- Use the size set in the layout editor

## 📧 Support

For issues, feature requests, or questions:
- Create an issue on GitHub
- Contact: dev@certificate-generator.com

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙌 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with ❤️ by the Certificate Generator Team**
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
