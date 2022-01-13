import { providers, Wallet } from 'ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

task('fastWithdrawal', 'Sells a L2->L1 withdrawal to the protocol for a fee')
  .addParam('amount', 'The amount of ether to withdraw from Arbitrum')
  .setAction(async ({ amount: withdrawAmountInEther }: { amount: string }, hre) => {
    dotenv.config();
    requireEnvVariables(['ETHEREUM_RINKEBY_PROVIDER_URL', 'ARBITRUM_RINKEBY_PROVIDER_URL', 'RINKEBY_PRIVATE_KEY']);

    const { ethers, network } = hre;

    if (network.name !== 'rinkeby' && network.name !== 'mainnet') {
      console.warn(
        'You\'re not running on Rinkeby or mainnet. The L1 contracts must be deployed to ' +
          'either of Rinkeby or mainnet since the L2 provider only supports those 2.' +
          'Use the option \'--network <rinkeby|mainnet>\''
      );
    }

    // Make sure the contracts are deployed (the deploy step saves the ABI and address to a file)

    const addressesFile = __dirname + '/../frontend/src/contracts/contract-addresses.json';
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

    const withdrawalContract = await ethers.getContractAt('ArbitrumWithdrawalV1', addresses.ArbitrumWithdrawalV1);

    // Instantiate Arbitrum wallets connected to provider
    console.log('Connecting wallet to provider on ' + network.name + '...');
    const arbProvider = new providers.JsonRpcProvider(process.env.ARBITRUM_RINKEBY_PROVIDER_URL);
    const arbWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, arbProvider);

    // Verify that the Arbitrum wallet has enough to withdraw from
    const arbBalanceInWei = await arbWallet.getBalance();
    const arbBalanceInEther = parseFloat(ethers.utils.formatEther(arbBalanceInWei));
    const withdrawAmountInWei = ethers.utils.parseEther(withdrawAmountInEther);
    console.log(`Arbitrum balance before withdrawing: ${arbBalanceInEther.toFixed(4)} ETH`);
    if (arbBalanceInWei < withdrawAmountInWei) {
        console.warn(`Your Arbitrum wallet doesn\'t have enough to withdraw ${withdrawAmountInEther} ETH`);
        return;
    }

    // Send a transaction to our Arbitrum contract to withdraw the desired amount of eth to the liquidity pool
    const withdrawTx = await withdrawalContract.withdraw(addresses.BBBEthPoolV1, { value: withdrawAmountInWei });
    console.log(`Transaction sent. Waiting for confirmations. ` +
        `${network.name === 'rinkeby' ? 'https://rinkeby-explorer.arbitrum.io/tx/' : 'https://arbiscan.io/tx/'}${withdrawTx.hash}`);
    const withdrawReceipt = await withdrawTx.wait();
    console.log(`Withdraw confirmed. Receipt: ${withdrawReceipt}`);
});
