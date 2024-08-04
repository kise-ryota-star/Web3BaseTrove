// SPDX-License-Identifier: GPL-3.0-only
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import {ITrove1} from "../trove-1/ITrove1.sol";
import {Trove2} from "../trove-2/Trove2.sol";
import {ITroveStake} from "./ITroveStake.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact devalston390@gmail.com
contract TroveStake is ITroveStake, Ownable {
    uint256 private constant SCALING_FACTOR = 1e18;

    ITrove1 public immutable trove1;
    Trove2 public immutable trove2;
    uint256 public immutable dailyQuota;

    uint256 public totalStaked;
    uint256 public totalClaimed;
    uint256 public totalStakesCount;
    uint256 private _claimableQuota = dailyQuota;
    uint256 private _lastUpdateTime;

    uint256 private _baseRate = 6e14;

    mapping(address => Stake[]) public stakes;
    mapping(address => uint256) public withdrawalsUnclaimRewards;

    /**
     * Init the Trove1 smart contract address and publish Trove2 smart contract address
     * to the blockchain
     * @param trove1Address The address of the Trove1 contract
     * @param _dailyQuota The daily claimable quota for the stakers
     */
    constructor(address trove1Address, uint256 _dailyQuota) Ownable(_msgSender()) {
        trove1 = ITrove1(trove1Address);
        trove2 = new Trove2(_msgSender(), address(this));
        dailyQuota = _dailyQuota;
    }

    /**
     * @dev check if the time elapsed is greater than 24 hours.
     * Update the last update time and set the claimable quota to the daily quota
     */
    modifier calculateQuota() {
        uint256 secondsElapsed = block.timestamp - _lastUpdateTime;
        uint256 daysElapsed = secondsElapsed / 86400;
        if (daysElapsed >= 0) {
            _lastUpdateTime += daysElapsed * 86400;
            _claimableQuota = dailyQuota;
        }
        _;
    }

    /**
     * @dev Calculate the rewards of the stake given the stake id
     * @param _stake The stake id (The index of the stake in the stakes array)
     * @return The amount of reward that the user will receive
     */
    function calculateRewards(Stake memory _stake) internal view returns (uint256) {
        uint256 secondsElapsed = block.timestamp - _stake.start;
        uint256 daysElapsed = secondsElapsed / 86400;

        if (daysElapsed <= 0) return 0;

        uint256 reward = (_stake.amount * _baseRate) / SCALING_FACTOR * daysElapsed;
        return reward;
    }

    /**
     * @dev Returns the current claimable quota for the stakers
     */
    function currentQuota() external view returns (uint256) {
        uint256 secondsElapsed = block.timestamp - _lastUpdateTime;
        uint256 daysElapsed = secondsElapsed / 86400;
        if (daysElapsed > 0) {
            return dailyQuota;
        } else {
            return _claimableQuota;
        }
    }

    /**
     * @dev Stake `amount` tokens from the caller.
     * @param amount The amount of tokens that the user wants to stake
     * @return A boolean that indicates if the operation was successful.
     */
    function stake(uint256 amount) external returns (bool) {
        if (amount <= 0) {
            revert InvalidStakeAmount(amount);
        }

        if (amount > trove1.balanceOf(_msgSender())) {
            revert InsufficientBalance(trove1.balanceOf(_msgSender()), amount);
        }

        // The user must approve the smart contract to transfer the tokens and
        // the allowance must be >= the amount of tokens that the user wants to stake
        if (trove1.allowance(_msgSender(), address(this)) < amount) {
            revert UnAuthorizedToTransfer(address(this), _msgSender(), amount);
        }

        trove1.transferFrom(_msgSender(), address(this), amount);

        Stake memory tokenStake = Stake(amount, block.timestamp, true, 0);
        stakes[_msgSender()].push(tokenStake);

        totalStaked += amount;
        totalStakesCount += 1;

        emit Staked(_msgSender(), amount);

        return true;
    }

    /**
     * @dev Withdraw all the staked tokens from the caller given the stake id.
     * The stake will be set as inactive and all the remaining rewards will be
     * transferred to the user.
     * @param _stake The stake id (The index of the stake in the stakes array)
     * @return A boolean that indicates if the operation was successful.
     */
    function withdraw(uint256 _stake) external calculateQuota returns (bool) {
        Stake storage tokenStake = stakes[_msgSender()][_stake];

        if (!tokenStake.active) {
            revert StakeAlreadyWithdrawn(_stake);
        }

        uint256 reward = calculateRewards(tokenStake);

        // Claim all the remaining rewards before withdrawing
        if (tokenStake.claimed < reward) {
            uint256 unclaimedAmount = reward - tokenStake.claimed;
            if (unclaimedAmount <= _claimableQuota) {
                trove2.mint(_msgSender(), unclaimedAmount);
                tokenStake.claimed += unclaimedAmount;
                totalClaimed += unclaimedAmount;
                _claimableQuota -= unclaimedAmount;
            } else {
                withdrawalsUnclaimRewards[_msgSender()] += unclaimedAmount;
            }
        }

        // Return the staked tokens to the user
        trove1.transfer(_msgSender(), tokenStake.amount);
        tokenStake.active = false;
        totalStaked -= tokenStake.amount;
        totalStakesCount -= 1;

        emit Withdrawn(_msgSender(), tokenStake.amount);

        return true;
    }

    /**
     * @dev Claim the reward from the stake given the stake id and the amount of reward
     * @param _stake The stake id (The index of the stake in the stakes array)
     * @param amount The amount of reward that the user wants to claim
     * @return A boolean that indicates if the operation was successful.
     */
    function claim(uint256 _stake, uint256 amount) external calculateQuota returns (bool) {
        Stake storage tokenStake = stakes[_msgSender()][_stake];

        uint256 reward = calculateRewards(tokenStake);

        if (!tokenStake.active) {
            // If the account has already withdrawn the stake, but the claimable quota
            // has reached the daily quota, the user can claim the remaining rewards
            // by sending another claim transaction later to here.
            uint256 unclaimedAmount = withdrawalsUnclaimRewards[_msgSender()];
            if (unclaimedAmount > 0) {
                if (unclaimedAmount <= _claimableQuota) {
                    trove2.mint(_msgSender(), unclaimedAmount);
                    totalClaimed += unclaimedAmount;
                    withdrawalsUnclaimRewards[_msgSender()] = 0;
                } else {
                    revert ClaimableQuotaExceed(unclaimedAmount, _claimableQuota);
                }
            } else {
                // If the account has already withdrawn the stake, but have no remaining
                // rewards to claim, revert the transaction
                revert StakeAlreadyWithdrawn(_stake);
            }
        }

        // User has no rewards to claim
        if (reward <= 0) {
            revert StakePeriodTooShort(tokenStake.start, block.timestamp);
        }

        uint256 claimed = tokenStake.claimed;

        if (claimed + amount > reward) {
            revert RewardAlreadyClaimed(_stake);
        }

        if (amount > _claimableQuota) {
            revert ClaimableQuotaExceed(amount, _claimableQuota);
        }

        trove2.mint(_msgSender(), amount);
        tokenStake.claimed += amount;
        totalClaimed += amount;
        _claimableQuota -= amount;

        emit Claimed(_msgSender(), reward);

        return true;
    }

    /**
     * @dev Returns the stake status of the account
     * @param account The address of the account to check the stake status
     * @return The stakes of the account
     */
    function stakeStatus(address account) external view returns (Stake[] memory) {
        return stakes[account];
    }

    /**
     * @dev Returns the total active stakes of the account
     * @param account The address of the account to check the active stakes
     * @return The total amount of active stakes of the account
     */
    function accountActiveStakes(address account) external view returns (uint256) {
        if (stakes[account].length == 0) {
            return 0;
        }

        Stake[] memory accountStakes = stakes[account];
        uint256 total = 0;
        for (uint256 i = 0; i < accountStakes.length; i++) {
            if (accountStakes[i].active) {
                total += accountStakes[i].amount;
            }
        }
        return total;
    }

    /**
     * @dev Returns the total claimable rewards of the account
     */
    function claimableRewards(address account) external view returns (uint256) {
        if (stakes[account].length == 0) {
            return 0;
        }

        Stake[] memory accountStakes = stakes[account];
        uint256 total = 0;
        for (uint256 i = 0; i < accountStakes.length; i++) {
            if (accountStakes[i].active) {
                total += calculateRewards(accountStakes[i]);
            }
        }
        return total;
    }

    function stakeClaimableRewards(address account, uint256 _stake) external view returns (uint256) {
        if (stakes[account].length == 0) {
            return 0;
        }

        Stake memory accountStakes = stakes[account][_stake];

        if (!accountStakes.active) {
            return 0;
        }

        return calculateRewards(accountStakes);
    }
}
