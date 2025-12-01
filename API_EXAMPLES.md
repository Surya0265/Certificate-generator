# API Examples and Integration Guide

## Complete Request/Response Examples

### Phase 1: Template Setup

#### Step 1: Upload Template Image

**Request:**
```http
POST http://localhost:3001/api/upload/template
Content-Type: multipart/form-data

file: [binary PNG/JPG file]
```

**Response:**
```json
{
  "success": true,
  "message": "Template uploaded successfully",
  "data": {
    "fileName": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6.png",
    "originalName": "award-certificate.png",
    "size": 1523847,
    "mimetype": "image/png",
    "uploadedAt": "2025-12-01T14:30:00.000Z"
  }
}
```

#### Step 2: Upload Custom Font (Optional)

**Request:**
```http
POST http://localhost:3001/api/upload/font
Content-Type: multipart/form-data

file: [binary TTF file]
```

**Response:**
```json
{
  "success": true,
  "message": "Font uploaded successfully",
  "data": {
    "fileName": "p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2.ttf",
    "originalName": "Roboto-Bold.ttf",
    "size": 524288,
    "mimetype": "font/ttf",
    "uploadedAt": "2025-12-01T14:32:00.000Z"
  }
}
```

#### Step 3: Save Layout Configuration

**Request:**
```http
POST http://localhost:3001/api/layouts
Content-Type: application/json

{
  "templateFile": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6.png",
  "fonts": [
    {
      "name": "Roboto-Bold",
      "file": "p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2.ttf"
    },
    {
      "name": "Roboto-Regular",
      "file": "f3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8.ttf"
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
    },
    {
      "name": "AwardLevel",
      "x": 400,
      "y": 450,
      "fontSize": 24,
      "fontFamily": "Roboto-Regular",
      "color": "#1a472a",
      "alignment": "center"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Layout saved successfully",
  "data": {
    "layoutId": "LAY_8f9a0b1c",
    "templateFile": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6.png",
    "fonts": [
      {
        "name": "Roboto-Bold",
        "file": "p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2.ttf"
      },
      {
        "name": "Roboto-Regular",
        "file": "f3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8.ttf"
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
      },
      {
        "name": "AwardLevel",
        "x": 400,
        "y": 450,
        "fontSize": 24,
        "fontFamily": "Roboto-Regular",
        "color": "#1a472a",
        "alignment": "center"
      }
    ],
    "createdAt": "2025-12-01T14:35:00.000Z",
    "updatedAt": "2025-12-01T14:35:00.000Z",
    "confirmed": false
  }
}
```

#### Step 4: Confirm/Lock Layout

**Request:**
```http
POST http://localhost:3001/api/layouts/LAY_8f9a0b1c/confirm
```

**Response:**
```json
{
  "success": true,
  "message": "Layout confirmed successfully",
  "data": {
    "layoutId": "LAY_8f9a0b1c",
    "templateFile": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6.png",
    "fonts": [
      {
        "name": "Roboto-Bold",
        "file": "p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2.ttf"
      },
      {
        "name": "Roboto-Regular",
        "file": "f3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8.ttf"
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
      },
      {
        "name": "AwardLevel",
        "x": 400,
        "y": 450,
        "fontSize": 24,
        "fontFamily": "Roboto-Regular",
        "color": "#1a472a",
        "alignment": "center"
      }
    ],
    "createdAt": "2025-12-01T14:35:00.000Z",
    "updatedAt": "2025-12-01T14:40:00.000Z",
    "confirmed": true
  }
}
```

---

### Phase 2: Certificate Generation

#### Generate Single Certificate

**Request:**
```http
POST http://localhost:3001/api/certificates/generate
Content-Type: application/json

{
  "layoutId": "LAY_8f9a0b1c",
  "data": {
    "Name": "John Doe",
    "EventName": "AI Innovation Summit 2025",
    "Date": "December 1, 2025",
    "AwardLevel": "Gold Award"
  }
}
```

**Response:**
```
Content-Type: application/pdf
Content-Length: 102400
Content-Disposition: attachment; filename="cert_a1b2c3d4-e5f6-47g8.pdf"

[Binary PDF content]
```

#### Generate Certificate (Save to Disk)

**Request:**
```http
POST http://localhost:3001/api/certificates/generate-and-save
Content-Type: application/json

{
  "layoutId": "LAY_8f9a0b1c",
  "data": {
    "Name": "Jane Smith",
    "EventName": "AI Innovation Summit 2025",
    "Date": "December 1, 2025",
    "AwardLevel": "Silver Award"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated and saved successfully",
  "data": {
    "fileName": "cert_p7q8r9s0-t1u2-v3w4.pdf",
    "fileSize": 105472
  }
}
```

#### Download Previously Generated Certificate

**Request:**
```http
GET http://localhost:3001/api/certificates/download/cert_p7q8r9s0-t1u2-v3w4.pdf
```

**Response:**
```
Content-Type: application/pdf
Content-Length: 105472
Content-Disposition: attachment; filename="cert_p7q8r9s0-t1u2-v3w4.pdf"

[Binary PDF content]
```

---

## Batch Certificate Generation Example

### Python Script for Generating Multiple Certificates

