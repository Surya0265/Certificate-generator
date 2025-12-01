# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment

**Backend** (create `backend/.env`):
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (already configured in `.env.development`):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Step 3: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
╔══════════════════════════════════════════════════════════╗
║   Certificate Microservice - Running                    ║
╚══════════════════════════════════════════════════════════╝
    
  Environment: development
  Server:      http://localhost:3001
  Health:      http://localhost:3001/health
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Expected output:
```
Local:            http://localhost:3000
```

### Step 4: Create Your First Certificate

1. Open http://localhost:3000 in your browser
2. Upload a certificate template image (PNG/JPG)
3. Optionally upload a custom font (TTF)
4. Click "Add Field" to add dynamic text fields:
   - Name
   - EventName
   - Date
5. Position each field by dragging on the canvas
6. Click "Save Layout"
7. Click "Confirm & Lock" to finalize

### Step 5: Generate Your First Certificate

**Using cURL:**
```bash
curl -X POST http://localhost:3001/api/certificates/generate \
  -H "Content-Type: application/json" \
  -d '{
    "layoutId": "LAY_a1b2c3d4",
    "data": {
      "Name": "John Doe",
      "EventName": "AI Expo 2025",
      "Date": "December 1, 2025"
    }
  }' \
  --output certificate.pdf
```

**Using Postman:**
1. Create a new POST request to: `http://localhost:3001/api/certificates/generate`
2. Set header: `Content-Type: application/json`
3. Set body:
```json
{
  "layoutId": "LAY_a1b2c3d4",
  "data": {
    "Name": "Jane Smith",
    "EventName": "Hackathon 2025",
    "Date": "December 2, 2025"
  }
}
```
4. Send and download the PDF

---

## 📂 Data Directory Structure

After running the application, your data directory should look like:

```
data/
├── layouts/
│   ├── LAY_a1b2c3d4.json
│   └── LAY_example.json
├── uploads/
│   ├── templates/
│   │   ├── 550e8400-e29b.png
│   │   └── 123e4567-e89b.jpg
│   └── fonts/
│       ├── Roboto-Bold.ttf
│       └── Arial.ttf
└── certificates/
    ├── cert_550e8400.pdf
    └── cert_123e4567.pdf
```

---

## 🧪 Test with Sample Data

### Sample Certificate Template Sizes

For best results, use templates with these dimensions:
- **Width**: 800px - 1200px
- **Height**: 600px - 900px

### Sample Test Data

```json
{
  "layoutId": "LAY_test001",
  "data": {
    "Name": "Alice Johnson",
    "EventName": "Annual Tech Conference 2025",
    "Date": "December 1, 2025"
  }
}
```

---

## 🔍 API Testing Endpoints

### Health Check
```
GET http://localhost:3001/health
```

### List All Layouts
```
GET http://localhost:3001/api/layouts
```

### Get Specific Layout
```
GET http://localhost:3001/api/layouts/LAY_a1b2c3d4
```

---

## ✅ Verification Checklist

After startup:

- [ ] Backend running on http://localhost:3001
- [ ] Frontend accessible on http://localhost:3000
- [ ] `/health` endpoint returns status OK
- [ ] Can upload template image
- [ ] Can add fields to template
- [ ] Can save layout configuration
- [ ] Can confirm layout
- [ ] Can generate certificate via API
- [ ] PDF certificate is generated successfully

---

## 🐛 Common Issues & Solutions

### Issue: "Port 3001 already in use"
**Solution:** Change PORT in .env to 3002 or kill process using port 3001

### Issue: CORS errors
**Solution:** Ensure CORS_ORIGIN in backend .env matches frontend URL

### Issue: Template image not showing
**Solution:** Check image file exists and refresh browser page

### Issue: Certificate generation fails
**Solution:** 
1. Verify layout is confirmed
2. Check template file exists in `data/uploads/templates/`
3. Verify all fonts are uploaded

### Issue: Font not applied to PDF
**Solution:**
1. Ensure font is uploaded as TTF
2. Check font name matches in layout JSON
3. Verify font file path is correct

---

## 📚 Next Steps

1. **Read Full Documentation**: See `README.md`
2. **Explore API Examples**: See `API_EXAMPLES.md`
3. **Integrate with Main Website**: Use examples from `API_EXAMPLES.md`
4. **Deploy to Production**: Follow deployment section in README.md
5. **Customize UI**: Modify React components in `frontend/src/`

---

## 💡 Pro Tips

1. **Use Postman for API Testing**: Import endpoints for easy testing
2. **Save Layout IDs**: Keep track of confirmed layout IDs for production
3. **Batch Generation**: Use Python or Node.js scripts for bulk certificates
4. **Version Control**: Backup `data/layouts/` JSON files regularly
5. **Monitor File Sizes**: Check `data/certificates/` periodically

---

## 🆘 Getting Help

If you encounter issues:

1. Check logs in terminal for error messages
2. Verify all ports are available
3. Ensure all files uploaded successfully
4. Check file permissions on `data/` directory
5. Clear browser cache if UI issues occur
6. Review error response from API endpoints

---

## 📞 Support

For detailed documentation and advanced configurations, refer to:
- Backend API: See `API_EXAMPLES.md`
- Frontend Components: See `frontend/src/README.md` (if created)
- Database Schema: File-based JSON in `data/layouts/`
