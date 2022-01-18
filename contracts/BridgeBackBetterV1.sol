// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './interfaces/IBBBPoolV1.sol';

/**
 * @title Contract allowing users to bridge assets from Arbitrum to mainnet faster by selling their withdrawals.
 * @author Theo Ilie
 */
contract BridgeBackBetterV1 {
    struct ValidWithdrawalClaim {
        uint256 amount; // In wei
        uint256 withdrawalId;
        uint256 timestampToSlashAt; // The block after which the user can be slashed for the pool not receiving a valid withdrawal
    }

    struct NodeOperator {
        uint256 bondedBalance; // In wei
        uint256 lockedBondedBalance; // Balance is locked after verifying a transaction until the transaction completes
        ValidWithdrawalClaim[] withdrawalClaims;
    }

    address public owner;
    IBBBPoolV1[] public liqPools;
    mapping(address => NodeOperator) public nodeOperators;
    uint256 public totalAvailableBonded; // Total bonded that's not slashed or locked
    uint256 public stakerFee; // In wei
    uint256 public nodeOperatorFee; // In wei

    modifier onlyOwner() {
        require(msg.sender == owner, 'Only the contract owner can do this');
        _;
    }

    constructor(uint256 _stakerFee, uint256 _nodeOperatorFee) {
        owner = msg.sender;
        stakerFee = _stakerFee;
        nodeOperatorFee = _nodeOperatorFee;
    }

    function setStakerFee(uint256 _stakerFee) external onlyOwner {
        stakerFee = _stakerFee;
    }

    function setNodeOperatorFee(uint256 _nodeOperatorFee) external onlyOwner {
        nodeOperatorFee = _nodeOperatorFee;
    }

    function addLiqPool(IBBBPoolV1 liqPool) external onlyOwner {
        liqPools.push(liqPool);
    }

    /// Bond ether that can be slashed for verifying a transaction that turns out to be invalid.
    function bond() external payable {
        nodeOperators[msg.sender].bondedBalance += msg.value;
        totalAvailableBonded += msg.value;
    }

    /// Unbond `amount`.
    function unbond(uint256 amount) external {
        NodeOperator storage nodeOperator = nodeOperators[msg.sender];
        require(nodeOperator.bondedBalance >= amount, 'Insufficient unlocked balance');

        nodeOperator.bondedBalance -= amount;
        totalAvailableBonded -= amount;
    }

    /**
     * Verify that a withdrawal is valid and claim a fee.
     * Only callable by node operators with a high enough bond to cover losses.
     * @dev If `withdrawId` doesn't add `amount` to the pool within 7 days then the bonder will be slashed.
     * @param recipient The address that should receive the funds
     * @param amount The amount that the recipient should receive
     * @param withdrawalId The ID that was generated on Arbitrum and will be passed with a valid transaction in 7 days
     */
    function verifyWithdrawal(
        address recipient,
        uint256 amount,
        uint256 withdrawalId
    ) external {
        // Only node operators can verify withdrawals, and they must have enough bonded to be slashed for incorrect verification
        require(nodeOperators[msg.sender].bondedBalance >= amount, 'Not enough bonded');

        // Send the recipient the money for their withdraw (minus fees)
        liqPools[0].advanceWithdrawal(recipient, amount - nodeOperatorFee, stakerFee);

        // Update the bonder's and contract's balance
        nodeOperators[msg.sender].bondedBalance -= amount;
        nodeOperators[msg.sender].lockedBondedBalance += amount + nodeOperatorFee;
        totalAvailableBonded -= amount;

        // Add a claim saying that there will be a withdrawal with the ID 'withdrawalId' after
        // the challenge period (7 days) or else the node operator will be slashed
        nodeOperators[msg.sender].withdrawalClaims.push(
            ValidWithdrawalClaim(amount, withdrawalId, block.timestamp + 7 days)
        );
    }
}
