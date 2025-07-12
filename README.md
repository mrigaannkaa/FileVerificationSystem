# SecureFile - Blockchain File Integrity System 🔐

A comprehensive blockchain-based file integrity verification system that ensures data security, authenticity, and non-repudiation using cutting-edge technology.

## 🌟 Key Features

### 🔒 **Tamper-Proof Security**
- SHA-256 cryptographic hashing
- Immutable blockchain storage
- Real-time integrity verification
- Rollback attack prevention

### 🌐 **Decentralized Architecture**
- IPFS integration for distributed storage
- Ethereum blockchain for immutable records
- MetaMask wallet connectivity
- Smart contract automation

### 💻 **Modern User Experience**
- Intuitive drag-and-drop file upload
- Real-time verification feedback
- Comprehensive audit trail
- Responsive Material-UI design

### 🔍 **Advanced Verification**
- File upload verification
- Hash-based verification
- Batch verification support
- Detailed audit logging

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI v5** for modern UI/UX
- **Ethers.js** for blockchain interaction
- **Crypto-JS** for client-side hashing
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **Multer** for file handling
- **SHA-256** hashing algorithm
- **CORS** security configuration
- **RESTful API** design

### Blockchain
- **Solidity** smart contracts
- **Hardhat** development framework
- **Ethereum** blockchain network
- **MetaMask** integration
- **Gas-optimized** operations

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MetaMask browser extension
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/securefile
cd securefile
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Setup Backend
```bash
cd backend
npm install
cd ..
```

### 4. Setup Blockchain
```bash
cd blockchain
npm install
cd ..
```

## 🚀 Running the Application

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

### 2. Start the Frontend
```bash
npm run dev
```
Application runs on `http://localhost:5173`

### 3. Connect MetaMask
1. Install MetaMask browser extension
2. Create/import wallet
3. Connect to localhost network (if using local blockchain)
4. Click "Connect Wallet" in the application

## 📖 Usage Guide

### Uploading Files
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Select File**: Click "Choose File" and select your document
3. **Add Description**: Optionally describe the file purpose
4. **Upload**: Click "Upload & Secure File"
5. **Confirmation**: Receive SHA-256 hash and IPFS hash

### Verifying Files
1. **Choose Method**: Select "Upload File" or "Enter Hash" tab
2. **File Upload**: Upload the file you want to verify
3. **Hash Input**: Or paste the SHA-256 hash directly
4. **Verify**: Click verification button
5. **Results**: View integrity status and original metadata

### Audit Trail
1. **View Records**: All uploaded files appear in the audit trail
2. **Search**: Use the search bar to find specific files
3. **Copy Hashes**: Click copy buttons to copy hash values
4. **Refresh**: Update the list with latest records

## 🎯 Use Cases

### 1. **Document Notarization**
- Legal contracts and agreements
- Academic certificates and diplomas
- Medical records and prescriptions
- Government documents and licenses

### 2. **Legal Contract Submission**
- Court filing systems
- Contract management platforms
- Compliance documentation
- Regulatory submissions

### 3. **Academic Certificate Verification**
- University degree verification
- Professional certification
- Continuing education credits
- Research publication integrity

### 4. **Healthcare Data Transfer**
- Patient record transfers
- Medical imaging verification
- Prescription authenticity
- Clinical trial data integrity

## 🔐 Security Features

### Cryptographic Security
- **SHA-256 Hashing**: Industry-standard cryptographic hashing
- **Blockchain Immutability**: Tamper-proof record storage
- **Digital Signatures**: MetaMask transaction signing
- **IPFS Distribution**: Decentralized file storage

### Attack Prevention
- **Rollback Attacks**: Blockchain consensus prevents history modification
- **Man-in-the-Middle**: HTTPS and cryptographic verification
- **File Tampering**: Hash mismatch detection
- **Unauthorized Access**: Wallet-based authentication

## 📄 License

This project is licensed under the MIT License.

## 🚀 Project Overview

This project demonstrates enterprise-grade file integrity verification using blockchain technology.

### Problem Solved
- File tampering detection
- Authenticity verification
- Non-repudiation guarantees
- Transparent audit trails
- Decentralized trust

### Innovation Highlights
- Real-time verification feedback
- Dual verification methods (file + hash)
- Comprehensive audit trail
- Modern responsive interface
- Production-ready architecture

---

**⭐ Built with cutting-edge blockchain technology for enterprise security!**