```python
import requests
import json
import time
from datetime import datetime

class CertificateGenerator:
    def __init__(self, base_url='http://localhost:3001/api'):
        self.base_url = base_url
        self.session = requests.Session()
    
    def generate_certificate(self, layout_id, certificate_data):
        """Generate a single certificate"""
        url = f'{self.base_url}/certificates/generate'
        
        payload = {
            'layoutId': layout_id,
            'data': certificate_data
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=30)
            response.raise_for_status()
            return response.content  # Binary PDF
        except requests.exceptions.RequestException as e:
            print(f'Error generating certificate: {e}')
            return None
    
    def batch_generate(self, layout_id, recipients):
        """Generate certificates for multiple recipients"""
        results = []
        total = len(recipients)
        
        for idx, recipient in enumerate(recipients, 1):
            print(f'Generating {idx}/{total}: {recipient["Name"]}...')
            
            pdf_content = self.generate_certificate(layout_id, recipient)
            
            if pdf_content:
                # Save to file
                filename = f'certificates/{recipient["Name"].replace(" ", "_")}.pdf'
                with open(filename, 'wb') as f:
                    f.write(pdf_content)
                
                results.append({
                    'status': 'success',
                    'name': recipient['Name'],
                    'file': filename
                })
            else:
                results.append({
                    'status': 'failed',
                    'name': recipient['Name']
                })
            
            # Rate limiting
            time.sleep(0.5)
        
        return results

# Usage
if __name__ == '__main__':
    generator = CertificateGenerator()
    
    # List of certificate recipients
    recipients = [
        {
            'Name': 'John Doe',
            'EventName': 'AI Innovation Summit 2025',
            'Date': 'December 1, 2025',
            'AwardLevel': 'Gold Award'
        },
        {
            'Name': 'Jane Smith',
            'EventName': 'AI Innovation Summit 2025',
            'Date': 'December 1, 2025',
            'AwardLevel': 'Silver Award'
        },
        {
            'Name': 'Bob Johnson',
            'EventName': 'AI Innovation Summit 2025',
            'Date': 'December 1, 2025',
            'AwardLevel': 'Bronze Award'
        }
    ]
    
    results = generator.batch_generate('LAY_8f9a0b1c', recipients)
    
    print('\n=== Batch Generation Summary ===')
    for result in results:
        status = '✓' if result['status'] == 'success' else '✗'
        print(f'{status} {result["name"]}: {result["status"]}')
```

---

## JavaScript Integration Example

### Client-Side Certificate Download

```javascript
// api.js
class CertificateAPI {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
  }

  async generateCertificate(layoutId, data) {
    try {
      const response = await fetch(`${this.baseURL}/certificates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layoutId, data }),
      });

      if (!response.ok) throw new Error('Failed to generate certificate');

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Certificate generation error:', error);
      throw error;
    }
  }

  downloadCertificate(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'certificate.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Usage in component
async function handleGenerateCertificate(event) {
  event.preventDefault();

  const layoutId = document.getElementById('layoutId').value;
  const name = document.getElementById('name').value;
  const eventName = document.getElementById('eventName').value;
  const date = document.getElementById('date').value;

  try {
    const api = new CertificateAPI();
    const blob = await api.generateCertificate(layoutId, {
      Name: name,
      EventName: eventName,
      Date: date,
    });

    api.downloadCertificate(blob, `certificate_${name}.pdf`);
    alert('Certificate generated successfully!');
  } catch (error) {
    alert('Failed to generate certificate: ' + error.message);
  }
}
```

### Server-Side Certificate Generation (Express.js)

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.post('/api/v1/generate-bulk-certificates', async (req, res) => {
  const { layoutId, recipients } = req.body;
  const CERT_API_URL = 'http://localhost:3001/api';

  try {
    const results = await Promise.all(
      recipients.map((recipient) =>
        axios.post(
          `${CERT_API_URL}/certificates/generate`,
          { layoutId, data: recipient },
          { responseType: 'blob' }
        )
      )
    );

    res.json({
      success: true,
      generated: results.length,
      message: 'Certificates generated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

---

## Error Handling Examples

### Validation Errors

**Request:**
```http
POST http://localhost:3001/api/certificates/generate
Content-Type: application/json

{
  "layoutId": "LAY_8f9a0b1c",
  "data": {}
}
```

**Response:**
```json
{
  "success": false,
  "message": "Data must be a non-empty object",
  "error": "Data must be a non-empty object"
}
```

### Layout Not Found

**Request:**
```http
POST http://localhost:3001/api/certificates/generate
Content-Type: application/json

{
  "layoutId": "NONEXISTENT",
  "data": {
    "Name": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": false,
  "message": "Layout not found: NONEXISTENT",
  "error": "Layout not found: NONEXISTENT"
}
```

### Layout Not Confirmed

**Request:**
```http
POST http://localhost:3001/api/certificates/generate
Content-Type: application/json

{
  "layoutId": "LAY_draft123",
  "data": {
    "Name": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": false,
  "message": "Layout is not confirmed. Please confirm the layout first.",
  "error": "Layout is not confirmed. Please confirm the layout first."
}
```

---

## Integration Checklist

- [ ] Backend is running on port 3001
- [ ] Layout has been created and confirmed
- [ ] Template image has been uploaded
- [ ] All required fonts have been uploaded
- [ ] All required fields are defined in layout
- [ ] Certificate data keys match field names exactly
- [ ] CORS is configured correctly
- [ ] Error handling is implemented
- [ ] Rate limiting is considered for batch operations
- [ ] PDF files are being saved correctly

## Performance Optimization Tips

1. **Batch Operations**: Use Promise.all() for parallel certificate generation
2. **Connection Pooling**: Use persistent HTTP connections
3. **Caching**: Cache layout configurations on client-side
4. **Compression**: Enable gzip compression on server
5. **CDN**: Serve template images from CDN for faster loading
6. **Rate Limiting**: Implement rate limiting on API endpoints

## Health Check Endpoint

**Request:**
```http
GET http://localhost:3001/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-01T14:45:30.000Z",
  "environment": "development"
}
```
