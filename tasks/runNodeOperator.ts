import { providers, Wallet } from 'ethers';
import { task } from 'hardhat/config';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

task('runNodeOperator', 'Locks up ether with the Ethereum contract and verifies withdrawals')
  .addParam('bondAmount', 'The amount of ether to bond as collateral for verifying withdrawals')
  .setAction(async ({ bondAmount: bondAmountInEther }: { bondAmount: string }, hre) => {
    dotenv.config();
    requireEnvVariables([
      'ETHEREUM_RINKEBY_PROVIDER_URL',
      'ARBITRUM_RINKEBY_PROVIDER_URL',
      'ADDRESS_RINKEBY_BridgeBackBetterV1',
      'ADDRESS_RINKEBY_ArbitrumWithdrawalV1',
      'RINKEBY_PRIVATE_KEY',
    ]);

    const { ethers, network } = hre;

    if (network.name !== 'rinkeby' && network.name !== 'mainnet') {
      console.warn(
        "You're not running on Rinkeby or mainnet. Node operators must listen for events on \
          either Arbitrum One (mainnet) or Arbitrum Rinkeby (testnet), and they must send transactions to \
          either Ethereum mainnet or Rinkeby. Use the option '--network <rinkeby|mainnet>'",
      );
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
      process.env.ADDRESS_RINKEBY_ArbitrumWithdrawalV1 as string,
      arbWallet,
    );
    const mainContract = await ethers.getContractAt(
      'BridgeBackBetterV1',
      process.env.ADDRESS_RINKEBY_BridgeBackBetterV1 as string,
      ethWallet,
    );

    // Bond ether with the BBB contract
    console.log(`Bonding ${bondAmountInEther} ETH that will be slashed if an invalid tx is verified`);
    await mainContract.bond({
      value: ethers.utils.parseEther(bondAmountInEther),
    });

    // Listen for a withdrawal to happen
    withdrawalContract.on('WithdrawInitiated', async (sender, destination, amount, withdrawalId, event) => {
      console.log(
        'Heard WithdrawInitiated event! This is when the node operator would perform an off-chain verification ' +
          'of the Arbitrum chain before proceeding',
      );
      console.log(`Event info: ${sender} sent to ${destination} with the ID ${withdrawalId}. Event: ${event}`);
      console.log('Proceeding with program as if the chain were successfully verified...');

      await mainContract.verifyWithdrawal(destination, amount, withdrawalId);
    });

    console.log(
      `Listening for new WithdrawInitiated events on Arbitrum and for completed withdrawals \
      to claim on Ethereum. Feel free to cancel execution at any time.`,
    );

    // Check every minute for a valid withdrawal that's ready to claim on mainnet
    // eslint-disable-next-line no-constant-condition
    //while (true) {
    // eslint-disable-next-line no-await-in-loop
    const nodeOperator = await mainContract.nodeOperators(ethWallet.address);
    console.log(nodeOperator);
    // TODO: Retrieve list of withdrawals from nodeOperator and check if any have been active for 7+ days
    //}
  });
