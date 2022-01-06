/**
 * TODO: Make a page that will:
 * 1. Connect wallet
 * 2. Read balance and facilitate sending a tx to withdraw eth from L2 to L1
 * 3. Facilitate the user sending a tx that redirects their withdraw to our contract address.
 *      See https://github.com/OffchainLabs/arbitrum/blob/afa60b9ab2f8645fb292251d74f2adb42ecde047/packages/arb-bridge-peripherals/contracts/tokenbridge/ethereum/gateway/L1ArbitrumExtendedGateway.sol#L59-L76
 * 4. Listen for that tx to be successful from the WithdrawRedirected event: https://github.com/OffchainLabs/arbitrum/blob/afa60b9ab2f8645fb292251d74f2adb42ecde047/packages/arb-bridge-peripherals/contracts/tokenbridge/ethereum/gateway/L1ArbitrumExtendedGateway.sol#L50-L57
 * 5. Let the user know it was successful
 */