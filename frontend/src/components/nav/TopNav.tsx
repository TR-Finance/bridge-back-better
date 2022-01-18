import { Box, Button, HStack, Center } from '@chakra-ui/react';

import ConnectWallet from '../wallet/ConnectWallet';

const TopNav = () => {
  return (
    <>
      <HStack
        justify={'stretch'}
        borderBottomWidth={2}
        bg={'whitesmoke'}
        borderBottomColor={'lightgray'}
        paddingLeft={2}
        paddingRight={2}
      >
        <Box w="100%" p={1}>
          <Box bg={'black'} h="50px" w="50px" p={4} color={'white'}>
            <Center>B^3</Center>
          </Box>
        </Box>
        <Box w="100%" display="flex" justifyContent="space-between" paddingLeft="20%" paddingRight="20%">
          <Button colorScheme="red" variant="ghost">
            Withdraw
          </Button>
          <Button colorScheme="red" variant="ghost">
            Stake
          </Button>
        </Box>
        <Box w="100%" p={1}>
          <ConnectWallet />
        </Box>
      </HStack>
    </>
  );
};

export default TopNav;
