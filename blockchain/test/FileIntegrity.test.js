const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FileIntegrity", function () {
  let FileIntegrity;
  let fileIntegrity;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    FileIntegrity = await ethers.getContractFactory("FileIntegrity");
    [owner, addr1, addr2] = await ethers.getSigners();
    fileIntegrity = await FileIntegrity.deploy();
    await fileIntegrity.waitForDeployment();
  });

  describe("File Upload", function () {
    it("Should upload a file successfully", async function () {
      const fileName = "test.pdf";
      const fileHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const ipfsHash = "QmTest123";
      const description = "Test document";

      const tx = await fileIntegrity.uploadFile(fileName, fileHash, ipfsHash, description);
      await tx.wait();

      const file = await fileIntegrity.getFileById(1);
      expect(file.fileName).to.equal(fileName);
      expect(file.fileHash).to.equal(fileHash);
      expect(file.ipfsHash).to.equal(ipfsHash);
      expect(file.uploader).to.equal(owner.address);
      expect(file.description).to.equal(description);
      expect(file.exists).to.be.true;
    });

    it("Should emit FileUploaded event", async function () {
      const fileName = "test.pdf";
      const fileHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const ipfsHash = "QmTest123";
      const description = "Test document";

      await expect(fileIntegrity.uploadFile(fileName, fileHash, ipfsHash, description))
        .to.emit(fileIntegrity, "FileUploaded")
        .withArgs(1, fileName, fileHash, ipfsHash, owner.address, await time.latest() + 1);
    });

    it("Should not allow duplicate file hashes", async function () {
      const fileName = "test.pdf";
      const fileHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const ipfsHash = "QmTest123";
      const description = "Test document";

      await fileIntegrity.uploadFile(fileName, fileHash, ipfsHash, description);
      
      await expect(
        fileIntegrity.uploadFile("test2.pdf", fileHash, "QmTest456", "Another test")
      ).to.be.revertedWith("File with this hash already exists");
    });

    it("Should not allow empty file names", async function () {
      await expect(
        fileIntegrity.uploadFile("", "0x123", "QmTest", "Description")
      ).to.be.revertedWith("File name cannot be empty");
    });

    it("Should not allow empty file hashes", async function () {
      await expect(
        fileIntegrity.uploadFile("test.pdf", "", "QmTest", "Description")
      ).to.be.revertedWith("File hash cannot be empty");
    });
  });

  describe("File Verification", function () {
    beforeEach(async function () {
      await fileIntegrity.uploadFile(
        "test.pdf",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "QmTest123",
        "Test document"
      );
    });

    it("Should verify existing file successfully", async function () {
      const fileHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      
      const result = await fileIntegrity.verifyFile(fileHash);
      expect(result[0]).to.be.true; // isValid
      expect(result[1]).to.equal(1); // fileId
      expect(result[2]).to.equal(owner.address); // uploader
    });

    it("Should return false for non-existing file", async function () {
      const nonExistentHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      
      const result = await fileIntegrity.verifyFile(nonExistentHash);
      expect(result[0]).to.be.false; // isValid
      expect(result[1]).to.equal(0); // fileId
    });

    it("Should emit FileVerified event", async function () {
      const fileHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      
      await expect(fileIntegrity.verifyFile(fileHash))
        .to.emit(fileIntegrity, "FileVerified")
        .withArgs(1, fileHash, true, owner.address);
    });
  });

  describe("File Queries", function () {
    beforeEach(async function () {
      await fileIntegrity.connect(addr1).uploadFile(
        "doc1.pdf",
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        "QmDoc1",
        "Document 1"
      );
      await fileIntegrity.connect(addr1).uploadFile(
        "doc2.pdf",
        "0x2222222222222222222222222222222222222222222222222222222222222222",
        "QmDoc2",
        "Document 2"
      );
      await fileIntegrity.connect(addr2).uploadFile(
        "doc3.pdf",
        "0x3333333333333333333333333333333333333333333333333333333333333333",
        "QmDoc3",
        "Document 3"
      );
    });

    it("Should return files by uploader", async function () {
      const addr1Files = await fileIntegrity.getFilesByUploader(addr1.address);
      expect(addr1Files.length).to.equal(2);
      expect(addr1Files[0]).to.equal(1);
      expect(addr1Files[1]).to.equal(2);

      const addr2Files = await fileIntegrity.getFilesByUploader(addr2.address);
      expect(addr2Files.length).to.equal(1);
      expect(addr2Files[0]).to.equal(3);
    });

    it("Should return total files count", async function () {
      const totalFiles = await fileIntegrity.getTotalFiles();
      expect(totalFiles).to.equal(3);
    });

    it("Should check if file hash exists", async function () {
      const existingHash = "0x1111111111111111111111111111111111111111111111111111111111111111";
      const nonExistentHash = "0x9999999999999999999999999999999999999999999999999999999999999999";

      expect(await fileIntegrity.fileHashExists(existingHash)).to.be.true;
      expect(await fileIntegrity.fileHashExists(nonExistentHash)).to.be.false;
    });

    it("Should return audit trail", async function () {
      const auditTrail = await fileIntegrity.getFileAuditTrail(1);
      expect(auditTrail[0]).to.equal("doc1.pdf"); // fileName
      expect(auditTrail[1]).to.equal("0x1111111111111111111111111111111111111111111111111111111111111111"); // fileHash
      expect(auditTrail[2]).to.equal(addr1.address); // uploader
      expect(auditTrail[4]).to.equal("Document 1"); // description
    });

    it("Should revert when getting non-existent file", async function () {
      await expect(fileIntegrity.getFileById(999))
        .to.be.revertedWith("File does not exist");
    });
  });
});
