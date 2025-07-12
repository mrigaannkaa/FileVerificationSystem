# Demo: How to Test File Integrity System

## Quick Demo Guide

### 1. Upload a Test File
1. Start the application (frontend and backend)
2. Create a test file: `echo "This is a test document for verification" > test.txt`
3. Upload this file through the interface
4. Note down the SHA-256 hash displayed

### 2. Verify Original File
1. Use the verification tab
2. Upload the same `test.txt` file
3. ✅ Should show "File Integrity Verified"

### 3. Test Tampering Detection
1. Modify the test file: `echo "This is a MODIFIED test document" > test.txt`
2. Try to verify this modified file
3. ❌ Should show "File Not Found or Tampered"

### 4. Hash-Only Verification
1. Copy the original hash from step 1
2. Use "Enter Hash" tab
3. Paste the hash and verify
4. ✅ Should find the original file record

## Sample Test Files

### Create these test files for comprehensive testing:

```bash
# Document file
echo "Important legal contract - Version 1.0" > contract.txt

# PDF simulation (text file)
echo "Academic Certificate - John Doe - Computer Science Degree - 2025" > certificate.txt

# Image simulation (text file)
echo "Medical scan data - Patient ID: 12345 - Date: 2025-07-12" > medical_record.txt
```

## Expected Behaviors

### ✅ Valid Scenarios
- Upload original file → Get hash
- Verify same file → Success
- Verify by correct hash → Success
- View in audit trail → Shows record

### ❌ Invalid Scenarios
- Verify modified file → Failure
- Verify with wrong hash → Not found
- Upload different file with same name → Different hash

## Production Testing

For production testing, try with:
- PDF documents
- Image files
- Word documents
- Large files (up to 10MB)
- Various file types

## Blockchain Integration

Once smart contracts are deployed:
1. Files will be recorded on blockchain
2. Verification will check blockchain records
3. Immutable audit trail on Ethereum
4. Gas fees for upload transactions
