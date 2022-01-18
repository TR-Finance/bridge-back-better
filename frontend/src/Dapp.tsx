import TopNav from './components/nav/TopNav';
import Withdraw from './components/withdraw/Withdraw';
import { useEagerConnect, useInactiveListener } from './hooks/connectorHooks';

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
  // Try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEagerConnect = useEagerConnect();

  // When there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEagerConnect);

  return (
    <>
      <TopNav />
      <Withdraw />
    </>
  );
};

export default Dapp;
