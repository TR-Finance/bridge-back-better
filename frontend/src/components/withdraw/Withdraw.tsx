import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import { Box, Center, Heading, Text } from '@chakra-ui/react';

import { useEtherBalance } from '../../state/queries';

const Withdraw = () => {
    const { chainId, account, active } = useWeb3React<Web3Provider>();

    const { data: etherBalance, isLoading: etherBalanceLoading } = useEtherBalance(account || '');

    if (!active) {
        return <div>Please connect your wallet</div>
    }

    return (
        <>
            <Box
                p={5}
                shadow='md'
                borderWidth='1px'
                flex='1'
                borderRadius='md'
            >
                <Center flexDir={"column"}>
                    <Heading fontSize='xl'>B^3 Fast Withdrawal</Heading>
                    <Text mt={4}>Withdraw your ETH from Arbitrum without waiting 7 days</Text>
                    <Text mt={4}>Wallet balance: { etherBalanceLoading ? "Loading..." : etherBalance?.toString() } ETH</Text>
                </Center>
            </Box>
        </>
    );
};

export default Withdraw;
