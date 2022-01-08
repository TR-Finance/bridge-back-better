import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Web3Provider } from '@ethersproject/providers';

import { Icon } from '@chakra-ui/react';
import { MdOutlineCheckCircle } from 'react-icons/md';

const ConnectWallet = () => {
    const injectedConnector = new InjectedConnector({
        supportedChainIds: [
          1, // Mainnet
          4, // Rinkeby
          42, // Kovan
          42161, // Arbitrum
          1337, // Dev (localhost:8545)
          31337, // Hardhat
        ],
    });

    const { chainId, account, activate, active, error } = useWeb3React<Web3Provider>();

    const onClick = () => {
        activate(injectedConnector);
    };

    return (
        <div>
        <div>ChainId: {chainId}</div>
        {error instanceof UnsupportedChainIdError && error.message}
        {active ? (
            <div>
                <Icon as={MdOutlineCheckCircle} color='green' />
                { account }
            </div>
        ) : (
            <button type="button" onClick={onClick}>
            Connect Metmask
            </button>
        )}
        </div>
    );
};

export default ConnectWallet;
