import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Security,
  CheckCircle,
  ContentCopy,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface UploadResult {
  id: string;
  originalName: string;
  fileHash: string;
  ipfsHash: string;
  description: string;
  uploadTime: string;
  size: number;
}

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Select File',
    'Calculate Hash',
    'Store on IPFS',
    'Record on Blockchain'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadResult(null);
    setError(null);
    setActiveStep(0);
  };

  const calculateClientSideHash = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
          const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
          resolve(hash);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setActiveStep(0);

    try {
      // Step 1: File selected
      setActiveStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Calculate hash
      setActiveStep(2);
      await calculateClientSideHash(selectedFile);
      
      // Step 3: Upload to backend (simulates IPFS)
      setActiveStep(3);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description);

      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUploadResult(response.data.data);
        setActiveStep(4);
        
        // Here you would typically also store on blockchain
        // For demo purposes, we'll simulate this step
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to upload file');
      setActiveStep(0);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CloudUpload sx={{ mr: 1 }} />
          Upload & Secure File
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 3 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mr: 2, mb: 2 }}
                size="large"
              >
                Choose File
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleFileSelect}
                />
              </Button>

              {selectedFile && (
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Selected File:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Size: {formatFileSize(selectedFile.size)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {selectedFile.type || 'Unknown'}
                  </Typography>
                </Paper>
              )}
            </Box>

            <TextField
              fullWidth
              label="File Description (Optional)"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose or contents of this file..."
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              startIcon={isUploading ? <CircularProgress size={20} /> : <Security />}
              size="large"
              fullWidth
            >
              {isUploading ? 'Securing File...' : 'Upload & Secure File'}
            </Button>
          </Box>

          <Box sx={{ flex: 1 }}>
            {(isUploading || uploadResult) && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Process Status
                </Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>
                        {label}
                        {index === 1 && activeStep > 1 && (
                          <Chip label="SHA-256" size="small" sx={{ ml: 1 }} />
                        )}
                        {index === 2 && activeStep > 2 && (
                          <Chip label="Distributed" size="small" sx={{ ml: 1 }} />
                        )}
                        {index === 3 && activeStep > 3 && (
                          <Chip label="Immutable" size="small" sx={{ ml: 1 }} />
                        )}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}
          </Box>
        </Box>

        {uploadResult && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                🎉 File secured successfully!
              </Typography>
              <Typography variant="body2">
                Your file has been hashed and its integrity can now be verified using the blockchain.
              </Typography>
            </Alert>

            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                File Security Details
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      File Name:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                      {uploadResult.originalName}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Upload Time:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                      {new Date(uploadResult.uploadTime).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    SHA-256 Hash:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        bgcolor: 'grey.100', 
                        p: 1, 
                        borderRadius: 1,
                        wordBreak: 'break-all',
                        flexGrow: 1
                      }}
                    >
                      {uploadResult.fileHash}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => copyToClipboard(uploadResult.fileHash)}
                      sx={{ ml: 1 }}
                    >
                      <ContentCopy fontSize="small" />
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    IPFS Hash:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        bgcolor: 'grey.100', 
                        p: 1, 
                        borderRadius: 1,
                        wordBreak: 'break-all',
                        flexGrow: 1
                      }}
                    >
                      {uploadResult.ipfsHash}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => copyToClipboard(uploadResult.ipfsHash)}
                      sx={{ ml: 1 }}
                    >
                      <ContentCopy fontSize="small" />
                    </Button>
                  </Box>
                </Box>

                {uploadResult.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Description:
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {uploadResult.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
