// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Trove1} from "../src/trove-1/Trove1.sol";
import {TroveStake} from "../src/stake/TroveStake.sol";

contract TroveStakeTest is Test {
    Trove1 public trove1;
    TroveStake public troveStake;
    address owner = makeAddr("owner");
    address minter = makeAddr("minter");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address john = makeAddr("john");

    uint256 public constant totalSupply = 21_000_000;
    uint256 public constant preMintAmount = 25_000;
    uint256 public constant mintCost = 10000 wei;
    uint256 public constant maxMintPerTx = 10_000;

    function setUp() public {
        vm.startPrank(owner);
        trove1 = new Trove1(totalSupply, preMintAmount, mintCost, maxMintPerTx);
        troveStake = new TroveStake(address(trove1), 15_000e18);

        vm.stopPrank();
    }

    function test_view() external view {
        assertEq(troveStake.totalStaked(), 0);
        assertEq(troveStake.dailyQuota(), 15_000e18);
        assertEq(troveStake.currentQuota(), 15_000e18);
        assertEq(troveStake.totalStakesCount(), 0);
        assertEq(troveStake.totalClaimed(), 0);
    }

    function mint_and_approve() internal {
        // Alice mints 10_000 tokens
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        trove1.mint{value: maxMintPerTx * mintCost}(alice, maxMintPerTx);
        trove1.approve(address(troveStake), maxMintPerTx * 1e18);
        vm.stopPrank();

        // Bob mints 10_000 tokens
        vm.deal(bob, 1 ether);
        vm.startPrank(bob);
        trove1.mint{value: maxMintPerTx * mintCost}(bob, maxMintPerTx);
        trove1.approve(address(troveStake), maxMintPerTx * 1e18);
        vm.stopPrank();

        // John mints a total of 200_000 tokens
        vm.deal(john, 10 ether);
        vm.startPrank(john);
        for (uint256 i = 0; i < 20; i++) {
            trove1.mint{value: maxMintPerTx * mintCost}(john, maxMintPerTx);
        }
        trove1.approve(address(troveStake), 200_000 * 1e18);
        vm.stopPrank();
    }

    /**
     * @dev Test if the metadata of the token is correct
     */
    function test_stake() external {
        mint_and_approve();
        assertEq(troveStake.totalStaked(), 0);
        assertEq(troveStake.dailyQuota(), 15_000e18);

        vm.prank(alice);
        troveStake.stake(10_000e18);
        assertEq(troveStake.totalStaked(), 10_000e18);
        assertEq(troveStake.totalStakesCount(), 1);

        vm.prank(bob);
        troveStake.stake(5_000e18);
        assertEq(troveStake.totalStaked(), 15_000e18);
        assertEq(troveStake.totalStakesCount(), 2);

        vm.expectRevert();
        troveStake.stake(1e18);

        vm.startPrank(john);
        // John stakes 100_000e18 tokens
        troveStake.stake(100_000e18);
        assertEq(troveStake.totalStaked(), 115_000e18);
        assertEq(troveStake.totalStakesCount(), 3);
        vm.stopPrank();
    }

    function test_claim() external {
        mint_and_approve();

        // Alice stakes 10_000e18 tokens and Bob stakes 5_000e18 tokens
        vm.prank(alice);
        troveStake.stake(10_000e18);
        vm.prank(bob);
        troveStake.stake(5_000e18);

        // The total staked tokens should be 15_000e18 and
        // the total stakes count should be 2
        assertEq(troveStake.totalStaked(), 15_000e18);
        assertEq(troveStake.totalStakesCount(), 2);

        // Fast forward 1 day
        vm.warp(vm.getBlockTimestamp() + 86400);
        // Alice should already have a claimable reward
        uint256 claimable = troveStake.stakeClaimableRewards(alice, 0);
        assertEq(troveStake.claimableRewards(alice), claimable);

        vm.prank(alice);
        troveStake.claim(0, claimable);

        assertEq(troveStake.totalClaimed(), claimable);
        assertEq(troveStake.totalStaked(), 15_000e18); // Should not change
        assertEq(troveStake.totalStakesCount(), 2); // Should not change
        assertEq(troveStake.accountActiveStakes(alice), 10_000e18); // Should not change

        // The quota of clamable rewards will be used up by the claim
        assertEq(troveStake.currentQuota(), troveStake.dailyQuota() - claimable);
        assertEq(troveStake.trove2().totalSupply(), claimable);

        // John stakes 100_000e18 tokens
        vm.prank(john);
        troveStake.stake(100_000e18);

        assertEq(troveStake.totalStaked(), 115_000e18);
        assertEq(troveStake.totalStakesCount(), 3);

        // Fast forward 1 day
        vm.warp(vm.getBlockTimestamp() + 86400);
        // John should already have a claimable reward
        claimable = troveStake.stakeClaimableRewards(john, 0);
        // The claimable rewards of John should be more than 60e18
        // as the amount multiplier is 1.2
        assertEq(troveStake.claimableRewards(john), claimable);
        console.log("Claimable: %d", claimable);

        // Fast forward 91 days
        vm.warp(vm.getBlockTimestamp() + (86400 * 90));
        // John should already have a claimable reward that has
        // time multiplier of 1.2 and amount multiplier of 1.2
        claimable = troveStake.stakeClaimableRewards(john, 0);
        assertEq(troveStake.claimableRewards(john), claimable);
        console.log("Claimable: %d", claimable);
    }

    function test_withdraw() external {
        mint_and_approve();

        // Alice stakes 10_000e18 tokens
        vm.prank(alice);
        troveStake.stake(10_000e18);
        // Bob stakes 5_000e18 twice
        vm.prank(bob);
        troveStake.stake(5_000e18);
        vm.prank(bob);
        troveStake.stake(5_000e18);
        assertEq(troveStake.accountActiveStakes(bob), 10_000e18);

        // A total of 3 stakes have been made
        assertEq(troveStake.totalStaked(), 20_000e18);
        assertEq(troveStake.totalStakesCount(), 3);

        // Fast forward 1 week
        vm.warp(vm.getBlockTimestamp() + (86400 * 7));
        uint256 claimableOne = troveStake.stakeClaimableRewards(bob, 0);
        uint256 claimableTwo = troveStake.stakeClaimableRewards(bob, 1);
        assertEq(troveStake.claimableRewards(bob), claimableOne + claimableTwo);

        vm.prank(bob);
        troveStake.withdraw(0);

        assertEq(troveStake.totalStaked(), 15_000e18); // Should change
        assertEq(troveStake.totalStakesCount(), 2); // Should change
        assertEq(troveStake.accountActiveStakes(bob), 5_000e18); // Should change

        assertEq(trove1.balanceOf(bob), 5_000e18);
        assertEq(troveStake.currentQuota(), troveStake.dailyQuota() - claimableOne);

        assertEq(troveStake.trove2().totalSupply(), claimableOne);

        // Bob attempts to claim the withdrawn rewards will fail
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("StakeAlreadyWithdrawn(uint256)")), 0));
        vm.prank(bob);
        troveStake.claim(0, claimableOne);

        // Random address attempts to withdraw
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("StakeNotFound(address,uint256)")), makeAddr("random"), 0)
        );
        vm.prank(makeAddr("random"));
        troveStake.claim(0, 10e18);

        // John stakes 100_000e18 tokens
        vm.prank(john);
        troveStake.stake(120_000e18);
        assertEq(trove1.balanceOf(john), 80_000e18);

        assertEq(troveStake.totalStaked(), 135_000e18);
        assertEq(troveStake.totalStakesCount(), 3);

        // Fast forward 311 days
        vm.warp(vm.getBlockTimestamp() + (86400 * 311));
        // John should already have a claimable reward that has
        // time multiplier of 1.5 and amount multiplier of 1.5
        uint256 claimable = troveStake.stakeClaimableRewards(john, 0);
        assertEq(troveStake.claimableRewards(john), claimable);
        console.log("Claimable: %d", claimable);

        vm.prank(john);
        troveStake.withdraw(0);

        // The rewards of John will not get claimed as the quota is not enough
        assertEq(troveStake.claimableRewards(john), claimable);
        assertEq(troveStake.currentQuota(), troveStake.dailyQuota());
        assertEq(troveStake.trove2().totalSupply(), claimableOne);
        assertEq(troveStake.totalClaimed(), claimableOne);

        // John can try to claim the remaining rewards
        vm.startPrank(john);
        troveStake.claim(0, troveStake.dailyQuota());

        vm.stopPrank();

        assertEq(trove1.balanceOf(john), 200_000e18);
        assertEq(troveStake.claimableRewards(john), claimable - troveStake.dailyQuota());
        assertEq(troveStake.currentQuota(), 0);
        assertEq(troveStake.trove2().totalSupply(), claimableOne + troveStake.dailyQuota());
        assertEq(troveStake.totalClaimed(), claimableOne + troveStake.dailyQuota());

        // John can try to claim the remaining rewards but will fail
        vm.prank(john);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("ClaimableQuotaExceed(uint256,uint256)")), 10e18, 0));
        troveStake.claim(0, 10e18);
        vm.stopPrank();
    }
}
