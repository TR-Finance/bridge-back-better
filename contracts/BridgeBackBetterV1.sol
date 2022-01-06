// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./interfaces/IBBBPoolV1.sol";
import "./interfaces/arbitrum/ITradeableExitReceiver.sol";

/**
 * @title Contract allowing users to bridge assets from Arbitrum to mainnet faster by selling their withdrawals.
 * @author Theo Ilie
 */
contract BridgeBackBetterV1 is ITradeableExitReceiver {
    address public owner;
    IBBBPoolV1[] liqPools;
    uint256 public fee;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can do this");
        _;
    }

    constructor(uint256 _fee) {
        owner = msg.sender;
        fee = _fee;
    }

    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    function addLiqPool(IBBBPoolV1 liqPool) external onlyOwner {
        liqPools.push(liqPool);
    }

    function onExitTransfer(
        address sender,
        uint256 exitNum,
        bytes calldata data
    ) external override returns (bool) {
        // TODO: Determine which asset we're receiving and get the corresponding pool. We'll assume it's eth for now

        // Make sure our pool has enough liquidity to buy the exit
        // TODO: require(liqPools[0].getTotalLiq() >= exitTicketAmt, "Pool does not have enough liquidity");

        // The withdrawal was transferred to us, so we can give them the exit liquidity (minus fee)
        // TODO: payable(initialDestination).transfer(exitTicketAmt - fee);
     }
 }
