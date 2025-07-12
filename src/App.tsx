import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import FileVerification from './components/FileVerification';
import AuditTrail from './components/AuditTrail';
import BlockchainConnection from './components/BlockchainConnection';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#42a5f5',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Header />
        <Container maxWidth="lg">
          <Box sx={{ mt: 4, mb: 4 }}>
            <BlockchainConnection />
            <FileUpload />
            <FileVerification />
            <AuditTrail />
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
