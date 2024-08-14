// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

/// @custom:security-contact devalston390@gmail.com
interface ITroveAuction {
    struct Auction {
        uint256 start;
        uint256 duration;
        uint256 startPrice;
        uint256 buyoutPrice;
        uint256 minimumIncrement;
        string tokenURI;
        address winner;
    }

    struct AuctionData {
        uint256 start;
        uint256 duration;
        uint256 startPrice;
        uint256 buyoutPrice;
        uint256 minimumIncrement;
        string tokenURI;
        address winner;
        uint256 auctionId;
        uint256 auctionIndex;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        bool claimed;
    }

    /**
     * @dev Emits when a user places a bid on an auction
     * @param user The address of the user that placed the bid
     * @param amount The amount of the bid placed
     * @param auctionId The id of the auction that the bid was placed on which
     * is also the index(id) of the auction in the auctions array
     */
    event BidPlaced(address indexed user, uint256 amount, uint256 auctionId);

    /**
     * @dev Emits when an auction is created for an NFT
     * @param auctionId The id of the auction that the auction was created for
     * @param duration The duration of the auction
     * @param start The start time of the auction
     */
    event AuctionCreated(uint256 auctionId, uint256 duration, uint256 start);

    /**
     * @dev Emits when an auction is ended for an NFT by the owner
     * without producing a winner
     * @param auctionId The id of the auction that the auction was ended for
     */
    event AuctionClosedWithoutWinner(uint256 auctionId);

    /**
     * @dev Emits when the bidder loses an auction and claims their bid
     * when the auction has ended
     * @param auctionId The id of the auction of the auction
     * @param bidder The address of the bidder
     * @param amount The amount of the bid that was refunded
     */
    event BidRefunded(uint256 auctionId, address bidder, uint256 amount);

    /**
     * @dev Emits when the winner of the auction claims the NFT
     * @param auctionId The id of the auction of the auction
     * @param bidder The address of the winner
     */
    event AuctionRewardClaimed(uint256 auctionId, address bidder);

    /**
     * @dev The auction for the NFT has already ended, thus the bidder cannot place a
     * bid
     * @param auctionId The id of the auction that the auction has already ended
     */
    error AuctionEnded(uint256 auctionId);

    /**
     * @dev The auction for the NFT has not started, thus the bidder cannot place a bid
     * @param auctionId The id of the auction that the auction has not started
     */
    error AuctionNotStarted(uint256 auctionId);

    /**
     * @dev The bid placed is less than the minimum bid required. If the bid is the first bid,
     * the bid must be greater than or equal to the start price. If the bid is not the first bid,
     * the bid must be greater than or equal to the current highest bid + minimum increment
     * (if any) of the auction
     * @param auctionId The id of the auction that the bid was placed on
     * @param amount The amount of the bid placed
     * @param minimumBid The minimum bid required
     */
    error InsufficientBidPlaced(uint256 auctionId, uint256 amount, uint256 minimumBid);

    /**
     * @dev The auction for the NFT does not finished/ended, thus the bidder cannot claim their bid
     * after the auction has ended and they are not the winner
     * @param auctionId The id of the auction that the auction has not ended
     */
    error AuctionNotEnded(uint256 auctionId);

    /**
     * @dev The auction for the NFT does not exists, could happen for any function that
     * requires an auctionId.
     * @param auctionId The id that the user is trying to interact with but does not exists
     */
    error AuctionNotExists(uint256 auctionId);

    /**
     * @dev The auction that is being created has invalid arguments that are not allowed
     * @param auctionId The id of the auction that is being created
     * @param errorArgs The field that is invalid
     */
    error InvalidAuctionArgs(uint256 auctionId, string errorArgs);

    /**
     * @dev The bid for the NFT does not exists, when the bidder tries to claim their bid
     * but the bid does not exists
     * @param auctionId The id of the auction that the bid does not exists
     * @param auctionIndex The index of the auction in the auctions array
     * @param bidder The address of the bidder
     */
    error BidNotExists(uint256 auctionId, uint256 auctionIndex, address bidder);

    /**
     * @dev The bidder is not eligible to claim their bid, when the bidder tries to claim their bid
     * but they are the winner of the auction
     * @param auctionId The id of the auction that the bidder is trying to claim their bid
     * @param auctionIndex The index of the auction in the auctions array
     * @param bidder The address of the bidder
     */
    error BidRefundIneligible(uint256 auctionId, uint256 auctionIndex, address bidder);

    /**
     * @dev The bidder is not eligible to claim the NFT, when the bidder tries to claim the NFT
     * but they are not the winner of the auction
     * @param auctionId The id of the auction that the bidder is trying to claim
     * @param auctionIndex The index of the auction in the auctions array
     * @param bidder The address of the bidder
     */
    error RewardClaimIneligible(uint256 auctionId, uint256 auctionIndex, address bidder);

    /**
     * @dev The bidder did not give enough allowance to the auction contract to transfer the TRV2 tokens
     * @param owner The address of the owner of the TRV2 tokens
     * @param spender The address of the auction contract
     * @param amount The amount of TRV2 tokens that the auction contract is trying to transfer
     */
    error InsufficientAllowance(address owner, address spender, uint256 amount);

    /**
     * @dev The bidder did not have enough TRV2 tokens to place a bid
     * @param owner The address of the owner of the TRV2 tokens
     * @param balance The balance of the owner
     * @param amount The amount of TRV2 tokens that the owner is trying to transfer
     */
    error InsufficientBalance(address owner, uint256 balance, uint256 amount);

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
    ) external;

    /**
     * @dev Get the auction details of an NFT
     * @param auctionId The id of the auction
     */
    function getAuction(uint256 auctionId) external view returns (Auction[] memory);

    /**
     * @dev Get the bids detail of an auction
     * @param auctionId The id of the auction
     * @param auctionIndex The index of the auction in the auctions array
     */
    function getBids(uint256 auctionId, uint256 auctionIndex) external view returns (Bid[] memory);

    /**
     * @dev Get all the ongoing auctions
     */
    function getOngoingAuctions() external view returns (AuctionData[] memory);

    /**
     * @dev Get all the past auctions that has ended
     */
    function getHistoryAuction() external view returns (AuctionData[] memory);

    /**
     * @dev Bid on an auction given the auction id and the amount of TRV2 tokens
     * @param auctionId The id of the auction
     * @param amount The amount of TRV2 tokens to bid
     */
    function bid(uint256 auctionId, uint256 amount) external;

    /**
     * @dev Close an auction without a winner given the auction id
     * @param auctionId The id of the auction
     * @notice Only the owner of the NFT can close the auction without a winner
     */
    function closeAuctionWithoutWinner(uint256 auctionId) external;

    /**
     * @dev Claim the bid given the auction id, only the bidder that has lost the auction
     * can claim the bid. The bid can only be claimed after the auction has ended as the time
     * of the auction has passed or the auction has been buyout by another bidder
     * @param auctionId The id of the auction
     */
    function claimBid(uint256 auctionId) external;

    /**
     * @dev Claim the reward given the auction id. Only the winner of the auction can claim the reward
     * after the auction has ended. Auction that has been buyout will have the reward automatically
     * claimed by the winner.
     * @param auctionId The id of the auction
     */
    function claimReward(uint256 auctionId) external;
}
