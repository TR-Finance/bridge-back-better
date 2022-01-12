// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./interfaces/arbitrum/ArbSys.sol";

/**
 * @title Allows for a L2->L1 withdrawal that records an event for BBB nodes to listen to.
 * @author Theo Ilie
 */
contract ArbitrumWithdrawalV1 {
    ArbSys constant private ARB_SYS = ArbSys(0x0000000000000000000000000000000000000064);
    uint constant public MIN_WEI_TO_WITHDRAW = 1000000000000;

    /**
     * @param sender The sender who is withdrawing from Arbitrum
     * @param destination The destination that the sender is withdrawing to. This should be a BBB pool
     * @param amount The wei-denominated amount withdrawn
     */
    event WithdrawInitiated(address indexed sender, address indexed destination, uint amount, uint indexed withdrawalId);

    /// Withdraw to `destination` on Ethereum.
    function withdraw(address destination) external payable returns (uint withdrawalId_) {
        require (msg.value > MIN_WEI_TO_WITHDRAW, "Withdraw amount too low");

        withdrawalId_ = ARB_SYS.withdrawEth(destination);
        emit WithdrawInitiated(msg.sender, destination, msg.value, withdrawalId_);
    }
}