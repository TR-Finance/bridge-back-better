/* eslint-disable no-console */
import { providers, Wallet } from 'ethers';
import fs from 'fs';
import { ethers, run, artifacts, network } from 'hardhat';
import * as dotenv from 'dotenv';
import { BBBEthPoolV1 as BBBEthPoolV1Type, BridgeBackBetterV1 as BridgeBackBetterV1Type } from '../typechain';
import { requireEnvVariables } from '../utils';

// Each withdrawal gives a fee of 0.1 ether to pool stakers and 0.1 ether to node operators
const POOL_FEE_WEI = '100000000000000000';
const NODE_OPERATOR_FEE_WEI = '100000000000000000';

const saveFrontendFiles = (ethPool: BBBEthPoolV1Type, mainContract: BridgeBackBetterV1Type) => {
  const contractsDir = `${__dirname}/../frontend/src/contracts`;
  const contractsDirEth = `${contractsDir}/ethereum`;

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  if (!fs.existsSync(contractsDirEth)) {
    fs.mkdirSync(contractsDirEth);
  }

  // Save the address that each contract is deployed to so we can access it in Hardhat tasks later
  fs.writeFileSync(
    `${contractsDirEth}/contract-addresses.json`,
    JSON.stringify(
      {
        BBBEthPoolV1: ethPool.address,
        BridgeBackBetterV1: mainContract.address,
      },
      undefined,
      2,
    ),
  );

  // Write artifact for eth pool contract to frontend/src/contracts
  const BBBEthPoolV1 = artifacts.readArtifactSync('BBBEthPoolV1');
  fs.writeFileSync(`${contractsDirEth}/BBBEthPoolV1.json`, JSON.stringify(BBBEthPoolV1, null, 2));

  // Write artifact for main contract to frontend/src/contracts
  const BridgeBackBetterV1 = artifacts.readArtifactSync('BridgeBackBetterV1');
  fs.writeFileSync(`${contractsDirEth}/BridgeBackBetterV1.json`, JSON.stringify(BridgeBackBetterV1, null, 2));
};

async function main() {
  dotenv.config();
  requireEnvVariables(['ETHEREUM_RINKEBY_PROVIDER_URL', 'RINKEBY_PRIVATE_KEY']);

  if (network.name !== 'rinkeby' && network.name !== 'mainnet') {
    console.warn(
      "You're not running on Rinkeby or mainnet. The L1 contracts must be deployed to " +
        'either of Rinkeby or mainnet since the L2 provider only supports those 2. ' +
        "Use the option '--network <rinkeby|mainnet>'",
    );
    return;
  }

  await run('compile');

  // Instantiate Ethereum wallet connected to provider
  console.log('Connecting wallet to provider on Ethereum Rinkeby...');
  const ethProvider = new providers.JsonRpcProvider(process.env.ETHEREUM_RINKEBY_PROVIDER_URL);
  const ethWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, ethProvider);

  // Deploy the main contract on Ethereum
  const BridgeBackBetterV1 = await ethers.getContractFactory('BridgeBackBetterV1');
  BridgeBackBetterV1.connect(ethWallet);
  const mainContract = await BridgeBackBetterV1.deploy(BigInt(POOL_FEE_WEI), BigInt(NODE_OPERATOR_FEE_WEI));
  await mainContract.deployed();
  console.log(`BridgeBackBetterV1 deployed to: ${mainContract.address} on Ethereum`);

  // Deploy contract for a liquidity pool for ether on Ethereum
  const BBBEthPoolV1 = await ethers.getContractFactory('BBBEthPoolV1', ethWallet);
  BBBEthPoolV1.connect(ethWallet);
  const ethPool = await BBBEthPoolV1.deploy(mainContract.address);
  await ethPool.deployed();
  console.log(`BBBEthPoolV1 deployed to ${ethPool.address} on Ethereum`);

  // Save contract artifacts and deployed addresses to use in Hardhat tasks
  saveFrontendFiles(ethPool, mainContract);
}

// Allows for using async/await everywhere and properly handling errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
