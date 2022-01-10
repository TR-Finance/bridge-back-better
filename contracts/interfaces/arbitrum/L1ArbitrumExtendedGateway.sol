// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

// See https://github.com/OffchainLabs/arbitrum/blob/afa60b9ab2f8645fb292251d74f2adb42ecde047/packages/arb-bridge-peripherals/contracts/tokenbridge/ethereum/gateway/L1ArbitrumExtendedGateway.sol
contract L1ArbitrumExtendedGateway {
    event WithdrawRedirected(
        address indexed from,
        address indexed to,
        uint256 indexed exitNum,
        bytes newData,
        bytes data,
        bool madeExternalCall
    );

    /**
     * @notice Allows a user to redirect their right to claim a withdrawal to another address.
     * @dev This method also allows you to make an arbitrary call after the transfer.
     * This does not validate if the exit was already triggered. It is assumed the `_exitNum` is
     * validated off-chain to ensure this was not yet triggered.
     * @param _exitNum Sequentially increasing exit counter determined by the L2 bridge
     * @param _initialDestination address the L2 withdrawal call initially set as the destination.
     * @param _newDestination address the L1 will now call instead of the previously set destination
     * @param _newData data to be used in inboundEscrowAndCall
     * @param _data optional data for external call upon transfering the exit
     */
    function transferExitAndCall(
        uint256 _exitNum,
        address _initialDestination,
        address _newDestination,
        bytes calldata _newData,
        bytes calldata _data
    ) external {}
}
