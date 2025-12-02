# Git Push Instructions

## Step 1: Add Files
```bash
cd d:\Certificate-generator
git add .
```

## Step 2: Configure Git (if not done)
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 3: Create Initial Commit
```bash
git commit -m "Initial commit: Certificate Generator with Test Page

- Added comprehensive layout editor with drag-drop interface
- Implemented authentication system with 3 demo users
- Created certificate generation API with adaptive font sizing
- Added admin test page for certificate preview
- Implemented custom font support (TTF)
- Added smart file naming (EventName_PersonName.pdf)
- Updated complete documentation and README
- Features: Layout management, field positioning, PDF generation"
```

## Step 4: Add Remote Repository
```bash
# If repository doesn't exist, create it on GitHub first
# Then add the remote:
git remote add origin https://github.com/Surya0265/Certificate-generator.git
```

## Step 5: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## Alternative: If Already Have Repository
```bash
git push origin master
```

## Verify Push
```bash
git log --oneline
git remote -v
```

## What Gets Pushed
✅ Backend (Node.js/Express/TypeScript)
✅ Frontend (React/TypeScript)
✅ Configuration files (.gitignore, package.json, tsconfig.json)
✅ Documentation (README.md, TEST_PAGE_GUIDE.md)
✅ All source code

## What Gets Ignored
❌ node_modules/ (excluded by .gitignore)
❌ build/ (excluded by .gitignore)
❌ dist/ (excluded by .gitignore)
❌ .env files (excluded by .gitignore)
❌ Logs (excluded by .gitignore)

---

Run these commands in PowerShell/Command Prompt from the project root directory.
