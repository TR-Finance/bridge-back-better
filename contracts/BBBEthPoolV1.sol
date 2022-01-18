// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './interfaces/IBBBPoolV1.sol';

/**
 * @title Pool for providing ether liquidity for Arbitrum fast withdrawals.
 * @author Theo Ilie
 */
contract BBBEthPoolV1 is IBBBPoolV1 {
    struct Balance {
        uint256 staked;
        UnstakingBalance[] unstaking;
    }

    struct UnstakingBalance {
        uint256 amount;
        uint256 timestampUnlocked; // TODO: With node operators we probably don't need a 7-day lockup anymore
    }

    /// Balances of stakers
    mapping(address => Balance) public balances;

    /// Amount of wei that's locked and ready to be used for fast withdrawals
    uint256 public availableLiq;

    /// Address of the BridgeBackBetterV1 contract
    address public protocol;

    modifier onlyProtocol() {
        require(msg.sender == protocol, 'Only the B3 protocol can do this');
        _;
    }

    constructor(address _protocol) {
        protocol = _protocol;
    }

    // TODO: Analyze this for attacks like reentrancy
    function advanceWithdrawal(
        address recipient,
        uint256 amount,
        uint256 fee
    ) external override onlyProtocol {
        require(availableLiq >= amount, 'Not enough liquidity staked');
        availableLiq -= amount;
        (bool success, ) = recipient.call{value: amount - fee}('');
        require(success, 'Transfer failed');
        // TODO: Add fee accounting to the pool
    }

    function distributeFee(uint256 amount) external override {
        // TODO
    }

    function provideLiq() external payable override {
        Balance storage balance = balances[msg.sender];
        balance.staked += msg.value;
        availableLiq += msg.value;
    }

    function unstake(uint256 amount) external override {
        Balance storage balance = balances[tx.origin];

        require(balance.staked >= amount, 'Amount requested exceeds staked balance');

        balance.staked -= amount;
        balance.unstaking.push(UnstakingBalance(amount, block.timestamp + 7 days));
    }

    function withdrawBalance(uint256 amount) external override {
        // TODO: Withdraw as many elements of balances[tx.sender].unstaking as needed
    }

    function getTotalBalance(address farmer) external view override returns (uint256) {
        return this.getStakedBalance(farmer) + this.getUnstakedBalance(farmer) + this.getWithdrawableBalance(farmer);
    }

    function getStakedBalance(address farmer) external view override returns (uint256) {
        return balances[farmer].staked;
    }

    function getUnstakedBalance(address farmer) external view override returns (uint256 unstaked_) {
        Balance storage balance = balances[farmer];
        for (uint256 i = 0; i < balance.unstaking.length; i++) {
            UnstakingBalance storage unstaking = balance.unstaking[i];

            // Balance is still unstaking and not withdrawable until the current blocktime is at least `timestampUnlocked`
            if (block.timestamp < unstaking.timestampUnlocked) {
                unstaked_ += unstaking.amount;
            }
        }
    }

    function getWithdrawableBalance(address farmer) external view override returns (uint256 withdrawable_) {
        Balance storage balance = balances[farmer];
        for (uint256 i = 0; i < balance.unstaking.length; i++) {
            UnstakingBalance storage unstaking = balance.unstaking[i];

            // Balance is withdrawable once the current blocktime is at least `timestampUnlocked`
            if (block.timestamp >= unstaking.timestampUnlocked) {
                withdrawable_ += unstaking.amount;
            }
        }
    }
}
