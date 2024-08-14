// External Modules
import { useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

// Internal Modules
import {
  troveAuctionAddress,
  useReadTrove2,
  useReadTroveAuction,
  useWriteTroveAuction,
} from "~/generated";
import { isSimulateContractErrorType } from "~/lib/utils";

// Components
import Stats from "~/components/Stats";
import { Slider } from "~/components/ui/slider";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import AuctionInfo from "./AuctionInfo";

interface AuctionFormProps {
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
  blockData: {
    timestamp: bigint;
    chainId: number;
  };
}

export default function AuctionForm({ data, details, bids, blockData }: AuctionFormProps) {
  const { openConnectModal } = useConnectModal();
  const account = useAccount();
  const { toast } = useToast();

  // Get data from the smart contract
  const buyoutBid = Number(formatUnits(data.buyoutPrice, Number(details.auctionDecimal)));
  const { refetch: refetchTroveBids } = useReadTroveAuction({
    functionName: "getBids",
    args: [BigInt(details.auctionId), BigInt(details.auctionIndex)],
  });
  const { data: trv2Amount, refetch: refetchTrv2Amount } = useReadTrove2({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });
  const { data: trv2Decimals } = useReadTrove2({
    functionName: "decimals",
  });
  const { data: trv2Allowance, refetch: refetchTrv2Allowance } = useReadTrove2({
    functionName: "allowance",
    args: account.address && [account.address, troveAuctionAddress[31337]],
  });

  const currentBid = Number(
    formatUnits(
      bids.length > 0 ? bids[bids.length - 1].amount : 0n,
      Number(details.auctionDecimal),
    ),
  );
  const startBid = Number(formatUnits(data.startPrice, Number(details.auctionDecimal)));
  const minimumBid =
    currentBid === 0
      ? startBid
      : Number(formatUnits(data.minimumIncrement, Number(details.auctionDecimal))) + currentBid;
  const doubleMinimumBid =
    currentBid === 0
      ? startBid + Number(formatUnits(data.minimumIncrement, Number(details.auctionDecimal)))
      : Number(formatUnits(data.minimumIncrement, Number(details.auctionDecimal))) * 2 + currentBid;

  const troveWrite = useWriteTroveAuction();

  // Record the bid amount, used by both the slider and input
  const [bidAmount, setBidAmount] = useState(0);

  // Record the error when bidding
  const [bidError, setBidError] = useState("");

  /**
   * Handle bid slider change
   */
  const handleSliderChange = (value: number[]) => {
    setBidAmount(value[0]);
  };

  /**
   * Handle bid input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let value = inputValue.replace(/[^0-9.]/g, ""); // Allow only numeric and decimal values
    let num = Number(value);

    if (num > buyoutBid) num = buyoutBid;

    setBidAmount(num);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBidButton();
    }
  };

  /**
   * Handle bid button click
   */
  const handleBidButton = async () => {
    // If there is an error, do not proceed
    if (bidError) return;

    // The user is not connected, open the connect modal
    if (!account.isConnected && openConnectModal) {
      openConnectModal();
      return;
    }

    if (trv2Amount === undefined || trv2Allowance === undefined) return;

    // If the user have no allowance, prompt them to approve
    if (trv2Allowance === 0n) {
      toast({
        title: "Insufficient allowance",
        description: "Please approve the contract to transfer TRV2 tokens to start staking.",
        variant: "destructive",
      });
      return;
    }

    const finalBid = BigInt(bidAmount * 10 ** Number(details.auctionDecimal));

    // If the user does not have enough TRV2, prompt them to top up
    if (finalBid > trv2Amount) {
      toast({
        title: "Insufficient balance",
        description: "You do not have enough TRV2 to place this bid.",
        variant: "destructive",
      });
      return;
    }

    // If the user does not have enough allowance, prompt them to approve
    if (finalBid > trv2Allowance) {
      toast({
        title: "Insufficient allowance",
        description: "You need to approve more TRV2 to place this bid.",
        variant: "destructive",
      });
      return;
    }

    if (finalBid > trv2Amount) {
      toast({
        title: "Insufficient balance",
        description: "You do not have enough TRV2 to place this bid.",
        variant: "destructive",
      });
      return;
    }
    if (finalBid > trv2Allowance) {
      toast({
        title: "Insufficient allowance",
        description: "You need to approve more TRV2 to place this bid.",
        variant: "destructive",
      });
      return;
    }
    const currentBid = bids.length > 0 ? bids[bids.length - 1].amount : 0n;
    const latestBid = currentBid === 0n ? data.startPrice : currentBid + data.minimumIncrement;
    if (finalBid < latestBid) {
      toast({
        title: "Bid too low",
        description: "Your bid is lower than the minimum increment.",
        variant: "destructive",
      });
      return;
    }

    if (account.address) {
      try {
        const result = await troveWrite.writeContractAsync({
          functionName: "bid",
          args: [BigInt(details.auctionId), finalBid],
        });
        toast({
          title: "Bid successful",
          description: `You have successfully place ${bidAmount} bids on Auction ${details.auctionId}. Transaction hash: ${result}`,
          variant: "success",
        });

        setBidAmount(0);
        await refetchTroveBids();
        await refetchTrv2Allowance();
        await refetchTrv2Amount();
      } catch (error) {
        console.error(error);
        if (isSimulateContractErrorType(error)) {
          setBidError(error.message);
          if (error.name === "ContractFunctionExecutionError") {
            toast({
              title: "Unable to bid",
              description: "The bidding transaction will most likely be reverted.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Unable to bid",
              description: "An error occurred while bidding.",
              variant: "destructive",
            });
          }
          setTimeout(() => {
            setBidError("");
          }, 5000);
        }
      }
    }
  };

  return (
    <div className="w-full rounded-xl bg-dark-blue p-3">
      <div className="rounded-2xl bg-accent-dark-blue shadow">
        <Stats
          title="Bid"
          value={
            <Input
              type="text"
              placeholder="0"
              className="focus !focus-visible:!shadow-none my-2 !border-none !bg-transparent pl-0 text-4xl font-medium
                outline-none !ring-transparent focus-visible:!border-none focus-visible:!outline-none
                focus-visible:!ring-offset-0"
              maxLength={buyoutBid.toString().length}
              max={buyoutBid}
              value={bidAmount}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
            />
          }
          figure="TRV2"
          className="w-full bg-accent-dark-blue shadow-none"
        />
        <div className="px-6 pb-6 pt-3">
          <Slider
            defaultValue={[0]}
            max={buyoutBid}
            step={1}
            value={[bidAmount]}
            onValueChange={handleSliderChange}
          />
          <p className="mt-4 text-xs">
            You have{" "}
            <span className="font-semibold text-amber-500">
              {trv2Amount && trv2Decimals ? formatUnits(trv2Amount, trv2Decimals) : 0}
            </span>{" "}
            TRV2 and{" "}
            <span className="font-semibold text-amber-500">
              {trv2Allowance && trv2Decimals ? formatUnits(trv2Allowance, trv2Decimals) : 0}
            </span>{" "}
            TRV2 approved for auction
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          onClick={() => setBidAmount(minimumBid)}
          className="h-auto w-1/3 flex-col overflow-hidden"
          variant="outline-orange"
        >
          <p className="text-xs">Minimum</p>
          <p className="overflow-hidden text-ellipsis">
            <span className="text-lg font-bold"> {minimumBid}</span>{" "}
            <small className="text-xs">TRV2</small>
          </p>
        </Button>
        <Button
          type="button"
          onClick={() => setBidAmount(doubleMinimumBid)}
          className="h-auto w-1/3 flex-col overflow-hidden"
          variant="outline-orange"
        >
          <p className="text-xs">2x Minimum</p>
          <p className="overflow-hidden text-ellipsis">
            <span className="text-lg font-bold"> {doubleMinimumBid}</span>{" "}
            <small className="text-xs">TRV2</small>
          </p>
        </Button>
        <Button
          type="button"
          onClick={() =>
            setBidAmount(Number(formatUnits(data.buyoutPrice, Number(details.auctionDecimal))))
          }
          className="h-auto w-1/3 flex-col overflow-hidden"
          variant="outline-orange"
        >
          <p className="text-xs">Buyout</p>
          <p className="overflow-hidden text-ellipsis">
            <span className="text-lg font-bold">
              {formatUnits(data.buyoutPrice, Number(details.auctionDecimal))}
            </span>{" "}
            <small className="text-xs">TRV2</small>
          </p>
        </Button>
      </div>
      <Button
        onClick={handleBidButton}
        className="mt-2 w-full rounded-xl"
        size="lg"
        variant={bidError ? "destructive" : "orange"}
      >
        {account.isConnected ? "Place bid" : "Connect Wallet"}
      </Button>
      <AuctionInfo blockData={blockData} info={{ ...data, ...details }} />
    </div>
  );
}
