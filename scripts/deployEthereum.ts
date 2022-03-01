import { providers, Wallet } from 'ethers';
import { ethers, run, network } from 'hardhat';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

// Each withdrawal gives a fee of 0.1 ether to delegators and 0.1 ether to node operators
const DELEGATOR_FEE_WEI = '100000000000000000';
const NODE_OPERATOR_FEE_WEI = '100000000000000000';

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
  const mainContract = await BridgeBackBetterV1.deploy(BigInt(DELEGATOR_FEE_WEI), BigInt(NODE_OPERATOR_FEE_WEI));
  await mainContract.deployed();
  console.log(`BridgeBackBetterV1 deployed to: ${mainContract.address} on Ethereum`);
}

// Allows for using async/await everywhere and properly handling errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
