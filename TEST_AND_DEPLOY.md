# Certificate Generator - Quick Start Guide

## ✅ Completed Features

### 1. Authentication & Login
- **Login Page**: Beautiful blue-themed login interface
- **Credentials**: Demo mode - enter ANY username and password
- **Features**:
  - Token stored in localStorage
  - Protected routes (redirects to login if not authenticated)
  - Logout button in sidebar

### 2. Predefined Fields
- Select only from these fields: **Name**, **Event**, **College**, **Class**, **Year**
- Check/uncheck to add/remove fields
- No custom field creation

### 3. Layout Management
- **Event Name**: Used as layout identifier
- **Save/Update**: Create or update layouts
- **Confirm & Lock**: Lock layout for certificate generation
- **Status**: Shows Draft or Confirmed status

### 4. Adaptive Font Sizing
Applied during certificate generation:
- **Name Field**: 
  - Max 35 characters before reduction
  - Reduces by 1.2px per character over limit
  - Minimum size: 18px
- **College Field**:
  - 40-49 chars: Reduces by 0.8px per char, min 18px
  - 49-60 chars: Reduces by 0.8px per char, min 14px
  - 60-70 chars: Reduces by 1.2px per char, min 11px
  - 70+ chars: Reduces by 0.8px per char, min 9px
- **Other Fields**: Fixed size from layout

### 5. UI Styling
- **Login Page**: Blue gradient background (#1e3a8a to #2563eb)
- **Card Border**: 2px solid blue border with glow effect
- **Button Colors**: Blue gradient buttons with hover effects
- **Input Fields**: Light blue backgrounds with blue focus borders

---

## 🚀 Testing Instructions

### Step 1: Start Servers
```bash
# Terminal 1: Backend
cd d:\Certificate-generator\backend
npm run dev

# Terminal 2: Frontend
cd d:\Certificate-generator\frontend
npm start
```

### Step 2: Login
1. Navigate to `http://localhost:3000`
2. Enter any username (e.g., "admin")
3. Enter any password (e.g., "password123")
4. Click "Sign In"

### Step 3: Create Certificate Layout
1. **Upload Template**: Choose PDF, PNG, or JPG
2. **Upload Fonts**: (Optional) Add TTF font files
3. **Event Name**: Enter event name (e.g., "Annual Awards 2024")
4. **Select Fields**: Check Name, College (to test adaptive sizing)
5. **Position Fields**: Drag textboxes on canvas
6. **Adjust Font Sizes**: Edit sizes in sidebar
7. **Save Layout**: Click "Save Layout"
8. **Confirm & Lock**: Click "Confirm & Lock" (turns green)

### Step 4: Generate Certificate
```bash
# Use the API endpoint
POST http://localhost:3001/api/certificates/generate
Content-Type: application/json

{
  "layoutId": "LAY_xxxxx",
  "data": {
    "Name": "VeryLongNameWithManyCharactersThatWillBeAdjusted",
    "Event": "Annual Awards 2024",
    "College": "University of Technology and Engineering Sciences",
    "Class": "2024",
    "Year": "2024"
  }
}
```

### Expected Results
- **Name field** with 50+ chars → font size automatically reduces
- **College field** with 50+ chars → font size reduces based on length ranges
- **Other fields** → maintain fixed size
- **PDF Generated** with proper text overlay at saved coordinates

---

## 📁 Key Files Modified

### Frontend
- `src/context/AuthContext.tsx` - Authentication state
- `src/pages/Login.tsx` - Login page
- `src/pages/Login.css` - Blue theme styling
- `src/components/ProtectedRoute.tsx` - Route protection
- `src/pages/LayoutEditor.tsx` - Predefined fields UI
- `src/types/index.ts` - Added layoutName property

### Backend
- `src/routes/authRoutes.ts` - Auth endpoint
- `src/app.ts` - Auth routes registration
- `src/utils/pdfGenerator.ts` - Adaptive font sizing logic
- `src/types/index.ts` - Added layoutName to Layout interface

---

## 💡 Logic Implementation

### Adaptive Font Size Function
```typescript
// Name field: Reduces by 1.2px per character over 35-char limit
// College field: Uses tiered reduction based on length:
//   - 40-49 chars: 0.8px reduction per char
//   - 49-60 chars: 0.8px reduction per char (more aggressive with lower base)
//   - 60-70 chars: 1.2px reduction per char
//   - 70+ chars: 0.8px reduction per char

calculateAdaptiveFontSize(fieldName, text, baseFontSize)
```

---

## ✅ What Works
- ✅ Login with demo credentials
- ✅ Protected routes
- ✅ Predefined fields selection
- ✅ Event name as layout identifier
- ✅ Template upload (PDF, PNG, JPG)
- ✅ Font upload (TTF)
- ✅ Field positioning on canvas
- ✅ Layout save/update/confirm
- ✅ Adaptive font sizing for Name and College
- ✅ Certificate generation with text overlay
- ✅ Blue theme with attractive styling

---

## 🎨 UI Improvements
- Blue gradient login background
- Card with blue border and glow effect
- Blue input focus states
- Blue gradient buttons
- Responsive design
- Smooth animations
- Professional appearance

---

## 🔧 Troubleshooting

### Port 3001 already in use
```bash
Get-Process node | Stop-Process -Force
# or
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Port 3000 already in use
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module not found
```bash
cd frontend && npm install
cd ../backend && npm install
```

---

## 📝 Notes
- Demo login accepts any non-empty credentials
- For production, implement real authentication
- Custom fonts (TTF) are applied to all fields when set
- Adaptive sizing only applies to Name and College fields
- Other fields maintain their configured size

