import { providers, Wallet } from 'ethers';
import { task } from 'hardhat/config';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

task('initiateWithdrawal', 'Initiates a L2->L1 (Arbitrum->Ethereum) withdrawal and sells it to the protocol for a fee')
  .addParam('amount', 'The amount of ether to withdraw from Arbitrum')
  .setAction(async ({ amount: withdrawAmountInEther }: { amount: string }, hre) => {
    dotenv.config();
    requireEnvVariables([
      'ARBITRUM_RINKEBY_PROVIDER_URL',
      'ADDRESS_RINKEBY_BridgeBackBetterV1',
      'ADDRESS_RINKEBY_ArbitrumWithdrawalV1',
      'RINKEBY_PRIVATE_KEY',
    ]);

    const { ethers, network } = hre;

    if (network.name !== 'arbitrumOne' && network.name !== 'arbitrumTestnet') {
      console.warn(
        "You're not running on Arbitrum One (mainnet) or Arbitrum Rinkeby (testnet). \
          Fast withdrawals must send transactions to the protocol's contract on either \
          Arbitrum-Rinkeby or Arbitrum-mainnet. Use the option '--network <arbitrumTestnet|arbitrumOne>'",
      );
      return;
    }

    // Instantiate Arbitrum wallet connected to provider
    console.log(`Connecting wallet to provider on ${network.name}...`);
    const arbProvider = new providers.JsonRpcProvider(process.env.ARBITRUM_RINKEBY_PROVIDER_URL);
    const arbWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, arbProvider);

    const withdrawalContract = await ethers.getContractAt(
      'ArbitrumWithdrawalV1',
      process.env.ADDRESS_RINKEBY_ArbitrumWithdrawalV1 as string,
      arbWallet,
    );

    // Verify that the Arbitrum wallet has enough to withdraw from
    const arbBalanceInWei = await arbWallet.getBalance();
    const arbBalanceInEther = parseFloat(ethers.utils.formatEther(arbBalanceInWei));
    const withdrawAmountInWei = ethers.utils.parseEther(withdrawAmountInEther);
    console.log(`Arbitrum balance before withdrawing: ${arbBalanceInEther.toFixed(4)} ETH`);
    if (arbBalanceInWei.lt(withdrawAmountInWei)) {
      console.warn(`Your Arbitrum wallet doesn't have enough to withdraw ${withdrawAmountInEther} ETH`);
      return;
    }

    // Send a transaction to our Arbitrum contract to withdraw the desired amount of eth to the liquidity pool
    const withdrawTx = await withdrawalContract.withdraw(process.env.ADDRESS_RINKEBY_BridgeBackBetterV1 as string, {
      value: withdrawAmountInWei,
    });
    console.log(
      `Transaction sent. Waiting for confirmations. ` +
        `${
          network.name === 'arbitrumTestnet' ? 'https://rinkeby-explorer.arbitrum.io/tx/' : 'https://arbiscan.io/tx/'
        }${withdrawTx.hash}`,
    );
    const withdrawReceipt = await withdrawTx.wait();
    console.log(`Withdraw confirmed. Receipt: ${withdrawReceipt}`);
  });
