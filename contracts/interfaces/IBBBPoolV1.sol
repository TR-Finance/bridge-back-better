// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * @title A pool to provide liquidity for "fast withdrawals" on Arbitrum.
 * @notice This pool only supports ether and requires staking for 15 days.
           If no one uses the ether within the first 8 days of staking, then they will
           be unlocked for withdrawal and not count as liquidity in the pool since they must
           be locked at least 7 days (the challenge period for Arbitrum).
 * @author Theo Ilie
 */
interface IBBBPoolV1 {
    /**
     * @notice Advance the withdrawal funds of a recipient immediately (don't make them wait 7 days).
     * @param recipient The address to send funds to
     * @param amount The amount of wei to send to the recipient
     * @param fee The amount of wei that the pool gets to keep in exchange for advancing the withdrawal
     */
    function advanceWithdrawal(address recipient, uint amount, uint fee) external;

    /**
     * @notice Distribute a fee (paid by withdrawer) to stakers, in proportion to each staker's stake
     * @param amount The total fee, in wei, to distribute
     */
    function distributeFee(uint amount) external;

    /// @notice Stake ether. Unstaking takes 7 days.
    function provideLiq() external payable;

    /// Start unstaking `amount` wei. Will be available to withdraw in 7 days.
    function unstake(uint amount) external;

    /// Withdraw `amount` wei.
    function withdrawBalance(uint amount) external;
    
    /**
     * @param farmer The address of the wallet to view total ether staked
     * @return Amount of ether that the address has in the pool, including ether that is unstaked or in the process of unstaking
     */
    function getTotalBalance(address farmer) external view returns (uint);

    /**
     * @param farmer The address of the wallet to view staked ether
     * @return Amount of ether that the address has staked
     */
    function getStakedBalance(address farmer) external view returns (uint);

    /**
     * @param farmer The address of the wallet to view unstaked ether
     * @return Amount of ether that the address has started unstaking but cannot withdraw yet
     */
    function getUnstakedBalance(address farmer) external view returns (uint);

    /**
     * @param farmer The address of the wallet to view withdrawable ether
     * @return Amount of ether that the address has unstaked and can withdraw
     */
    function getWithdrawableBalance(address farmer) external view returns (uint);
}
