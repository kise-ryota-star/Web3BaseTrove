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

    function mint_and_approve() internal {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        trove1.mint{value: maxMintPerTx * mintCost}(alice, maxMintPerTx);

        vm.prank(alice);
        trove1.approve(address(troveStake), maxMintPerTx * 1e18);

        vm.deal(bob, 1 ether);
        vm.prank(bob);
        trove1.mint{value: maxMintPerTx * mintCost}(bob, maxMintPerTx);

        vm.prank(bob);
        trove1.approve(address(troveStake), maxMintPerTx * 1e18);
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
    }

    function test_claim() external {
        mint_and_approve();

        vm.prank(alice);
        troveStake.stake(10_000e18);
        vm.prank(bob);
        troveStake.stake(5_000e18);
        assertEq(troveStake.totalStaked(), 15_000e18);
        assertEq(troveStake.totalStakesCount(), 2);

        vm.warp(vm.getBlockTimestamp() + 86400);
        uint256 claimable = troveStake.stakeClaimableRewards(alice, 0);
        assertEq(troveStake.claimableRewards(alice), claimable);

        vm.prank(alice);
        troveStake.claim(0, claimable);

        assertEq(troveStake.totalStaked(), 15_000e18); // Should not change
        assertEq(troveStake.totalStakesCount(), 2); // Should not change
        assertEq(troveStake.accountActiveStakes(alice), 10_000e18); // Should not change

        assertEq(troveStake.currentQuota(), troveStake.dailyQuota() - claimable);

        assertEq(troveStake.trove2().totalSupply(), claimable);
    }

    function test_withdraw() external {
        mint_and_approve();

        vm.prank(alice);
        troveStake.stake(10_000e18);
        // Bob stakes 5_000e18 twice
        vm.prank(bob);
        troveStake.stake(5_000e18);
        vm.prank(bob);
        troveStake.stake(5_000e18);
        assertEq(troveStake.accountActiveStakes(bob), 10_000e18); // Should change

        assertEq(troveStake.totalStaked(), 20_000e18);
        assertEq(troveStake.totalStakesCount(), 3);

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
    }
}
