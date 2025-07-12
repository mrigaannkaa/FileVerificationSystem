# 🚀 SecureFile - Quick Start Guide

## How to Run This Project

### Prerequisites
- Node.js 18+ installed
- Two terminal windows

### Step-by-Step Instructions

#### 1️⃣ Start Backend Server
Open **Terminal 1** and run:
```powershell
cd backend
npm start
```
✅ Wait for: `🚀 File Integrity API Server running on port 5000`

#### 2️⃣ Start Frontend Server  
Open **Terminal 2** and run:
```powershell
npm run dev
```
✅ Wait for: `Local: http://localhost:5174/`

#### 3️⃣ Open the Application
Open your browser and go to: **http://localhost:5174/**

---

## 🎯 How to Demo the System

### Basic Flow:
1. **Upload a File**: Use the `demo-document.txt` file
   - Click "Choose File" → Select the demo document
   - Add description: "Test file for demonstration"
   - Click "Upload & Secure File"
   - **Important**: Copy and save the SHA-256 hash shown!

2. **Verify the Same File**: 
   - Go to "File Verification" tab
   - Select the same `demo-document.txt` file
   - Click "Verify File Integrity"
   - **Result**: ✅ "File is valid and matches blockchain record"

3. **Test Tampering Detection**:
   - Open `demo-document.txt` in notepad
   - Add some text (like "TAMPERED!") anywhere
   - Save as a new file (e.g., `demo-modified.txt`)
   - Try to verify this modified file
   - **Result**: ❌ "File has been tampered with or doesn't exist"

4. **Verify by Hash Only**:
   - Switch to "Verify by Hash" tab
   - Paste the SHA-256 hash you saved from step 1
   - Click "Verify Hash"
   - **Result**: Shows original file details from blockchain

5. **Check Audit Trail**:
   - Navigate to "Audit Trail" tab
   - View complete history of all operations

---

## 🛑 How to Stop
Press `Ctrl + C` in both terminal windows

---

## 🔧 If Something Goes Wrong

**Backend won't start?**
```powershell
cd backend
npm install
npm start
```

**Frontend won't start?**
```powershell
npm install  
npm run dev
```

**Different port?** Frontend will auto-find next available port (5175, 5176, etc.)

---

## 🏗️ What This System Does
- **Secures files** using SHA-256 cryptographic hashing
- **Stores integrity data** on simulated blockchain  
- **Detects tampering** instantly when files are modified
- **Provides audit trail** of all file operations
- **Enterprise-ready** blockchain file integrity solution

Your secure file verification system is ready to run! 🔒
