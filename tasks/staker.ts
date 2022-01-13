import { providers, Wallet } from 'ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

task('stake', 'Stakes ETH in the liquidity pool')
  .addParam('amount', 'The amount of ether to stake for LP rewards')
  .setAction(async ({ amount: stakeAmountInEther }: { amount: string }, hre) => {
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

    const ethPool = await ethers.getContractAt('BBBEthPoolV1', addresses.BBBEthPoolV1);

    // Instantiate Ethereum wallet connected to provider
    console.log('Connecting wallet to provider on ' + network.name + '...');
    const ethProvider = new providers.JsonRpcProvider(process.env.ETHEREUM_RINKEBY_PROVIDER_URL);
    const ethWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, ethProvider);

    // Verify that the wallet has enough to stake
    const walletBalanceInWei = await ethWallet.getBalance();
    const walletBalanceInEther = parseFloat(ethers.utils.formatEther(walletBalanceInWei));
    const stakeAmountInWei = ethers.utils.parseEther(stakeAmountInEther);
    console.log(`Wallet balance before staking: ${walletBalanceInEther.toFixed(4)} ETH`);
    if (walletBalanceInWei < stakeAmountInWei) {
        console.warn(`Your wallet doesn\'t have enough to stake ${stakeAmountInEther} ETH`);
        return;
    }

    // Send a transaction to our pool contract to stake liquidity
    const stakeTx = await ethPool.provideLiq({ value: stakeAmountInWei });
    console.log(`Transaction sent. Waiting for confirmations. ${network.name === 'rinkeby' ? 'https://rinkeby.etherscan.io/tx/' : 'https://etherscan.io/tx/'}${stakeTx.hash}`);
    const stakeReceipt = await stakeTx.wait();
    console.log(`Successfully staked ${stakeAmountInEther} ETH with receipt: ${stakeReceipt}`);
});
