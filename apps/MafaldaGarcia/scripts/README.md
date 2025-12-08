# Development Scripts

This directory contains development scripts for the Mafalda Garcia portfolio website.

## Available Scripts

### `check-images.js`

A development script to check the status of images in Firebase Storage.

**Usage:**

```bash
npm run check-images
```

**What it does:**

- Scans Firebase Storage for available images
- Compares with required images for the website
- Shows which images are missing
- Displays coverage statistics
- Tests image URL generation
- Lists extra images in storage

**Output example:**

```
🔍 Checking Firebase Storage for available images...

📊 IMAGE STATUS REPORT
======================

📁 Total images in Firebase Storage: 8
📋 Required images for website: 16

🔍 CHECKING REQUIRED IMAGES:
============================
01. ✅ hero.jpg
02. ❌ canvas.jpg
03. ✅ connecting-souls.jpg
...

📈 SUMMARY:
===========
✅ Found: 8 images
❌ Missing: 8 images
📊 Coverage: 50%

📝 MISSING IMAGES TO UPLOAD:
============================
1. canvas.jpg
2. yus-esate.jpg
...
```

**When to use:**

- After uploading new images to Firebase Storage
- Before deploying to check image coverage
- During development to verify image setup
- To get a quick overview of what's missing
