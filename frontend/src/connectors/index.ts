import { ethers } from 'ethers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Provider } from '@ethersproject/providers';

export const injectedConnector = new InjectedConnector({
    supportedChainIds: [
      1, // Mainnet
      4, // Rinkeby
      42, // Kovan
      42161, // Arbitrum
      1337, // Dev (localhost:8545)
      31337, // Hardhat
    ],
});

export const getProvider = (chainId: number): Provider => {
    // TODO: Add providers for testnet and Arbitrum. Using getDefaultProvider() doesn't recognize balance on testnets or Arbitrum
    switch(chainId) {
        case 1:
            return ethers.getDefaultProvider();
        case 31337:
            return new ethers.providers.JsonRpcProvider('http://localhost:8545', { chainId: 31337, name: 'hardhat' });
        default:
            throw new Error('Unsupported provider');
    }
};
