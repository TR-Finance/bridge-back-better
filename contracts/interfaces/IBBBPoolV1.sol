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
     * @notice Distributes a fee (paid by withdrawer) to stakers, in proportion to each staker's stake
     * @param amount The total fee, in ether, to distribute
     */
    function distributeFee(uint256 amount) external;

    /**
     * @notice Stakes ether for 15 days, locking it up for the full 15 days if someone
     *        uses it for a fast withdrawal, or for only 8 days if no one uses it.
     * @param amount The amount of ether to stake
     */
    function provideLiq15Days(uint256 amount) external;

    /**
     * @notice Unstakes ether if it's locked for <7 days.
     * @param farmer The address of the wallet who staked the ether
     * @param amount The amount of ether to unstake
     */
    function withdrawLiq(address farmer, uint256 amount) external;
    
    /**
     * @param farmer The address of the wallet to view total ether staked
     * @return Amount of ether that the address has staked
     */
    function getTotalBalance(address farmer) external view returns (uint256);

    /**
     * @param farmer The address of the wallet to view withdrawable ether staked
     * @return Amount of withdrawable (not locked) ether that the address has staked
     */
    function getWithdrawableBalance(address farmer) external view returns (uint256);

    /**
     * @notice This excludes liquidity that is locked for <7 days.
     * @return Amount of ether available in the pool for fast withdrawals
     */
    function getTotalLiq() external view returns (uint256);
}
