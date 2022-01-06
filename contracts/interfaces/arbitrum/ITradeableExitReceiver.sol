// Address that can have an Arbitrum withdrawal transferred to it, triggering onExitTransfer.
// See https://github.com/OffchainLabs/arbitrum/blob/afa60b9ab2f8645fb292251d74f2adb42ecde047/packages/arb-bridge-peripherals/contracts/tokenbridge/ethereum/gateway/L1ArbitrumExtendedGateway.sol#L25-L31
interface ITradeableExitReceiver {
    function onExitTransfer(
        address sender,
        uint256 exitNum,
        bytes calldata data
    ) external returns (bool);
}
