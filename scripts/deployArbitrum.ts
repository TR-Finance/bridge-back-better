import { providers, Wallet } from 'ethers';
import { ethers, run, network } from 'hardhat';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

async function main() {
  dotenv.config();
  requireEnvVariables(['ARBITRUM_RINKEBY_PROVIDER_URL', 'RINKEBY_PRIVATE_KEY']);

  if (network.name !== 'arbitrumTestnet' && network.name !== 'arbitrumOne') {
    console.warn(
      "You're not running on Arbitrum One (mainnet) or Arbitrum Rinkeby (testnet). L2 contracts " +
        'must be deployed to either either Rinkeby or mainnet. ' +
        "Use the option '--network <arbitrumTestnet|arbitrumOne>'",
    );
    return;
  }

  await run('compile');

  // Instantiate Arbitrum wallet connected to provider
  console.log('Connecting wallet to provider on Arbitrum Rinkeby...');
  const arbProvider = new providers.JsonRpcProvider(process.env.ARBITRUM_RINKEBY_PROVIDER_URL);
  const arbWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, arbProvider);

  // Deploy contract on Arbitrum to initiate withdrawals and emit events for them
  const ArbitrumWithdrawalV1 = await ethers.getContractFactory('ArbitrumWithdrawalV1', arbWallet);
  ArbitrumWithdrawalV1.connect(arbWallet);
  const withdrawalContract = await ArbitrumWithdrawalV1.deploy();
  await withdrawalContract.deployed();
  console.log(`ArbitrumWithdrawalV1 deployed to ${withdrawalContract.address} on Arbitrum`);
}

// Allows for using async/await everywhere and properly handling errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
