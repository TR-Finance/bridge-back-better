import TopNav from './components/nav/TopNav';
import Withdraw from './components/withdraw/Withdraw';

// List of network ids for deploying to other network later: https://docs.metamask.io/guide/ethereum-provider.html#properties
const HARDHAT_NETWORK_ID = '31337';

const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

/**
 * TODO: Make components for a page that will:
 * 1. Connect wallet
 * 2. Read balance and facilitate sending a tx to withdraw eth from L2 to L1
 * 3. Facilitate the user sending a tx that redirects their withdraw to our contract address.
 *      See https://github.com/OffchainLabs/arbitrum/blob/afa60b9ab2f8645fb292251d74f2adb42ecde047/packages/arb-bridge-peripherals/contracts/tokenbridge/ethereum/gateway/L1ArbitrumExtendedGateway.sol#L59-L76
 * 4. Listen for that tx to be successful from the WithdrawRedirected event: https://github.com/OffchainLabs/arbitrum/blob/afa60b9ab2f8645fb292251d74f2adb42ecde047/packages/arb-bridge-peripherals/contracts/tokenbridge/ethereum/gateway/L1ArbitrumExtendedGateway.sol#L50-L57
 * 5. Let the user know it was successful
 */
const Dapp = () => {
    return (
        <>
            <TopNav />
            <Withdraw />
        </>
    )
};

export default Dapp;
