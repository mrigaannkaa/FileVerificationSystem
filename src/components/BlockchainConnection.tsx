import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Link,
  LinkOff,
} from '@mui/icons-material';
import { ethers } from 'ethers';

interface BlockchainConnectionProps {}

const BlockchainConnection: React.FC<BlockchainConnectionProps> = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setIsConnected(true);
          
          const network = await provider.getNetwork();
          setNetworkInfo({
            name: network.name,
            chainId: network.chainId.toString(),
          });
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      setIsConnected(true);
      
      const network = await provider.getNetwork();
      setNetworkInfo({
        name: network.name,
        chainId: network.chainId.toString(),
      });

    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setNetworkInfo(null);
    setError(null);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceWallet sx={{ mr: 1 }} />
          Blockchain Connection
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isConnected ? (
                <>
                  <Chip
                    icon={<Link />}
                    label="Connected"
                    color="success"
                    variant="filled"
                  />
                  <Typography variant="body2">
                    Account: {account && formatAddress(account)}
                  </Typography>
                </>
              ) : (
                <Chip
                  icon={<LinkOff />}
                  label="Not Connected"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isConnected ? (
                <>
                  {networkInfo && (
                    <Chip
                      label={`${networkInfo.name} (${networkInfo.chainId})`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={disconnectWallet}
                    size="small"
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={connectWallet}
                  disabled={isConnecting}
                  startIcon={isConnecting ? <CircularProgress size={20} /> : <AccountBalanceWallet />}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {isConnected && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              🎉 Wallet connected successfully! You can now upload files and store their hashes on the blockchain.
            </Typography>
          </Alert>
        )}

        {!isConnected && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ⚠️ Please connect your wallet to interact with the blockchain features. 
              Make sure you have MetaMask installed and are connected to a supported network.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockchainConnection;
