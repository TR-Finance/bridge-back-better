import { providers, Wallet } from 'ethers';
import fs from 'fs';
import { ethers, run, artifacts } from 'hardhat';
import { BBBEthPoolV1, BridgeBackBetterV1, ArbitrumWithdrawalV1 } from '../typechain';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

 // Each withdrawal gives a fee of 0.1 ether to pool stakers and 0.1 ether to node operators
const POOL_FEE_WEI = '100000000000000000';
const NODE_OPERATOR_FEE_WEI = '100000000000000000';

async function main() {
  dotenv.config();
  requireEnvVariables(['ETHEREUM_RINKEBY_PROVIDER_URL', 'ARBITRUM_RINKEBY_PROVIDER_URL', 'RINKEBY_PRIVATE_KEY']);

  await run('compile');

  // Instantiate Arbitrum and Ethereum wallets connected to providers
  console.log('Connecting to providers on rinkeby...');
  const arbProvider = new providers.JsonRpcProvider(process.env.ARBITRUM_RINKEBY_PROVIDER_URL);
  const ethProvider = new providers.JsonRpcProvider(process.env.ETHEREUM_RINKEBY_PROVIDER_URL);
  const arbWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, arbProvider);
  const ethWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, ethProvider);

  // Deploy the main contract on Ethereum
  const BridgeBackBetterV1 = await ethers.getContractFactory('BridgeBackBetterV1');
  BridgeBackBetterV1.connect(ethWallet);
  const mainContract = await BridgeBackBetterV1.deploy(BigInt(POOL_FEE_WEI), BigInt(NODE_OPERATOR_FEE_WEI));
  await mainContract.deployed();
  console.log(`BridgeBackBetterV1 deployed to: ${mainContract.address} on Ethereum`);
  
  // Deploy contract for a liquidity pool for ether on Ethereum
  const BBBEthPoolV1 = await ethers.getContractFactory('BBBEthPoolV1');
  BBBEthPoolV1.connect(ethWallet);
  const ethPool = await BBBEthPoolV1.deploy(mainContract.address);
  await ethPool.deployed();
  console.log(`BBBEthPoolV1 deployed to ${ethPool.address} on Ethereum`);

  // Deploy contract on Arbitrum to initiate withdrawals and emit events for them
  const ArbitrumWithdrawalV1 = await ethers.getContractFactory('ArbitrumWithdrawalV1');
  ArbitrumWithdrawalV1.connect(arbWallet);
  const withdrawalContract = await ArbitrumWithdrawalV1.deploy();
  await withdrawalContract.deployed();
  console.log(`ArbitrumWithdrawalV1 deployed to ${withdrawalContract.address} on Arbitrum`);

  // Save contract artifacts and deployed addresses to use in Hardhat tasks
  saveFrontendFiles(ethPool, mainContract, withdrawalContract);
}

const saveFrontendFiles = (
  ethPool: BBBEthPoolV1,
  mainContract: BridgeBackBetterV1,
  withdrawalContract: ArbitrumWithdrawalV1) => {
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
      ArbitrumWithdrawalV1: withdrawalContract
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

  // Write artifact for Arbitrum withdrawal contract to frontend/src/contracts
  const ArbitrumWithdrawalV1 = artifacts.readArtifactSync('ArbitrumWithdrawalV1');
  fs.writeFileSync(
    contractsDir + '/ArbitrumWithdrawalV1.json',
    JSON.stringify(ArbitrumWithdrawalV1, null, 2)
  );
}

// Allows for using async/await everywhere and properly handling errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
