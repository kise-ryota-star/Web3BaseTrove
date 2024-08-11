// SPDX-License-Identifier: GPL-3.0-only
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITroveAuction} from "./ITroveAuction.sol";
import {Trove} from "../trove-nft/Trove.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @custom:security-contact devalston390@gmail.com
contract TroveAuction is ITroveAuction, Ownable, ReentrancyGuard {
    uint256 public constant SCALING_FACTOR = 1e18;

    IERC20 public immutable trove2;
    Trove public immutable trove;

    mapping(uint256 auctionId => Auction[] auction) private auctions;
    // The auctionId corresponds to the index of the auction in the auctions array and
    // the bids array is the list of bids for that auction id. The sequence of the
    // bids array corresponds the sequence of the auction array
    mapping(uint256 auctionId => Bid[][] bids) private allBids;

    constructor(address trove2Address, string memory baseURI) Ownable(_msgSender()) {
        trove2 = IERC20(trove2Address);
        trove = new Trove(_msgSender(), address(this), baseURI);
    }

    /**
     * @dev Modifier to check if the auction exists for the NFT
     * @param auctionId The id of the auction to check if the auction exists
     */
    modifier auctionExists(uint256 auctionId) {
        if (auctions[auctionId].length == 0) {
            revert AuctionNotExists(auctionId);
        }
        _;
    }

    /**
     * @dev Mints the reward to the winner of the auction
     * @param auctionId The id of the auction to mint the reward to the winner. This function
     * assumes that the auctionId exists.
     * @param auction The related auction to mint the reward to the winner
     * and set the auction as inactive
     */
    function mintRewardToWinner(uint256 auctionId, Auction storage auction) internal {
        // Set the winner of the auction
        auction.winner = _msgSender();

        // Mint the NFT to the winner
        trove.safeMint(_msgSender(), auction.tokenURI);

        emit AuctionRewardClaimed(auctionId, _msgSender());
    }

    /**
     * @dev Creates an auction for an NFT
     * @param auctionId The id of the auction to create an auction for
     * @param duration The duration of the auction
     * @param startPrice The starting price of the auction
     * @param buyoutPrice The buyout price of the auction, any user
     * can buy the NFT at this price and end the auction instantly
     * @param minimumIncrement The minimum increment of the auction of
     * the current highest bid
     * @param tokenURI The token URI of the NFT to be auctioned
     */
    function createAuction(
        uint256 auctionId,
        uint256 start,
        uint256 duration,
        uint256 startPrice,
        uint256 buyoutPrice,
        uint256 minimumIncrement,
        string memory tokenURI
    ) external nonReentrant onlyOwner {
        Auction[] memory currentAuctions = auctions[auctionId];
        // If the auction already exists for the auctionId, and the last auction is active
        // then revert
        if (currentAuctions.length > 0 && currentAuctions[currentAuctions.length - 1].duration > 0) {
            revert AuctionNotEnded(auctionId);
        }

        auctions[auctionId].push(
            Auction({
                start: start,
                duration: duration,
                startPrice: startPrice,
                buyoutPrice: buyoutPrice,
                minimumIncrement: minimumIncrement,
                tokenURI: tokenURI,
                winner: address(0)
            })
        );

        emit AuctionCreated(auctionId, duration, start);
    }

    function getAuction(uint256 auctionId) external view auctionExists(auctionId) returns (Auction[] memory) {
        return auctions[auctionId];
    }

    function getBids(uint256 auctionId) external view auctionExists(auctionId) returns (Bid[] memory) {
        if (allBids[auctionId].length == 0) {
            return new Bid[](0);
        }

        return allBids[auctionId][allBids[auctionId].length - 1];
    }

    /**
     * @dev Bids on an auction
     * @param auctionId The id of the auction to bid on
     * @param amount The amount to bid
     */
    function bid(uint256 auctionId, uint256 amount) external nonReentrant auctionExists(auctionId) {
        // Get the last auction as the last auction is always the active one
        uint256 auctionIndex = auctions[auctionId].length - 1;
        Auction storage auction = auctions[auctionId][auctionIndex];

        if (block.timestamp < auction.start) {
            revert AuctionNotStarted(auctionId);
        }
        if (block.timestamp >= auction.start + auction.duration) {
            revert AuctionEnded(auctionId);
        }
        // A winner has been produced, revert
        if (auction.winner != address(0)) {
            revert AuctionEnded(auctionId);
        }

        // The last submitted bid is the highest bid
        uint256 allBidsLength = allBids[auctionId].length;
        // This happens when the first ever auction is created, and the entire allBids
        // mapping array is empty
        if (allBidsLength == 0) {
            allBids[auctionId].push(); // Adds a new array to allBids[auctionId]
        }

        // Ensure that the array is initialized up to the required auctionIndex
        while (allBids[auctionId].length <= auctionIndex) {
            allBids[auctionId].push(); // Adds a new array to allBids[auctionId]
        }

        uint256 bidsLength = allBids[auctionId][auctionIndex].length;
        if (bidsLength == 0) {
            allBids[auctionId][auctionIndex].push();
        }

        if (bidsLength == 0) {
            // There are no bids yet, so the first bid must be greater than or equal to the start price
            // Check if the amount is greater than or equal the start price
            if (amount < auction.startPrice) {
                revert InsufficientBidPlaced(auctionId, amount, auction.startPrice);
            }
        } else {
            uint256 auctionHighestBid = allBids[auctionId][auctionIndex][bidsLength - 1].amount;

            // Check if the amount is greater than or equal the current
            // highest bid + minimum increment
            if (amount < auctionHighestBid + auction.minimumIncrement) {
                revert InsufficientBidPlaced(auctionId, amount, auctionHighestBid + auction.minimumIncrement);
            }
        }

        // Check if the amount is greater than or equal the buyout price
        if (amount >= auction.buyoutPrice) {
            mintRewardToWinner(auctionId, auction);
        }

        // Add the bid to the bids array
        Bid memory newBid = Bid({bidder: _msgSender(), amount: amount, claimed: false});

        if (bidsLength == 0) {
            allBids[auctionId][auctionIndex][0] = newBid;

            // Check if the user has approved the contract to transfer the amount
            if (trove2.allowance(_msgSender(), address(this)) < amount) {
                revert InsufficientAllowance(_msgSender(), address(this), amount);
            }

            // Check if the user has enough balance to bid
            uint256 balance = trove2.balanceOf(_msgSender());
            if (balance < amount) {
                revert InsufficientBalance(_msgSender(), balance, amount);
            }

            trove2.transferFrom(_msgSender(), address(this), amount);
        } else {
            // Transfer the amount to the contract
            // If there are previous bids, transfer the increment amount only
            Bid[] memory auctionBids = allBids[auctionId][auctionIndex];
            uint256 transferred;
            for (uint256 i = auctionBids.length - 1; i > 0; i--) {
                if (auctionBids[i].bidder == _msgSender()) {
                    transferred = auctionBids[i].amount;

                    // Mark the previous bid as claimed as the user has placed a new bid
                    // so that when the user claims the bid when they lose, they can't
                    // claim the previous bid. Only the last bid can be claimed
                    allBids[auctionId][auctionIndex][i].claimed = true;
                    break;
                }
            }

            uint256 actualAmount = amount - transferred;

            // Check if the user has approved the contract to transfer the amount
            if (trove2.allowance(_msgSender(), address(this)) < actualAmount) {
                revert InsufficientAllowance(_msgSender(), address(this), amount);
            }

            // Check if the user has enough balance to bid
            uint256 balance = trove2.balanceOf(_msgSender());
            if (balance < actualAmount) {
                revert InsufficientBalance(_msgSender(), balance, amount);
            }

            // amount - transferred is the increment amount and will always be greater
            // than 0
            trove2.transferFrom(_msgSender(), address(this), actualAmount);

            allBids[auctionId][auctionIndex].push(newBid); // Directly push the new bid
        }

        emit BidPlaced(_msgSender(), amount, auctionId);
    }

    /**
     * @dev Ends the auction for an NFT without producing a winner. This happens when
     * the bids are not satisfactory or the owner wants to end the auction without a winner
     * @param auctionId The id of the auction to end the auction for
     */
    function closeAuctionWithoutWinner(uint256 auctionId) external nonReentrant auctionExists(auctionId) onlyOwner {
        Auction storage auction = auctions[auctionId][auctions[auctionId].length - 1];

        // Set the auction duration to 0 to indicate that the auction has been passed
        auction.duration = 0;

        uint256 allBidsLength = allBids[auctionId].length;

        // If there are no bids, then there is no need to refund any bids
        if (allBidsLength != 0) {
            uint256 auctionIndex = allBidsLength - 1;
            Bid[] storage bids = allBids[auctionId][auctionIndex];

            // Refund all the bids
            for (uint256 i = 0; i < bids.length; i++) {
                if (bids[i].claimed) continue;

                bids[i].claimed = true;
                trove2.transfer(bids[i].bidder, bids[i].amount);
            }
        }

        emit AuctionClosedWithoutWinner(auctionId);
    }

    /**
     * @dev Claims the bid of the bidder if they lose the auction and
     * the auction has ended
     * @param auctionId The id of the auction to claim the bid
     */
    function claimBid(uint256 auctionId) external auctionExists(auctionId) {
        uint256 auctionIndex = auctions[auctionId].length - 1;

        // The bid array does not even exist, revert
        if (allBids[auctionId].length <= auctionIndex) {
            revert BidNotExists(auctionId, auctionIndex, _msgSender());
        }

        // Get the last auction as the last auction is always the active one
        Auction storage auctionRound = auctions[auctionId][auctionIndex];

        // If the auction has not been buyout (no winner yet), and the auction has not ended, revert
        if (auctionRound.winner == address(0)) {
            // If the auction has not ended, revert
            if (auctionRound.start + auctionRound.duration > block.timestamp) {
                revert AuctionNotEnded(auctionId);
            }
        }

        // If the bidder is the winner, they can't claim the bid, revert
        if (auctionRound.winner == _msgSender()) {
            revert BidRefundIneligible(auctionId, auctionIndex, _msgSender());
        }

        // If the winner haven't claimed the reward, the winner is still
        // address(0), thus check if the msg sender is the last bidder in
        // the array, revert if is
        Bid[] memory bids = allBids[auctionId][auctionIndex];
        if (auctionRound.winner == address(0)) {
            uint256 lastBidsIndex = bids.length - 1;
            if (bids[lastBidsIndex].bidder == _msgSender()) {
                revert BidRefundIneligible(auctionId, auctionIndex, _msgSender());
            }
        }

        uint256 bidAmount;
        for (uint256 i = 0; i < bids.length; i++) {
            if (bids[i].bidder == _msgSender() && !bids[i].claimed) {
                bidAmount += bids[i].amount;
            }
        }

        // If the bidder has not placed a bid, or the bids has been claimed revert
        if (bidAmount == 0) {
            revert BidNotExists(auctionId, auctionIndex, _msgSender());
        }

        // Set the bid as claimed
        for (uint256 i = 0; i < bids.length; i++) {
            if (bids[i].bidder == _msgSender()) {
                // Must use allBids to update the state variable instead of the memory variable
                allBids[auctionId][auctionIndex][i].claimed = true;
            }
        }

        // Transfer the amount to the bidder
        trove2.transfer(_msgSender(), bidAmount);

        emit BidRefunded(auctionId, _msgSender(), bidAmount);
    }

    /**
     * @dev Claims the reward of the NFT if the auction has ended and the msg sender
     * is the winner of the auction
     * @param auctionId The id of the auction to claim the reward
     */
    function claimReward(uint256 auctionId) external nonReentrant auctionExists(auctionId) {
        uint256 auctionIndex = auctions[auctionId].length - 1;

        // The bid array does not even exist, revert
        if (allBids[auctionId].length <= auctionIndex) {
            revert BidNotExists(auctionId, auctionIndex, _msgSender());
        }

        Auction storage auction = auctions[auctionId][auctionIndex];

        // Check if the auction has ended
        if (auction.winner == address(0)) {
            if (block.timestamp < auction.start + auction.duration) {
                revert AuctionNotEnded(auctionId);
            }
        } else {
            // The winner has already claimed the reward, revert
            if (auction.winner == _msgSender()) {
                revert RewardClaimIneligible(auctionId, auctionIndex, _msgSender());
            }
        }

        // Check if the msg sender is the highest bidder
        uint256 lastBidsIndex = allBids[auctionId][auctionIndex].length - 1;
        Bid memory highestBid = allBids[auctionId][auctionIndex][lastBidsIndex];

        if (highestBid.bidder != _msgSender()) {
            revert RewardClaimIneligible(auctionId, auctionIndex, _msgSender());
        }

        mintRewardToWinner(auctionId, auction);
    }
}
