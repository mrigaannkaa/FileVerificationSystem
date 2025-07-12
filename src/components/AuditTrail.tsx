import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  History,
  Refresh,
  ContentCopy,
  Search,
  Description,
  AccessTime,
  Fingerprint,
} from '@mui/icons-material';
import axios from 'axios';

interface FileRecord {
  id: string;
  originalName: string;
  fileHash: string;
  ipfsHash: string;
  description: string;
  uploadTime: string;
  size: number;
  mimetype: string;
}

const AuditTrail: React.FC = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<FileRecord[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    // Filter files based on search term
    if (searchTerm.trim() === '') {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter(file =>
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.fileHash.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [files, searchTerm]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/files');
      
      if (response.data.success) {
        setFiles(response.data.data || []);
      } else {
        throw new Error('Failed to load files');
      }
    } catch (error: any) {
      console.error('Error loading files:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load audit trail');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatHash = (hash: string): string => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const getMimeTypeIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📊';
    if (mimetype.includes('zip') || mimetype.includes('compressed')) return '🗜️';
    return '📎';
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            <History sx={{ mr: 1 }} />
            Audit Trail & File Registry
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadFiles}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete audit trail of all files registered in the blockchain system. 
          Each entry represents an immutable record of file integrity.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by filename, description, or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
                {searchTerm && ` (filtered from ${files.length} total)`}
              </Typography>
              
              {filteredFiles.length > 0 && (
                <Chip 
                  label="Blockchain Verified" 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                />
              )}
            </Box>

            {filteredFiles.length === 0 ? (
              <Alert severity="info">
                {files.length === 0 
                  ? 'No files have been uploaded yet. Upload a file to see it appear in the audit trail.'
                  : 'No files match your search criteria. Try a different search term.'
                }
              </Alert>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>File</TableCell>
                      <TableCell>Hash</TableCell>
                      <TableCell>IPFS</TableCell>
                      <TableCell>Upload Time</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFiles.map((file) => (
                      <TableRow key={file.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 2, fontSize: '1.2em' }}>
                              {getMimeTypeIcon(file.mimetype)}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {file.originalName}
                              </Typography>
                              {file.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {file.description.length > 50 
                                    ? `${file.description.substring(0, 50)}...` 
                                    : file.description
                                  }
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace', 
                                fontSize: '0.8em',
                                mr: 1
                              }}
                            >
                              {formatHash(file.fileHash)}
                            </Typography>
                            <Tooltip title="Copy full hash">
                              <IconButton 
                                size="small" 
                                onClick={() => copyToClipboard(file.fileHash)}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace', 
                                fontSize: '0.8em',
                                mr: 1
                              }}
                            >
                              {formatHash(file.ipfsHash)}
                            </Typography>
                            <Tooltip title="Copy IPFS hash">
                              <IconButton 
                                size="small" 
                                onClick={() => copyToClipboard(file.ipfsHash)}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {new Date(file.uploadTime).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(file.uploadTime).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {formatFileSize(file.size)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Description fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Verify Hash">
                              <IconButton size="small">
                                <Fingerprint fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>About the Audit Trail:</strong> This table shows all files that have been 
              registered in the blockchain system. Each entry represents an immutable record that 
              cannot be altered or deleted, providing complete transparency and traceability.
            </Typography>
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AuditTrail;
