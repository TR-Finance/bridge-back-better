import { providers, Wallet } from 'ethers';
import { task } from 'hardhat/config';
import * as dotenv from 'dotenv';
import { requireEnvVariables } from '../utils';

task('delegateEther', 'Delegates ether to a node operator, locking the ETH for 7 days')
  .addParam('nodeOperatorAddress', 'The address of the node operator to delegate ether to to')
  .addParam('amount', 'The amount of ether to delegate for LP rewards')
  .setAction(
    async (
      { nodeOperatorAddress, amount: delegateAmountInEther }: { nodeOperatorAddress: string; amount: string },
      hre,
    ) => {
      dotenv.config();
      requireEnvVariables([
        'ETHEREUM_RINKEBY_PROVIDER_URL',
        'ARBITRUM_RINKEBY_PROVIDER_URL',
        'ADDRESS_RINKEBY_BridgeBackBetterV1',
        'RINKEBY_PRIVATE_KEY',
      ]);

      const { ethers, network } = hre;

      if (network.name !== 'rinkeby' && network.name !== 'mainnet') {
        console.warn(
          "You're not running on Rinkeby or mainnet. Staking must send transactions to \
            either Ethereum Rinkeby or mainnet. Use the option '--network <rinkeby|mainnet>'",
        );
        return;
      }

      // Instantiate Ethereum wallet connected to provider
      console.log(`Connecting wallet to provider on ${network.name}...`);
      const ethProvider = new providers.JsonRpcProvider(process.env.ETHEREUM_RINKEBY_PROVIDER_URL);
      const ethWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, ethProvider);

      const mainContract = await ethers.getContractAt(
        'BridgeBackBetterV1',
        process.env.ADDRESS_RINKEBY_BridgeBackBetterV1 as string,
        ethWallet,
      );

      // Verify that the wallet has enough to stake
      const walletBalanceInWei = await ethWallet.getBalance();
      const walletBalanceInEther = parseFloat(ethers.utils.formatEther(walletBalanceInWei));
      const delegateAmountInWei = ethers.utils.parseEther(delegateAmountInEther);
      console.log(`Wallet balance before delegating: ${walletBalanceInEther.toFixed(4)} ETH`);
      if (walletBalanceInWei.lt(delegateAmountInWei)) {
        console.warn(`Your wallet doesn't have enough to delegate ${delegateAmountInEther} ETH`);
        return;
      }

      // Send a transaction to main contract to delegate ether to node operator
      const delegateTx = await mainContract.delegate({ nodeOperator: nodeOperatorAddress, value: delegateAmountInWei });
      console.log(
        `Transaction sent. Waiting for confirmations. ${
          network.name === 'rinkeby' ? 'https://rinkeby.etherscan.io/tx/' : 'https://etherscan.io/tx/'
        }${delegateTx.hash}`,
      );
      const delegateReceipt = await delegateTx.wait();
      console.log(
        `Successfully delegated ${delegateAmountInEther} ETH with receipt: ${JSON.stringify(delegateReceipt)}`,
      );
    },
  );
