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
  Paper,
  Chip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  VerifiedUser,
  CloudUpload,
  Fingerprint,
  CheckCircle,
  Error,
  Info,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`verification-tabpanel-${index}`}
      aria-labelledby={`verification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface VerificationResult {
  isValid: boolean;
  message: string;
  data?: {
    id: string;
    originalName: string;
    fileHash: string;
    uploadTime: string;
    description: string;
  };
  calculatedHash?: string;
}

const FileVerification: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedFile(null);
    setHashInput('');
    setVerificationResult(null);
    setError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setVerificationResult(null);
    setError(null);
  };

  const calculateFileHash = async (file: File): Promise<string> => {
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

  const verifyFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:5000/api/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setVerificationResult(response.data);

    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to verify file');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyByHash = async () => {
    if (!hashInput.trim()) {
      setError('Please enter a file hash');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/verify-hash', {
        fileHash: hashInput.trim()
      });

      setVerificationResult(response.data);

    } catch (error: any) {
      console.error('Hash verification error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to verify hash');
    } finally {
      setIsVerifying(false);
    }
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
          <VerifiedUser sx={{ mr: 1 }} />
          File Integrity Verification
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verify file integrity by uploading the file or entering its hash. 
          The system will check if the file exists in the blockchain and hasn't been tampered with.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="verification methods">
            <Tab label="Upload File" icon={<CloudUpload />} />
            <Tab label="Enter Hash" icon={<Fingerprint />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              size="large"
            >
              Choose File to Verify
              <VisuallyHiddenInput
                type="file"
                onChange={handleFileSelect}
              />
            </Button>

            {selectedFile && (
              <Paper sx={{ p: 2 }}>
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

            <Button
              variant="contained"
              onClick={verifyFileUpload}
              disabled={!selectedFile || isVerifying}
              startIcon={isVerifying ? <CircularProgress size={20} /> : <VerifiedUser />}
              size="large"
            >
              {isVerifying ? 'Verifying...' : 'Verify File Integrity'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="File Hash (SHA-256)"
              placeholder="Enter the SHA-256 hash of the file..."
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              multiline
              rows={3}
              sx={{ fontFamily: 'monospace' }}
              helperText="Paste the SHA-256 hash you want to verify against the blockchain records"
            />

            <Button
              variant="contained"
              onClick={verifyByHash}
              disabled={!hashInput.trim() || isVerifying}
              startIcon={isVerifying ? <CircularProgress size={20} /> : <Fingerprint />}
              size="large"
            >
              {isVerifying ? 'Verifying...' : 'Verify Hash'}
            </Button>
          </Box>
        </TabPanel>

        {verificationResult && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Alert 
              severity={verificationResult.isValid ? 'success' : 'warning'} 
              sx={{ mb: 2 }}
              icon={verificationResult.isValid ? <CheckCircle /> : <Error />}
            >
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {verificationResult.isValid ? '✅ File Integrity Verified' : '⚠️ File Not Found or Tampered'}
              </Typography>
              <Typography variant="body2">
                {verificationResult.message}
              </Typography>
            </Alert>

            {verificationResult.isValid && verificationResult.data ? (
              <Paper sx={{ p: 3, bgcolor: 'success.50' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  Verification Details
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Original File Name:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {verificationResult.data.originalName}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Upload Time:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {new Date(verificationResult.data.uploadTime).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Verified Hash:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        bgcolor: 'grey.100', 
                        p: 1, 
                        borderRadius: 1,
                        wordBreak: 'break-all',
                        mt: 0.5
                      }}
                    >
                      {verificationResult.data.fileHash}
                    </Typography>
                  </Box>

                  {verificationResult.data.description && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Description:
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {verificationResult.data.description}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Chip label="Authentic" color="success" variant="filled" sx={{ mr: 1 }} />
                    <Chip label="Unmodified" color="success" variant="filled" sx={{ mr: 1 }} />
                    <Chip label="Blockchain Verified" color="primary" variant="filled" />
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, bgcolor: 'warning.50' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Error color="warning" sx={{ mr: 1 }} />
                  Verification Failed
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      This could mean:
                    </Typography>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>The file has been modified or corrupted</li>
                      <li>The file was never uploaded to our system</li>
                      <li>The hash doesn't match any recorded files</li>
                    </ul>
                  </Alert>

                  {verificationResult.calculatedHash && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Calculated Hash:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          bgcolor: 'grey.100', 
                          p: 1, 
                          borderRadius: 1,
                          wordBreak: 'break-all',
                          mt: 0.5
                        }}
                      >
                        {verificationResult.calculatedHash}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Chip label="Unverified" color="warning" variant="filled" sx={{ mr: 1 }} />
                    <Chip label="Not Found" color="error" variant="outlined" />
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Alert severity="info" icon={<Info />}>
            <Typography variant="body2">
              <strong>How it works:</strong> File verification compares the SHA-256 hash of your file 
              against hashes stored on the blockchain. If the hash matches, your file is authentic and unmodified. 
              If not, the file may have been tampered with or was never registered in our system.
            </Typography>
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileVerification;
