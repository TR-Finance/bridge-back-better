// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./interfaces/IBBBPoolV1.sol";

/// Pool for providing ether liquidity for Arbitrum fast withdrawals.
// TODO
contract BBBEthPoolV1 is IBBBPoolV1 {
    function distributeFee(uint256 amount) external override {

     }

    function provideLiq15Days(uint256 amount) external override {

    }

    function withdrawLiq(address farmer, uint256 amount) external override {

    }
    
    function getTotalBalance(address farmer) external view override returns (uint256) {

    }

    function getWithdrawableBalance(address farmer) external view override returns (uint256) {

    }

    function getTotalLiq() external view override returns (uint256) {

    }
}
