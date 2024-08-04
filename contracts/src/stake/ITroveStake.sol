// SPDX-License-Identifier: GPL-3.0-only
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

/// @custom:security-contact devalston390@gmail.com
interface ITroveStake {
    struct Stake {
        uint256 amount;
        uint256 start;
        bool active;
        uint256 claimed;
    }

    /**
     * @dev Emit stake `amount` tokens from the caller.
     * @param user The address of the user that is staking
     * @param amount The amount of tokens that the user is staking
     */
    event Staked(address indexed user, uint256 amount);

    /**
     * @dev Emit withdraw `amount` tokens from the caller.
     * @param user The address of the user that is withdrawing their stake
     * @param amount The amount of tokens that the user is withdrawing
     */
    event Withdrawn(address indexed user, uint256 amount);

    /**
     * @dev Emit claim `reward` tokens from the caller.
     * @param user The address of the user that is claiming their reward
     * @param reward The amount of tokens that the user is claiming
     */
    event Claimed(address indexed user, uint256 reward);

    /**
     * @dev The amount of tokens that the user is staking is invalid
     * @param amount The amount of tokens that the user is staking
     */
    error InvalidStakeAmount(uint256 amount);

    /**
     * @dev The user has insufficient TRV1 token to stake
     * @param balance The balance of the user
     * @param amount The amount of tokens that the user wants to stake
     */
    error InsufficientBalance(uint256 balance, uint256 amount);

    /**
     * @dev The smart contract is not authorized to transfer the tokens
     * from the user's address to the smart contract address
     * @param sender The address of the smart contract
     * @param owner The address of the user
     * @param amount The amount of tokens that the user wants to stake
     */
    error UnAuthorizedToTransfer(address sender, address owner, uint256 amount);

    /**
     * @dev The user has already claimed the reward for the stake
     * @param stake The stake id that the user wants to claim
     */
    error RewardAlreadyClaimed(uint256 stake);

    /**
     * @dev The user has insufficient reward to claim
     * @param stake The stake id that the user wants to claim
     * @param amount The amount of tokens that the user wants to claim
     */
    error InsucfficientReward(uint256 stake, uint256 amount);

    /**
     * @dev The stake is already inactive - indicating that the user has
     * already withdrawn
     * @param stake The id of the stake that the user wants to withdraw
     */
    error StakeAlreadyWithdrawn(uint256 stake);

    /**
     * @dev The stake period is too short to calculate the reward or withdrawal of
     * the stake
     * @param start the start time of the stake in unix timestamp
     * @param end the end time of the stake in unix timestamp
     */
    error StakePeriodTooShort(uint256 start, uint256 end);

    /**
     * @dev The claimable quota is less than the amount of reward that the user wants to claim
     * @param amount The amount of reward that the user wants to claim
     * @param quota The amount of claimable quota remaining for the day
     */
    error ClaimableQuotaExceed(uint256 amount, uint256 quota);

    /**
     * @dev The stake index is invalid
     * @param index The index of the stake in the stakes array
     */
    error InvalidStakeIndex(uint256 index);

    /**
     * @dev The stake is not found
     * @param account The address of the account
     * @param index The index of the stake in the stakes array
     */
    error StakeNotFound(address account, uint256 index);

    /**
     * @dev The claim amount is invalid
     * @param amount The amount of reward that the user wants to claim
     */
    error InvalidClaimAmount(uint256 amount);

    /**
     * @dev Returns the current claimable quota for the stakers
     */
    function currentQuota() external view returns (uint256);

    /**
     * @dev Returns the total claimable rewards of the account
     * @param account The address of the account to check the claimable rewards
     */
    function claimableRewards(address account) external view returns (uint256);

    /**
     * @dev Returns the total claimable rewards of the account
     * @param account The address of the account to check the claimable rewards
     * @param _stake The stake id (The index of the stake in the stakes array)
     */
    function stakeClaimableRewards(address account, uint256 _stake) external view returns (uint256);

    /**
     * @dev Returns the total active stakes of the account
     * @param account The address of the account to check the active stakes
     * @return The total amount of active stakes of the account
     */
    function accountActiveStakes(address account) external view returns (uint256);

    /**
     * @dev Returns the stake status of the account
     * @param account The address of the account to check the stake status
     * @return The stakes of the account
     */
    function stakeStatus(address account) external view returns (Stake[] memory);

    /**
     * @dev Stake `amount` tokens from the caller.
     * @param amount The amount of tokens that the user wants to stake
     * @return A boolean that indicates if the operation was successful.
     */
    function stake(uint256 amount) external returns (bool);

    /**
     * @dev Withdraw all the staked tokens from the caller given the stake id.
     * The stake will be set as inactive and all the remaining rewards will be
     * transferred to the user.
     * @param _stake The stake id (The index of the stake in the stakes array)
     * @return A boolean that indicates if the operation was successful.
     */
    function withdraw(uint256 _stake) external returns (bool);

    /**
     * @dev Claim the reward from the stake given the stake id and the amount of reward
     * @param _stake The stake id (The index of the stake in the stakes array)
     * @param amount The amount of reward that the user wants to claim
     * @return A boolean that indicates if the operation was successful.
     */
    function claim(uint256 _stake, uint256 amount) external returns (bool);
}
