import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp prefix
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for demonstration
    cb(null, true);
  }
});

// In-memory storage for demonstration (use database in production)
const fileRecords = new Map();

/**
 * Calculate SHA-256 hash of a file
 */
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Simulate IPFS upload (in production, use actual IPFS client)
 */
function simulateIPFSUpload(filename) {
  // Generate a mock IPFS hash
  const mockHash = crypto.createHash('sha1').update(filename + Date.now()).digest('hex');
  return `Qm${mockHash.substring(0, 44)}`;
}

// Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'File Integrity API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Upload file and calculate hash
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { description = '' } = req.body;
    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // Calculate file hash
    const fileHash = await calculateFileHash(filePath);
    
    // Simulate IPFS upload
    const ipfsHash = simulateIPFSUpload(originalName);

    // Store file record
    const fileRecord = {
      id: Date.now().toString(),
      originalName,
      filePath,
      fileHash,
      ipfsHash,
      description,
      uploadTime: new Date().toISOString(),
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    fileRecords.set(fileRecord.id, fileRecord);

    // Prepare response (don't include full file path for security)
    const response = {
      id: fileRecord.id,
      originalName: fileRecord.originalName,
      fileHash: fileRecord.fileHash,
      ipfsHash: fileRecord.ipfsHash,
      description: fileRecord.description,
      uploadTime: fileRecord.uploadTime,
      size: fileRecord.size,
      mimetype: fileRecord.mimetype
    };

    res.json({
      success: true,
      message: 'File uploaded and hashed successfully',
      data: response
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process file upload',
      details: error.message 
    });
  }
});

/**
 * Verify file integrity by comparing hashes
 */
app.post('/api/verify', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided for verification' });
    }

    const filePath = req.file.path;
    
    // Calculate hash of uploaded file
    const calculatedHash = await calculateFileHash(filePath);
    
    // Clean up temporary file
    fs.unlinkSync(filePath);

    // Find matching record
    const matchingRecord = Array.from(fileRecords.values())
      .find(record => record.fileHash === calculatedHash);

    if (matchingRecord) {
      res.json({
        success: true,
        isValid: true,
        message: 'File integrity verified successfully',
        data: {
          id: matchingRecord.id,
          originalName: matchingRecord.originalName,
          fileHash: matchingRecord.fileHash,
          uploadTime: matchingRecord.uploadTime,
          description: matchingRecord.description
        }
      });
    } else {
      res.json({
        success: true,
        isValid: false,
        message: 'File not found or has been tampered with',
        calculatedHash
      });
    }

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify file',
      details: error.message 
    });
  }
});

/**
 * Verify file by hash only (no file upload required)
 */
app.post('/api/verify-hash', (req, res) => {
  try {
    const { fileHash } = req.body;

    if (!fileHash) {
      return res.status(400).json({ error: 'File hash is required' });
    }

    // Find matching record
    const matchingRecord = Array.from(fileRecords.values())
      .find(record => record.fileHash === fileHash);

    if (matchingRecord) {
      res.json({
        success: true,
        isValid: true,
        message: 'File hash found in records',
        data: {
          id: matchingRecord.id,
          originalName: matchingRecord.originalName,
          fileHash: matchingRecord.fileHash,
          uploadTime: matchingRecord.uploadTime,
          description: matchingRecord.description
        }
      });
    } else {
      res.json({
        success: true,
        isValid: false,
        message: 'File hash not found in records'
      });
    }

  } catch (error) {
    console.error('Hash verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify hash',
      details: error.message 
    });
  }
});

/**
 * Get all uploaded files (for audit trail)
 */
app.get('/api/files', (req, res) => {
  try {
    const files = Array.from(fileRecords.values()).map(record => ({
      id: record.id,
      originalName: record.originalName,
      fileHash: record.fileHash,
      ipfsHash: record.ipfsHash,
      description: record.description,
      uploadTime: record.uploadTime,
      size: record.size,
      mimetype: record.mimetype
    }));

    res.json({
      success: true,
      count: files.length,
      data: files
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve files',
      details: error.message 
    });
  }
});

/**
 * Get file by ID
 */
app.get('/api/files/:id', (req, res) => {
  try {
    const { id } = req.params;
    const record = fileRecords.get(id);

    if (!record) {
      return res.status(404).json({ error: 'File not found' });
    }

    const response = {
      id: record.id,
      originalName: record.originalName,
      fileHash: record.fileHash,
      ipfsHash: record.ipfsHash,
      description: record.description,
      uploadTime: record.uploadTime,
      size: record.size,
      mimetype: record.mimetype
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve file',
      details: error.message 
    });
  }
});

/**
 * Calculate hash for any file (utility endpoint)
 */
app.post('/api/calculate-hash', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filePath = req.file.path;
    const fileHash = await calculateFileHash(filePath);
    
    // Clean up temporary file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      fileHash,
      fileName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Hash calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate file hash',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 File Integrity API Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ./uploads`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
