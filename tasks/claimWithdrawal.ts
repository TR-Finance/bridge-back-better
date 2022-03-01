import { providers, Wallet } from 'ethers';
import { task } from 'hardhat/config';
import * as dotenv from 'dotenv';
import { Bridge, OutgoingMessageState } from 'arb-ts';
import { requireEnvVariables } from '../utils';

task('claimWithdrawal', 'Claims a withdrawal once it has been confirmed after the 7-day challenge period')
  .addParam('txHash', 'Hash of the transaction that called withdraw() on the ArbitrumWithdrawalV1 contract')
  .setAction(async ({ txHash }: { txHash: string }, hre) => {
    dotenv.config();
    requireEnvVariables([
      'ETHEREUM_RINKEBY_PROVIDER_URL',
      'ARBITRUM_RINKEBY_PROVIDER_URL',
      'RINKEBY_PRIVATE_KEY',
      'ADDRESS_RINKEBY_BridgeBackBetterV1',
    ]);

    const { ethers, network } = hre;

    if (network.name !== 'rinkeby' && network.name !== 'mainnet') {
      console.warn(
        "You're not running on Rinkeby or mainnet. You can claim transactions on Ethereum Rinkeby or mainnet. \
         Use the option '--network <rinkeby|mainnet>'",
      );
      return;
    }

    // Validate the hash of the transaction that initiated the withdrawal
    if (!txHash || !txHash.startsWith('0x') || txHash.trim().length !== 66) {
      console.warn(`'${txHash}' is not a valid transaction hash.`);
      return;
    }

    // Instantiate Arbitrum and Ethereum wallets connected to providers
    console.log(`Connecting to providers on ${network.name}...`);
    const arbProvider = new providers.JsonRpcProvider(process.env.ARBITRUM_RINKEBY_PROVIDER_URL);
    const ethProvider = new providers.JsonRpcProvider(process.env.ETHEREUM_RINKEBY_PROVIDER_URL);
    const arbWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, arbProvider);
    const ethWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, ethProvider);

    const mainContract = await ethers.getContractAt(
      'BridgeBackBetterV1',
      process.env.ADDRESS_RINKEBY_BridgeBackBetterV1 as string,
      ethWallet,
    );

    // Create arb-ts bridge instance
    const bridge = await Bridge.init(ethWallet, arbWallet);

    // Use the provided transaction hash to get the receipt of the withdrawal from Arbitrum
    const withdrawalTxReceipt = await bridge.l2Provider.getTransactionReceipt(txHash);

    if (!withdrawalTxReceipt) {
      console.warn(`Failed to find receipt for Arbitrum withdrawal with txHash: ${txHash}.`);
      return;
    }

    // TODO: Use the receipt to check for valid withdrawal and claim it for the contract
  });
