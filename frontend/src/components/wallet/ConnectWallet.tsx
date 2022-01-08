import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Web3Provider } from '@ethersproject/providers';

import { Box, Button, Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react';
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
        <Box w='100%' p={1} display='flex' justifyContent={'flex-end'}>
            {error instanceof UnsupportedChainIdError && error.message}
            {active ? (
                <div>
                    <Tag size='md' key='connected wallet' variant='subtle' colorScheme='cyan' borderRadius='full'>
                        <TagLeftIcon boxSize='15px' as={MdOutlineCheckCircle} color='green' />
                        <TagLabel>{ account }</TagLabel>
                    </Tag>
                </div>
            ) : (
                <Button colorScheme='blue' onClick={onClick}>Connect Metmask</Button>
            )}
        </Box>
    );
};

export default ConnectWallet;
