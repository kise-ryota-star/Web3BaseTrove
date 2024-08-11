// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {TroveAuction} from "../src/auction/TroveAuction.sol";
import {Trove2} from "../src/trove-2/Trove2.sol";

contract TroveAuctionTest is Test {
    TroveAuction public troveAuction;
    Trove2 public trove2;
    uint256 public trove2Decimals;

    address owner = makeAddr("owner");
    address minter = makeAddr("minter");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address john = makeAddr("john");

    string public constant baseUri = "https://gateway.pinata.cloud/ipfs/QmbDtyGBcHprjwQCVRWTdgSPbUAVyb8d7EjzzLJgjX7AB7/";

    function setUp() external {
        vm.startPrank(owner);
        trove2 = new Trove2(owner, minter);
        troveAuction = new TroveAuction(address(trove2), baseUri);
        trove2Decimals = (10 ** trove2.decimals());
        vm.stopPrank();
    }

    function trove2Mint() public {
        // Mint 20_000 tokens to everyone
        vm.deal(owner, 1 ether);
        vm.startPrank(owner);
        trove2.mint(owner, 200_000 * trove2Decimals);
        trove2.mint(alice, 200_000 * trove2Decimals);
        trove2.mint(bob, 200_000 * trove2Decimals);
        trove2.mint(john, 200_000 * trove2Decimals);
        vm.stopPrank();
    }

    function createAuction() public {
        uint256 start = block.timestamp;
        // Owner creates an auction
        vm.startPrank(owner);
        troveAuction.createAuction(
            354, start, 7 days, 100 * trove2Decimals, 2_000 * trove2Decimals, 100 * trove2Decimals, "354.png"
        );
        troveAuction.createAuction(
            355, start, 14 days, 100 * trove2Decimals, 20_000 * trove2Decimals, 1000 * trove2Decimals, "355.png"
        );
        troveAuction.createAuction(
            356,
            start + 14 days,
            14 days,
            100 * trove2Decimals,
            20_000 * trove2Decimals,
            1000 * trove2Decimals,
            "356.png"
        );
        vm.stopPrank();
    }

    function test_create() external {
        uint256 start = block.timestamp;
        // expected to revert because the caller is not the owner
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableUnauthorizedAccount(address)")), address(this)));
        troveAuction.createAuction(
            354, start, 7 days, 100 * trove2Decimals, 2_000 * trove2Decimals, 100 * trove2Decimals, "354.png"
        );

        // Owner creates an auction
        vm.prank(owner);
        troveAuction.createAuction(
            354, start, 7 days, 100 * trove2Decimals, 2_000 * trove2Decimals, 100 * trove2Decimals, "354.png"
        );

        // Check that the auction was created correctly
        TroveAuction.Auction memory auction = troveAuction.getAuction(354)[0];
        assertEq(auction.start, start);
        assertEq(auction.duration, 7 days);
        assertEq(auction.startPrice, 100 * trove2Decimals);
        assertEq(auction.buyoutPrice, 2_000 * trove2Decimals);
        assertEq(auction.minimumIncrement, 100 * trove2Decimals);
        assertEq(auction.tokenURI, "354.png");

        // expected to revert because the auction already exists
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("AuctionNotEnded(uint256)")), 354));
        troveAuction.createAuction(
            354, start, 7 days, 100 * trove2Decimals, 2_000 * trove2Decimals, 100 * trove2Decimals, "354.png"
        );

        // Create another auction
        vm.startPrank(owner);
        troveAuction.createAuction(
            355, start, 14 days, 100 * trove2Decimals, 20_000 * trove2Decimals, 1000 * trove2Decimals, "355.png"
        );

        // Check that the auction was created correctly
        auction = troveAuction.getAuction(355)[0];
        assertEq(auction.start, start);
        assertEq(auction.duration, 14 days);
        assertEq(auction.startPrice, 100 * trove2Decimals);
        assertEq(auction.buyoutPrice, 20_000 * trove2Decimals);
        assertEq(auction.minimumIncrement, 1000 * trove2Decimals);
    }

    function test_bid() external {
        trove2Mint();
        createAuction();

        // Fast forward 1 day
        vm.warp(vm.getBlockTimestamp() + 86400);

        // expected to revert because the auction does not exist
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("AuctionNotExists(uint256)")), 353));
        troveAuction.bid(353, 100 * trove2Decimals);

        // expected to revert because the the msg sender does not have TRV2 tokens
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("InsufficientAllowance(address,address,uint256)")),
                address(this),
                address(troveAuction),
                100 * trove2Decimals
            )
        );
        troveAuction.bid(354, 100 * trove2Decimals);

        // Should revert even though the user has approved the auction contract but
        // does not have enough TRV2 tokens
        trove2.approve(address(troveAuction), 100 * trove2Decimals);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("InsufficientBalance(address,uint256,uint256)")),
                address(this),
                trove2.balanceOf(address(this)),
                100 * trove2Decimals
            )
        );
        troveAuction.bid(354, 100 * trove2Decimals);

        vm.startPrank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("InsufficientAllowance(address,address,uint256)")),
                owner,
                address(troveAuction),
                100 * trove2Decimals
            )
        );
        // Should revert because the owner has not approved the auction contract
        troveAuction.bid(354, 100 * trove2Decimals);

        trove2.approve(address(troveAuction), 200 * trove2Decimals);

        // Should revert as the bids are too low
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("InsufficientBidPlaced(uint256,uint256,uint256)")),
                354,
                10 * trove2Decimals,
                100 * trove2Decimals
            )
        );
        troveAuction.bid(354, 10 * trove2Decimals);

        // Able to bid as the owner has enough TRV2 tokens and has approved the auction contract
        troveAuction.bid(354, 100 * trove2Decimals);

        // Should revert as the auction hasn't started
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("AuctionNotStarted(uint256)")), 356));
        troveAuction.bid(356, 100 * trove2Decimals);
        vm.stopPrank();

        // Alice bids on the 354 auction
        vm.startPrank(alice);
        trove2.approve(address(troveAuction), 2_000 * trove2Decimals);
        troveAuction.bid(354, 200 * trove2Decimals);
        vm.stopPrank();

        // Bob bids more than Alice
        vm.startPrank(bob);
        trove2.approve(address(troveAuction), 2_000 * trove2Decimals);
        troveAuction.bid(354, 400 * trove2Decimals);
        vm.stopPrank();

        // Alice bids even more
        vm.startPrank(alice);
        // Should revert as the bids did not meet the minimum increment
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("InsufficientBidPlaced(uint256,uint256,uint256)")),
                354,
                400 * trove2Decimals,
                400 * trove2Decimals + 100 * trove2Decimals
            )
        );
        troveAuction.bid(354, 400 * trove2Decimals);

        // Able to bid as enough bids are placed
        troveAuction.bid(354, 500 * trove2Decimals);
        vm.stopPrank();

        // Check that the amounf of tokens transferred is correct
        assertEq(trove2.balanceOf(alice), 200_000 * trove2Decimals - 500 * trove2Decimals);
        assertEq(trove2.balanceOf(bob), 200_000 * trove2Decimals - 400 * trove2Decimals);
        assertEq(trove2.balanceOf(owner), 200_000 * trove2Decimals - 100 * trove2Decimals);

        // Check that the bids were placed correctly
        TroveAuction.Bid[] memory bids = troveAuction.getBids(354);
        assertEq(bids.length, 4);
        assertEq(bids[0].bidder, owner);
        assertEq(bids[0].amount, 100 * trove2Decimals);
        assertEq(bids[0].claimed, false);
        assertEq(bids[1].bidder, alice);
        assertEq(bids[1].amount, 200 * trove2Decimals);
        assertEq(bids[1].claimed, true);
        assertEq(bids[2].bidder, bob);
        assertEq(bids[2].amount, 400 * trove2Decimals);
        assertEq(bids[2].claimed, false);
        assertEq(bids[3].bidder, alice);
        assertEq(bids[3].amount, 500 * trove2Decimals);
        assertEq(bids[3].claimed, false);

        // Bob buys out the 354 auction
        vm.prank(bob);
        troveAuction.bid(354, 2_000 * trove2Decimals);

        // No one should be able to bid the 354 auction
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("AuctionEnded(uint256)")), 354));
        troveAuction.bid(354, 100 * trove2Decimals);

        vm.startPrank(owner);
        // Fast forward 14 days
        vm.warp(vm.getBlockTimestamp() + 14 days);

        // Should revert as the auction has ended
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("AuctionEnded(uint256)")), 355));
        troveAuction.bid(355, 100 * trove2Decimals);

        // Should be able to bid the 356 auction
        troveAuction.bid(356, 100 * trove2Decimals);
        vm.stopPrank();

        // Check that the amounf of tokens transferred is correct
        assertEq(trove2.balanceOf(owner), 200_000 * trove2Decimals - 100 * trove2Decimals - 100 * trove2Decimals);
        assertEq(trove2.balanceOf(bob), 200_000 * trove2Decimals - 2_000 * trove2Decimals);
    }

    function test_closeAuctionWithoutWinner() external {
        trove2Mint();
        createAuction();

        // immediately close the 354 auction
        vm.prank(owner);
        troveAuction.closeAuctionWithoutWinner(354);

        // Check that the auction was closed
        TroveAuction.Auction memory auction = troveAuction.getAuction(354)[0];
        assertEq(auction.duration, 0);

        // place bids on the 355 auction
        vm.startPrank(alice);
        trove2.approve(address(troveAuction), 200 * trove2Decimals);
        troveAuction.bid(355, 200 * trove2Decimals);
        vm.stopPrank();

        vm.startPrank(bob);
        trove2.approve(address(troveAuction), 1_300 * trove2Decimals);
        troveAuction.bid(355, 1_300 * trove2Decimals);
        vm.stopPrank();

        // Check that the amounf of tokens transferred is correct
        assertEq(trove2.balanceOf(alice), 200_000 * trove2Decimals - 200 * trove2Decimals);
        assertEq(trove2.balanceOf(bob), 200_000 * trove2Decimals - 1_300 * trove2Decimals);
        assertEq(trove2.balanceOf(address(troveAuction)), 200 * trove2Decimals + 1_300 * trove2Decimals);

        // Check that the bids were placed correctly
        TroveAuction.Bid[] memory bids = troveAuction.getBids(355);
        assertEq(bids.length, 2);
        assertEq(bids[0].bidder, alice);
        assertEq(bids[0].amount, 200 * trove2Decimals);
        assertEq(bids[0].claimed, false);
        assertEq(bids[1].bidder, bob);
        assertEq(bids[1].amount, 1_300 * trove2Decimals);
        assertEq(bids[1].claimed, false);

        // close the 355 auction
        vm.prank(owner);
        troveAuction.closeAuctionWithoutWinner(355);

        // Check that the auction was closed
        auction = troveAuction.getAuction(355)[0];
        assertEq(auction.duration, 0);

        // Check that the bids were refunded
        assertEq(trove2.balanceOf(alice), 200_000 * trove2Decimals);
        assertEq(trove2.balanceOf(bob), 200_000 * trove2Decimals);

        // Create another auction
        uint256 start = block.timestamp;
        vm.startPrank(owner);
        troveAuction.createAuction(
            355, start, 14 days, 100 * trove2Decimals, 21_000 * trove2Decimals, 1000 * trove2Decimals, "355.png"
        );

        // Check that the auction was created correctly
        auction = troveAuction.getAuction(355)[1];
        assertEq(auction.start, start);
        assertEq(auction.duration, 14 days);
        assertEq(auction.startPrice, 100 * trove2Decimals);
        assertEq(auction.buyoutPrice, 21_000 * trove2Decimals);
        assertEq(auction.minimumIncrement, 1000 * trove2Decimals);
        assertEq(auction.tokenURI, "355.png");

        // place bids on the 355 auction
        vm.startPrank(alice);
        trove2.approve(address(troveAuction), 200 * trove2Decimals);
        troveAuction.bid(355, 200 * trove2Decimals);
        vm.stopPrank();

        vm.startPrank(bob);
        trove2.approve(address(troveAuction), 1_800 * trove2Decimals);
        troveAuction.bid(355, 1_800 * trove2Decimals);
        vm.stopPrank();

        // Check that the amounf of tokens transferred is correct
        assertEq(trove2.balanceOf(alice), 200_000 * trove2Decimals - 200 * trove2Decimals);
        assertEq(trove2.balanceOf(bob), 200_000 * trove2Decimals - 1_800 * trove2Decimals);

        // Check that the bids were placed correctly
        TroveAuction.Bid[] memory newBids = troveAuction.getBids(355);
        assertEq(newBids.length, 2);
        assertEq(newBids[0].bidder, alice);
        assertEq(newBids[0].amount, 200 * trove2Decimals);
        assertEq(newBids[0].claimed, false);
        assertEq(newBids[1].bidder, bob);
        assertEq(newBids[1].amount, 1_800 * trove2Decimals);
        assertEq(newBids[1].claimed, false);

        // close the 355 auction
        vm.prank(owner);
        troveAuction.closeAuctionWithoutWinner(355);

        // Check that the auction was closed
        auction = troveAuction.getAuction(355)[1];
        assertEq(auction.duration, 0);

        // Check that the bids were refunded
        assertEq(trove2.balanceOf(alice), 200_000 * trove2Decimals);
        assertEq(trove2.balanceOf(bob), 200_000 * trove2Decimals);
    }

    function test_claimBid() external {
        trove2Mint();
        createAuction();

        // place bids on the 354 auction
        vm.startPrank(alice);
        trove2.approve(address(troveAuction), 20_000 * trove2Decimals);
        troveAuction.bid(354, 200 * trove2Decimals);
        vm.stopPrank();

        vm.startPrank(bob);
        trove2.approve(address(troveAuction), 20_000 * trove2Decimals);
        troveAuction.bid(354, 1_300 * trove2Decimals);
        vm.stopPrank();

        // Owner buyouts the 354 auction
        vm.startPrank(owner);
        trove2.approve(address(troveAuction), 2_000 * trove2Decimals);
        troveAuction.bid(354, 2_000 * trove2Decimals);
        vm.stopPrank();

        // The auction should be closed
        TroveAuction.Auction memory auction = troveAuction.getAuction(354)[0];
        assertEq(auction.winner, owner);

        // Alice attempts to bid will revert
        vm.startPrank(alice);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("AuctionEnded(uint256)")), 354));
        troveAuction.bid(354, 2_100 * trove2Decimals);
        vm.stopPrank();

        // Owner should not be able to claim the bid
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("BidRefundIneligible(uint256,uint256,address)")), 354, 0, owner)
        );
        troveAuction.claimBid(354);

        // Alice should be able to claim the bid
        vm.prank(alice);
        troveAuction.claimBid(354);

        // Alice should not be able to claim the bid again
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("BidNotExists(uint256,uint256,address)")), 354, 0, alice)
        );
        troveAuction.claimBid(354);

        // Bob should be able to claim the bid
        vm.prank(bob);
        troveAuction.claimBid(354);

        // place bids on the 355 auction
        vm.prank(alice);
        troveAuction.bid(355, 200 * trove2Decimals);

        vm.prank(bob);
        troveAuction.bid(355, 1_200 * trove2Decimals);

        vm.prank(alice);
        troveAuction.bid(355, 2_200 * trove2Decimals);

        vm.prank(bob);
        troveAuction.bid(355, 3_200 * trove2Decimals);

        // Fast forward 14 days
        vm.warp(vm.getBlockTimestamp() + 14 days);

        // Bob is the winner of the 355 auction
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("BidRefundIneligible(uint256,uint256,address)")), 355, 0, bob)
        );
        troveAuction.claimBid(355);

        // Alice should be able to claim the bid
        vm.prank(alice);
        troveAuction.claimBid(355);

        // The balances of alice and bob should be updated
        assertEq(trove2.balanceOf(alice), 200_000 * trove2Decimals);
        assertEq(trove2.balanceOf(bob), 200_000 * trove2Decimals - 3_200 * trove2Decimals);

        // The bids should be updated
        TroveAuction.Bid[] memory bids = troveAuction.getBids(355);
        assertEq(bids.length, 4);
        assertEq(bids[0].bidder, alice);
        assertEq(bids[0].amount, 200 * trove2Decimals);
        assertEq(bids[0].claimed, true);
        assertEq(bids[1].bidder, bob);
        assertEq(bids[1].amount, 1_200 * trove2Decimals);
        assertEq(bids[1].claimed, true);
        assertEq(bids[2].bidder, alice);
        assertEq(bids[2].amount, 2_200 * trove2Decimals);
        assertEq(bids[2].claimed, true);
        assertEq(bids[3].bidder, bob);
        assertEq(bids[3].amount, 3_200 * trove2Decimals);
        assertEq(bids[3].claimed, false);
    }

    function test_claimReward() external {
        trove2Mint();
        createAuction();

        // Owner buyouts the 354 auction and pays extra
        vm.startPrank(owner);
        trove2.approve(address(troveAuction), 20_000 * trove2Decimals);
        troveAuction.bid(354, 3_000 * trove2Decimals);
        vm.stopPrank();

        // Attempt to claim the bid will revert
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("BidRefundIneligible(uint256,uint256,address)")), 354, 0, owner)
        );
        troveAuction.claimBid(354);

        // The reward has already been claimed when the owner buyouts the auction
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("RewardClaimIneligible(uint256,uint256,address)")), 354, 0, owner)
        );
        troveAuction.claimReward(354);

        // Owner bids on the 355 auction
        vm.startPrank(alice);
        trove2.approve(address(troveAuction), 2_000 * trove2Decimals);
        troveAuction.bid(355, 2_000 * trove2Decimals);
        vm.stopPrank();

        vm.prank(owner);
        troveAuction.bid(355, 5_000 * trove2Decimals);

        // Fast forward 14 days
        vm.warp(vm.getBlockTimestamp() + 14 days);

        // Alice attempts to claim the reward will revert
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("RewardClaimIneligible(uint256,uint256,address)")), 355, 0, alice)
        );
        troveAuction.claimReward(355);

        // Owner is the winner of the 355 auction
        vm.prank(owner);
        troveAuction.claimReward(355);

        // The balances of the owner should be updated
        assertEq(trove2.balanceOf(owner), 200_000 * trove2Decimals - 3_000 * trove2Decimals - 5_000 * trove2Decimals);
        assertEq(troveAuction.trove().balanceOf(owner), 2);
        assertEq(troveAuction.trove().totalSupply(), 2);
        assertEq(troveAuction.trove().tokenOfOwnerByIndex(owner, 0), 0);
        assertEq(troveAuction.trove().tokenOfOwnerByIndex(owner, 1), 1);

        // The reward has already been claimed
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("RewardClaimIneligible(uint256,uint256,address)")), 355, 0, owner)
        );
        troveAuction.claimReward(355);
    }
}
