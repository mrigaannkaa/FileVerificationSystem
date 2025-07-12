// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FileIntegrity
 * @dev Smart contract for ensuring file integrity using blockchain
 * @notice This contract stores file hashes and metadata for verification
 */
contract FileIntegrity {
    
    struct FileRecord {
        string fileName;
        string fileHash;
        string ipfsHash;
        address uploader;
        uint256 timestamp;
        string description;
        bool exists;
    }
    
    // Mapping from file ID to file record
    mapping(uint256 => FileRecord) public files;
    
    // Mapping from file hash to file ID for quick lookup
    mapping(string => uint256) public hashToFileId;
    
    // Mapping from uploader address to array of file IDs
    mapping(address => uint256[]) public uploaderFiles;
    
    // Current file ID counter
    uint256 public currentFileId;
    
    // Events
    event FileUploaded(
        uint256 indexed fileId,
        string fileName,
        string fileHash,
        string ipfsHash,
        address indexed uploader,
        uint256 timestamp
    );
    
    event FileVerified(
        uint256 indexed fileId,
        string fileHash,
        bool isValid,
        address indexed verifier
    );
    
    modifier onlyUploader(uint256 _fileId) {
        require(files[_fileId].uploader == msg.sender, "Only uploader can perform this action");
        _;
    }
    
    modifier fileExists(uint256 _fileId) {
        require(files[_fileId].exists, "File does not exist");
        _;
    }
    
    /**
     * @dev Upload a new file record to the blockchain
     * @param _fileName Name of the file
     * @param _fileHash SHA-256 hash of the file
     * @param _ipfsHash IPFS hash for file storage
     * @param _description Description of the file
     * @return fileId The unique identifier for the uploaded file
     */
    function uploadFile(
        string memory _fileName,
        string memory _fileHash,
        string memory _ipfsHash,
        string memory _description
    ) public returns (uint256) {
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        require(bytes(_fileHash).length > 0, "File hash cannot be empty");
        require(hashToFileId[_fileHash] == 0, "File with this hash already exists");
        
        currentFileId++;
        uint256 fileId = currentFileId;
        
        files[fileId] = FileRecord({
            fileName: _fileName,
            fileHash: _fileHash,
            ipfsHash: _ipfsHash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            description: _description,
            exists: true
        });
        
        hashToFileId[_fileHash] = fileId;
        uploaderFiles[msg.sender].push(fileId);
        
        emit FileUploaded(
            fileId,
            _fileName,
            _fileHash,
            _ipfsHash,
            msg.sender,
            block.timestamp
        );
        
        return fileId;
    }
    
    /**
     * @dev Verify file integrity using its hash
     * @param _fileHash SHA-256 hash of the file to verify
     * @return isValid Whether the file hash exists in the blockchain
     * @return fileId The file ID if found
     * @return uploader Address of the original uploader
     * @return timestamp When the file was originally uploaded
     */
    function verifyFile(string memory _fileHash) 
        public 
        returns (bool isValid, uint256 fileId, address uploader, uint256 timestamp) 
    {
        fileId = hashToFileId[_fileHash];
        isValid = fileId != 0;
        
        if (isValid) {
            FileRecord memory file = files[fileId];
            uploader = file.uploader;
            timestamp = file.timestamp;
        }
        
        emit FileVerified(fileId, _fileHash, isValid, msg.sender);
        
        return (isValid, fileId, uploader, timestamp);
    }
    
    /**
     * @dev Get file details by file ID
     * @param _fileId The file ID to query
     * @return file The complete file record
     */
    function getFileById(uint256 _fileId) 
        public 
        view 
        fileExists(_fileId) 
        returns (FileRecord memory) 
    {
        return files[_fileId];
    }
    
    /**
     * @dev Get all files uploaded by a specific address
     * @param _uploader The uploader address
     * @return fileIds Array of file IDs uploaded by the address
     */
    function getFilesByUploader(address _uploader) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return uploaderFiles[_uploader];
    }
    
    /**
     * @dev Get total number of files in the system
     * @return The total number of uploaded files
     */
    function getTotalFiles() public view returns (uint256) {
        return currentFileId;
    }
    
    /**
     * @dev Check if a file hash exists in the system
     * @param _fileHash The file hash to check
     * @return exists Whether the hash exists
     */
    function fileHashExists(string memory _fileHash) public view returns (bool) {
        return hashToFileId[_fileHash] != 0;
    }
    
    /**
     * @dev Get file verification history for audit trail
     * @param _fileId The file ID to get history for
     * @return fileName Name of the file
     * @return fileHash Hash of the file
     * @return uploader Original uploader
     * @return timestamp Upload timestamp
     * @return description File description
     */
    function getFileAuditTrail(uint256 _fileId) 
        public 
        view 
        fileExists(_fileId) 
        returns (
            string memory fileName,
            string memory fileHash,
            address uploader,
            uint256 timestamp,
            string memory description
        ) 
    {
        FileRecord memory file = files[_fileId];
        return (
            file.fileName,
            file.fileHash,
            file.uploader,
            file.timestamp,
            file.description
        );
    }
}
