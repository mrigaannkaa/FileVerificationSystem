const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FileIntegrity contract...");

  // Get the contract factory
  const FileIntegrity = await ethers.getContractFactory("FileIntegrity");

  // Deploy the contract
  const fileIntegrity = await FileIntegrity.deploy();

  await fileIntegrity.waitForDeployment();

  const contractAddress = await fileIntegrity.getAddress();
  
  console.log("FileIntegrity contract deployed to:", contractAddress);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    deploymentTime: new Date().toISOString(),
    network: "localhost"
  };
  
  fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
