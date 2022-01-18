import { ethers } from 'ethers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Provider } from '@ethersproject/providers';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as dotenv from 'dotenv';

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainnet
    4, // Rinkeby
    42, // Kovan
    42161, // Arbitrum
    421611, // Arbitrum Testnet
    1337, // Dev (localhost:8545)
    31337, // Hardhat
  ],
});

export const getProvider = (chainId: number): Provider => {
  // TODO: Add providers for testnet and Arbitrum. Using getDefaultProvider() doesn't recognize balance on testnets or Arbitrum
  switch (chainId) {
    case 1:
      return ethers.getDefaultProvider();
    case 31337:
      return new ethers.providers.JsonRpcProvider('http://localhost:8545', { chainId: 31337, name: 'hardhat' });
    case 4:
      return new ethers.providers.AlchemyProvider('rinkeby', process.env.REACT_APP_ETHEREUM_RINKEBY_PROVIDER_URL);
    case 1337:
      return new ethers.providers.JsonRpcProvider('http://localhost:8545');
    case 421611:
      return new ethers.providers.AlchemyProvider('arbitrum', process.env.REACT_APP_ARBITRUM_RINKEBY_PROVIDER_URL);
    default:
      throw new Error('Unsupported provider');
  }
};
