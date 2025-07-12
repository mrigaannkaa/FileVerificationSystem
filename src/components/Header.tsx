import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Security,
  GitHub,
  Info,
} from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Security sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SecureFile - Blockchain File Integrity System
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label="Ethereum" 
            color="secondary" 
            variant="outlined"
            size="small"
          />
          <Chip 
            label="IPFS" 
            color="secondary" 
            variant="outlined"
            size="small"
          />
          <Chip 
            label="SHA-256" 
            color="secondary" 
            variant="outlined"
            size="small"
          />
          
          <Tooltip title="View on GitHub">
            <IconButton 
              color="inherit" 
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <GitHub />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="About this project">
            <IconButton color="inherit">
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
