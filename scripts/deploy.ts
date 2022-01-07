import { ethers, run } from 'hardhat';

async function main() {
  await run('compile');

  // Deploy a liquidity pool for ether
  const BBBEthPoolV1 = await ethers.getContractFactory("BBBEthPoolV1");
  const ethPool = await BBBEthPoolV1.deploy();
  await ethPool.deployed();
  console.log("BBBEthPoolV1 deployed to:", ethPool.address);

  // Deploy the main contract
  const BridgeBackBetterV1 = await ethers.getContractFactory("BridgeBackBetterV1");
  const mainContract = await BridgeBackBetterV1.deploy(BigInt("100000000000000000")); // 0.1 ether fee
  await (mainContract.deployed());
  console.log("BridgeBackBetterV1 deployed to:", ethPool.address);
}

// Allows for using async/await everywhere and properly handling errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
