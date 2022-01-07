// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./interfaces/IBBBPoolV1.sol";

/// Pool for providing ether liquidity for Arbitrum fast withdrawals.
contract BBBEthPoolV1 is IBBBPoolV1 {
    struct Balance {
        uint staked;
        UnstakingBalance[] unstaking;
    }

    struct UnstakingBalance {
        uint amount;
        uint timestampUnlocked;
    }

    mapping(address => Balance) balances;
    uint availableLiq;

    function distributeFee(uint amount) external override {
        // TODO
     }

    function provideLiq() external payable override {
        Balance storage balance = balances[msg.sender];
        balance.staked += msg.value;
        availableLiq += msg.value;
    }

    function unstake(uint amount) external override {
        Balance storage balance = balances[tx.origin];

        require(balance.staked >= amount, "Amount requested exceeds staked balance");

        balance.staked -= amount;
        balance.unstaking.push(UnstakingBalance(amount, block.timestamp + 7 days));
    }

    function withdrawBalance(uint amount) external override {
        // TODO: Withdraw as many elements of balances[tx.sender].unstaking as needed
    }

    function getTotalBalance(address farmer) external view override returns (uint) {
        return this.getStakedBalance(farmer) + this.getUnstakedBalance(farmer) + this.getWithdrawableBalance(farmer);
    }

    function getStakedBalance(address farmer) external view override returns (uint) {
        return balances[farmer].staked;
    }

    function getUnstakedBalance(address farmer) external view override returns (uint unstaked_) {
        Balance storage balance = balances[farmer];
        for (uint i = 0; i < balance.unstaking.length; i++) {
            UnstakingBalance storage unstaking = balance.unstaking[i];

            // Balance is still unstaking and not withdrawable until the current blocktime is at least `timestampUnlocked`
            if (block.timestamp < unstaking.timestampUnlocked) {
                unstaked_ += unstaking.amount;
            }
        }
    }

    function getWithdrawableBalance(address farmer) external view override returns (uint withdrawable_) {
        Balance storage balance = balances[farmer];
        for (uint i = 0; i < balance.unstaking.length; i++) {
            UnstakingBalance storage unstaking = balance.unstaking[i];

            // Balance is withdrawable once the current blocktime is at least `timestampUnlocked`
            if (block.timestamp >= unstaking.timestampUnlocked) {
                withdrawable_ += unstaking.amount;
            }
        }
    }

    function getAvailableLiq() external view override returns (uint) {
        return availableLiq;
    }
}
