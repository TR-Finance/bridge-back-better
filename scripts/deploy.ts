import fs from 'fs';
import { ethers, run, artifacts } from 'hardhat';
import { BBBEthPoolV1, BridgeBackBetterV1 } from '../typechain';

// TODO: See more complete example: https://github.com/OffchainLabs/arbitrum-tutorials/blob/master/packages/eth-withdraw/scripts/exec-viaDApp.js
async function main() {
  await run('compile');

  // Deploy a liquidity pool for ether
  const BBBEthPoolV1 = await ethers.getContractFactory('BBBEthPoolV1');
  const ethPool = await BBBEthPoolV1.deploy();
  await ethPool.deployed();
  console.log('BBBEthPoolV1 deployed to:', ethPool.address);

  // Deploy the main contract
  const BridgeBackBetterV1 = await ethers.getContractFactory('BridgeBackBetterV1');
  const mainContract = await BridgeBackBetterV1.deploy(BigInt('100000000000000000')); // 0.1 ether fee
  await (mainContract.deployed());
  console.log('BridgeBackBetterV1 deployed to:', mainContract.address);

  // Save contract artifacts and deployed addresses to use in Hardhat tasks
  saveFrontendFiles(ethPool, mainContract);
}

const saveFrontendFiles = (ethPool: BBBEthPoolV1, mainContract: BridgeBackBetterV1) => {
  const contractsDir = __dirname + '/../frontend/src/contracts';

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save the address that each contract is deployed to so we can access it in Hardhat tasks later
  fs.writeFileSync(
    contractsDir + '/contract-addresses.json',
    JSON.stringify({
      BBBEthPoolV1: ethPool.address,
      BridgeBackBetterV1: mainContract.address,
    }, undefined, 2)
  );

  // Write artifact for eth pool contract to frontend/src/contracts
  const BBBEthPoolV1 = artifacts.readArtifactSync('BBBEthPoolV1');
  fs.writeFileSync(
    contractsDir + '/BBBEthPoolV1.json',
    JSON.stringify(BBBEthPoolV1, null, 2)
  );

  // Write artifact for main contract to frontend/src/contracts
  const BridgeBackBetterV1 = artifacts.readArtifactSync('BridgeBackBetterV1');
  fs.writeFileSync(
    contractsDir + '/BridgeBackBetterV1.json',
    JSON.stringify(BridgeBackBetterV1, null, 2)
  );
}

// Allows for using async/await everywhere and properly handling errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
