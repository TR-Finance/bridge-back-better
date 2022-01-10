import { providers, Wallet } from 'ethers';
import { ArbSys__factory, BridgeHelper } from 'arb-ts';
import fs from 'fs';
import { task } from 'hardhat/config';
import * as dotenv from 'dotenv';

task('fastWithdrawal', 'Sells a L2->L1 withdrawal to the protocol for a fee')
  .addParam('amount', 'The amount of ether to withdraw from Arbitrum')
  .setAction(async ({ amount: withdrawAmountInEther }: { amount: string }, hre) => {
    dotenv.config();
    requireEnvVariables(['ARBITRUM_RINKEBY_PROVIDER_URL', 'RINKEBY_PRIVATE_KEY']);

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
    const mainContract = await ethers.getContractAt('BridgeBackBetterV1', addresses.BridgeBackBetterV1);

    // TODO: Initiate the withdrawal (regular withdrawal from Arbitrum) by sending
    //       a tx to Arbitrum provider using the sender as a signer

    // Instantiate Arbitrum and Ethereum wallets connected to providers
    console.log('Connecting to providers on ' + network.name + '...');
    const arbProvider = new providers.JsonRpcProvider(process.env.ARBITRUM_RINKEBY_PROVIDER_URL);
    const ethProvider = new providers.JsonRpcProvider(process.env.ETHEREUM_RINKEBY_PROVIDER_URL);
    const arbWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, arbProvider);
    const ethWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, ethProvider);

    // Verify that the Arbitrum wallet has enough to withdraw from
    const arbBalanceInWei = await arbWallet.getBalance();
    const arbBalanceInEther = parseFloat(ethers.utils.formatEther(arbBalanceInWei));
    const withdrawAmountInWei = ethers.utils.parseEther(withdrawAmountInEther);
    console.log(`Arbitrum balance: ${arbBalanceInEther.toFixed(4)} ETH`);
    if (arbBalanceInWei < withdrawAmountInWei) {
        console.warn(`Your Arbitrum wallet doesn\'t have enough to withdraw ${withdrawAmountInEther} ETH`);
        return;
    }

    // Send a transaction to Arbitrum to withdraw the desired amount of eth
    const arbSys = ArbSys__factory.connect('0x0000000000000000000000000000000000000064', arbWallet);
    const withdrawTx = await arbSys.withdrawEth(ethWallet.address, { value: withdrawAmountInWei });
    console.log(`Transaction sent. Waiting for confirmations. ${network.name === 'rinkeby' ? 'https://rinkeby-explorer.arbitrum.io/tx/' : 'https://arbiscan.io/tx/'}${withdrawTx.hash}`);
    const withdrawReceipt = await withdrawTx.wait();
    const withdrawEventData = (BridgeHelper.getWithdrawalsInL2Transaction(withdrawReceipt))[0];
    console.log(`Withdrawal data: ${withdrawEventData}`);

    // TODO: The part below isn't working yet. It's probably best to just withdraw to the pool
    //  instead of withdrawing and then transfefring the withdrawal to the pool

    // Connect to the contract that can transfer the withdrawal from the user to our contract.
    // This has to use any subclass of L1ArbitrumExtendedGateway because it has the transferExitAndCall function that we need.
    // Currently the 2 subclasses of that are L1WethGateway and L1ERC20Gateway.
    // See here for contract addresses of those: https://developer.offchainlabs.com/docs/useful_addresses
    const L1WethGateway_ADDRESS_MAINNET = '0xd92023E9d9911199a6711321D1277285e6d4e2db';
    const L1WethGateway_ADDRESS_RINKEBY = '0x81d1a19cf7071732D4313c75dE8DD5b8CF697eFD';
    const L1WethGateway = await ethers.getContractAt(
        'L1ArbitrumExtendedGateway',
        network.name === 'rinkeby' ? L1WethGateway_ADDRESS_RINKEBY : L1WethGateway_ADDRESS_MAINNET
    );
    //const l1WethGatewayContract = L1WethGateway.attach(network.name === 'rinkeby' ? L1WethGateway_ADDRESS_RINKEBY : L1WethGateway_ADDRESS_MAINNET);

    // Send a transaction to buy the withdrawal that we just initiated by using the function:
    // transferExitAndCall(uint256 _exitNum, address _initialDestination, address _newDestination, bytes _newData, bytes _data)
    //const transferTx = await L1WethGateway.transferExitAndCall(1, ethWallet.address, mainContract.address, '', '');
    //console.log(JSON.stringify(transferTx));
});

const requireEnvVariables = (envVars: string[]) => {
    for (const envVar of envVars) {
      if (!process.env[envVar]) {
        throw new Error(`Error: set'${envVar}' in .env `);
      }
    }
};