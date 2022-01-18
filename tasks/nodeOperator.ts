/* eslint-disable no-console */
import { providers, Wallet } from 'ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

task('nodeOperator', 'Locks up ether with the Ethereum contract and verifies withdrawals')
  .addParam('bondAmount', 'The amount of ether to bond as collateral for verifying withdrawals')
  .setAction(async ({ bondAmount: bondAmountInEther }: { bondAmount: string }, hre) => {
    dotenv.config();
    requireEnvVariables(['ETHEREUM_RINKEBY_PROVIDER_URL', 'ARBITRUM_RINKEBY_PROVIDER_URL', 'RINKEBY_PRIVATE_KEY']);

    const { ethers, network } = hre;

    if (network.name !== 'rinkeby' && network.name !== 'mainnet') {
      console.warn(
        "You're not running on Rinkeby or mainnet. Node operators must listen for events on \
          either Arbitrum One (mainnet) or Arbitrum Rinkeby (testnet), and they must send transactions to \
          either Ethereum mainnet or Rinkeby. Use the option '--network <rinkeby|mainnet>'",
      );
      return;
    }

    // Make sure the contracts are deployed (the deploy step saves the ABI and address to a file)

    const addressesFile = `${__dirname}/../frontend/src/contracts/contract-addresses.json`;
    if (!fs.existsSync(addressesFile)) {
      console.error('You need to deploy the BBBEthPoolV1 and BridgeBackBetterV1 contracts first');
      return;
    }

    const addressesJson = fs.readFileSync(addressesFile);
    const addresses = JSON.parse(addressesJson.toString());

    if ((await ethers.provider.getCode(addresses.BBBEthPoolV1)) === '0x') {
      console.error('You need to deploy the BBBEthPoolV1 contract first');
      return;
    }
    if ((await ethers.provider.getCode(addresses.BridgeBackBetterV1)) === '0x') {
      console.error('You need to deploy the BridgeBackBetterV1 contract first');
      return;
    }

    // Instantiate Arbitrum and Ethereum wallets connected to providers
    console.log(`Connecting to providers on ${network.name}...`);
    const arbProvider = new providers.JsonRpcProvider(process.env.ARBITRUM_RINKEBY_PROVIDER_URL);
    const ethProvider = new providers.JsonRpcProvider(process.env.ETHEREUM_RINKEBY_PROVIDER_URL);
    const arbWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, arbProvider);
    const ethWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, ethProvider);

    const withdrawalContract = await ethers.getContractAt(
      'ArbitrumWithdrawalV1',
      addresses.ArbitrumWithdrawalV1,
      arbWallet,
    );
    const mainContract = await ethers.getContractAt('BridgeBackBetterV1', addresses.BridgeBackBetterV1, ethWallet);

    // Bond ether with the BBB contract
    console.log(`Bonding ${bondAmountInEther} ETH that will be slashed if an invalid tx is verified`);
    await mainContract.bond({
      value: ethers.utils.parseEther(bondAmountInEther),
    });

    // Listen for a withdrawal to happen
    console.log('Listening for WithdrawalInitiated events on Arbitrum. Feel free to cancel execution at any time.');
    withdrawalContract.on('WithdrawalInitiated', async (sender, destination, amount, withdrawalId, event) => {
      console.log(
        'Heard WithdrawalEvent! This is when the node operator would perform an off-chain verification ' +
          'of the Arbitrum chain before proceeding',
      );
      console.log(`Event info: ${sender} sent to ${destination} with the ID ${withdrawalId}. Event: ${event}`);
      console.log('Proceeding with program as if the chain were successfully verified...');

      await mainContract.verifyWithdrawal(destination, amount, withdrawalId);
      console.log('');
    });
  });
