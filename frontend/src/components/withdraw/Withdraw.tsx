import { ethers, providers, utils, Wallet } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import { Box, Center, Heading, Text } from '@chakra-ui/react';

import { useEtherBalance } from '../../state/queries';
import addresses from '../../contracts/contract-addresses.json';
import ArbitrumABI from '../../contracts/arbitrum/ArbitrumWithdrawalV1.json';

const Withdraw = () => {
  const { chainId, account, active } = useWeb3React<Web3Provider>();

  const { data: etherBalance, isLoading: etherBalanceLoading } = useEtherBalance(chainId || 0, account || '');

  if (!active) {
    return <div>Please connect your wallet</div>;
  }

  const Withdrawal = async () => {
    if (chainId !== 1337 && chainId !== 42161) {
      console.warn(
        "You're not running on Arbitrum One (mainnet) or Arbitrum Rinkeby (testnet). Fast withdrawals must " +
          "send transactions to the protocol's contract on either Arbitrum-Rinkeby or Arbitrum-mainnet. " +
          "Use the option '--network <arbitrumTestnet|arbitrumOne>'",
      );
      return;
    }

    // Make sure the contracts are deployed (the deploy step saves the ABI and address to a file)

    if (!window.ethereum) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum as any, 'any');

    if ((await provider.getCode(addresses.BBBEthPoolV1)) === '0x') {
      console.error('You need to deploy the BBBEthPoolV1 contract first');
      return;
    }
    if ((await provider.getCode(addresses.BridgeBackBetterV1)) === '0x') {
      console.error('You need to deploy the BridgeBackBetterV1 contract first');
      return;
    }

    console.log('Connecting wallet to provider on ' + chainId + '...');
    const arbProvider = new providers.JsonRpcProvider(process.env.ARBITRUM_RINKEBY_PROVIDER_URL);
    const arbWallet = new Wallet(process.env.RINKEBY_PRIVATE_KEY as string, arbProvider);
    const arbSigner = arbProvider.getSigner();

    const withdrawalContract = await new ethers.Contract(addresses.ArbitrumWithdrawalV1, ArbitrumABI.abi, arbSigner);
  };

  return (
    <>
      <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
        <Center flexDir={'column'}>
          <Heading fontSize="xl">B^3 Fast Withdrawal</Heading>
          <Text mt={4}>Withdraw your ETH from Arbitrum without waiting 7 days</Text>
          <Text mt={4}>Wallet balance: {parseFloat(utils.formatEther(etherBalance || 0)).toFixed(4)} ETH</Text>
        </Center>
      </Box>
    </>
  );
};

export default Withdraw;
