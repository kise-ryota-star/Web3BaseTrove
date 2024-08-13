// External Modules
import { useAccount } from "wagmi";

// Components
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { useReadTroveAuction, useWriteTroveAuction } from "~/generated";
import { isSimulateContractErrorType } from "~/lib/utils";

interface AuctionWithdrawalProps {
  auctionId: string;
}

export default function AuctionWithdrawal({ auctionId }: AuctionWithdrawalProps) {
  const account = useAccount();
  const { toast } = useToast();

  // Ensure that the connected user is the owner of the auction
  // as only the owner can withdraw the auction
  const { data: troveAuctionOwner } = useReadTroveAuction({ functionName: "owner" });
  // const { refetch } = useReadTroveAuction({ functionName: "getOngoingAuctions"});
  // const { refetch:refetchAuctionHistory } = useReadTroveAuction({ functionName: "getHistoryAuction"});

  const { refetch: refetchTroveAuction } = useReadTroveAuction({
    functionName: "getAuction",
    args: [BigInt(auctionId)],
  });

  const writeAuctionContract = useWriteTroveAuction();

  // Handle auction withdrawal on button click
  const handleAuctionWithdrawal = async () => {
    try {
      const result = await writeAuctionContract.writeContractAsync({
        functionName: "closeAuctionWithoutWinner",
        args: [BigInt(auctionId)],
      });
      toast({
        title: "Auction Withdrawal Successful",
        description: `You have successfully close auction #${auctionId}. Transaction hash: ${result}`,
        variant: "success",
      });

      await refetchTroveAuction();
    } catch (error) {
      console.error(error);
      if (isSimulateContractErrorType(error)) {
        if (error.name === "ContractFunctionExecutionError") {
          toast({
            title: "Auction Withdrawal Failed",
            description: "The withdrawal transaction will most likely be reverted.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Auction Withdrawal Failed",
            description: "An error occurred while withdrawing auction.",
            variant: "destructive",
          });
        }
      }
    }
  };

  return troveAuctionOwner && troveAuctionOwner === account.address ? (
    <div className="mt-3 w-full rounded-xl bg-dark-blue p-3">
      <h3 className="text-xl font-semibold lg:text-2xl">Auction Withdrawal</h3>
      <p>
        You can withdraw the auction and have all the bids refunded to all bidders. You can do this
        for several reason:
      </p>
      <ul className="mt-2 list-inside list-disc">
        <li>You no longer want to auction the given NFT</li>
        <li>The bids are not high enough</li>
      </ul>
      <p className="mt-4 text-xs text-slate-400">**This action is irreversible</p>
      <Button
        type="button"
        onClick={handleAuctionWithdrawal}
        variant="destructive"
        className="mt-1"
      >
        Withdraw Auction
      </Button>
    </div>
  ) : null;
}
