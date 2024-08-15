// External Modules
import { useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

// Internal Modules
import { isSimulateContractErrorType } from "~/lib/utils";
import { useReadTroveAuction, useWriteTroveAuction } from "~/generated";

// Components
import Stats from "~/components/Stats";
import AuctionInfo from "./AuctionInfo";
import LoadingPage from "~/components/LoadingPage";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";

interface AuctionClaimProps {
  data: {
    start: bigint;
    duration: bigint;
    startPrice: bigint;
    buyoutPrice: bigint;
    minimumIncrement: bigint;
    tokenURI: string;
    winner: `0x${string}`;
  };
  details: {
    baseURI: string;
    auctionId: string;
    auctionIndex: string;
    auctionDecimal: bigint;
  };
  bids: readonly {
    bidder: `0x${string}`;
    amount: bigint;
    claimed: boolean;
  }[];
  status: "passed" | "sold" | "ended";
  // blockData: {
  //   timestamp: bigint;
  //   chainId: number;
  // };
}

export default function AuctionClaim({ bids, status, data, details }: AuctionClaimProps) {
  const { openConnectModal } = useConnectModal();
  const account = useAccount();
  const { toast } = useToast();

  // Write data to the contract
  const writeAuctionContract = useWriteTroveAuction();

  // refresh the smart contract data
  const { refetch: refetchAuctionBids } = useReadTroveAuction({
    functionName: "getBids",
    args: [BigInt(details.auctionId), BigInt(details.auctionIndex)],
  });
  const { refetch: refetchAuction } = useReadTroveAuction({
    functionName: "getAuction",
    args: [BigInt(details.auctionId)],
  });

  // Track the status of the claim button
  const [claimError, setClaimError] = useState<string>("");

  const reversedBids = bids.slice().reverse();
  const highestBidData =
    reversedBids.length > 0
      ? reversedBids[0]
      : { amount: 0n, bidder: "0x0000000000000000000000000000000000000000", claimed: false };
  const highestBid = highestBidData.amount;
  const winner = `${highestBidData.bidder.slice(0, 6)}...${highestBidData.bidder.slice(-4)}`;
  const accountIsWinner = account.address === highestBidData.bidder;

  const accountBids = reversedBids.filter((bid) => bid.bidder === account.address);
  const latestBid =
    accountBids.length > 0
      ? accountBids.sort((a, b) => Number(b.amount) - Number(a.amount))[0]
      : undefined;

  const handleBtnClick = async () => {
    if (claimError) return;

    if (!account.isConnected && openConnectModal) {
      openConnectModal();
      return;
    }

    if (status === "sold" && accountIsWinner) {
      toast({
        title: "NFT Claimed",
        description: "The NFT has already been claimed.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (status === "ended" && accountIsWinner && !highestBidData.claimed) {
        const result = await writeAuctionContract.writeContractAsync({
          functionName: "claimReward",
          args: [BigInt(details.auctionId)],
        });

        toast({
          title: "NFT Claimed",
          description: `You have successfully claimed auction #${details.auctionId}'s NFT. Transaction hash: ${result}`,
          variant: "success",
        });
      } else if ((status === "ended" || status === "sold") && latestBid && !accountIsWinner) {
        const result = await writeAuctionContract.writeContractAsync({
          functionName: "claimBid",
          args: [BigInt(details.auctionId)],
        });

        toast({
          title: "Bid Refunded",
          description: `You have successfully claimed your bid. Transaction hash: ${result}`,
          variant: "success",
        });
      }

      await refetchAuction();
      await refetchAuctionBids();
    } catch (error) {
      console.error(error);
      if (isSimulateContractErrorType(error)) {
        setClaimError(error.message);
        if (error.name === "ContractFunctionExecutionError") {
          toast({
            title: "Unable to claim",
            description: "The claiming bid transaction will most likely be reverted.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Unable to claim",
            description: "An error occurred while claiming bid.",
            variant: "destructive",
          });
        }
      }
    }
  };

  if (!account) {
    return <LoadingPage />;
  }

  let btnText = "Claim Bid";
  if (account.isConnected) {
    if (status === "passed") btnText = "Bid refunded";
    else if (status === "ended" && accountIsWinner) {
      btnText = "Claim NFT";
      if (highestBidData.claimed) btnText = "NFT Claimed";
    } else if (status === "sold" && accountIsWinner) btnText = "NFT Claimed";
    else btnText = "Claim bid";
  } else btnText = "Connect Wallet";

  return (
    <div className="w-full rounded-xl bg-dark-blue p-3">
      <div className="rounded-2xl shadow">
        <Stats
          title="Highest Bid"
          value={Number(formatUnits(highestBid, Number(details.auctionDecimal))).toLocaleString()}
          figure="TRV2"
          desc={
            status === "ended" || status === "sold"
              ? `The winner is ${winner}`
              : `The highest bid is ${winner}`
          }
          className="w-full bg-accent-dark-blue shadow-none"
          large
        />
        {(status === "ended" || status === "sold") && accountIsWinner ? null : (
          <Stats
            title="Bids Refund"
            value={
              account.isConnected
                ? latestBid === undefined
                  ? "0"
                  : Number(
                      formatUnits(latestBid.amount, Number(details.auctionDecimal)),
                    ).toLocaleString()
                : "0"
            }
            figure="TRV2"
            desc={"Refundable amount"}
            className="mt-2 w-full bg-accent-dark-blue shadow-none"
            large
          />
        )}
      </div>
      <Button
        type="button"
        variant={claimError ? "destructive" : "orange"}
        size="lg"
        className="mt-3 w-full"
        disabled={account.isConnected ? status === "passed" : false}
        onClick={handleBtnClick}
      >
        {btnText}
      </Button>
      <AuctionInfo info={{ ...data, ...details }} />
    </div>
  );
}
