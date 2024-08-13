// External Modules
import { Crown } from "lucide-react";

// Internal Modules
import { formatUnits } from "viem";
import { cn } from "~/lib/utils";

interface BidApprovalProps {
  className?: string;
  bids: readonly {
    bidder: `0x${string}`;
    amount: bigint;
    claimed: boolean;
  }[];
  auctionDecimal: number;
}

export default function BidsActivity({ className, bids, auctionDecimal }: BidApprovalProps) {
  const reversedBids = bids.slice().reverse();

  return (
    <article className={cn("mt-3 rounded-2xl bg-dark-blue p-4", className)}>
      <h3 className="text-xl font-semibold lg:text-2xl">Bids Activity</h3>
      {bids.length > 0 ? (
        reversedBids.map((bid, index) => {
          // Only show the top 10 bids
          if (index > 10) return null;

          return (
            <p className="my-1" key={index}>
              {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
              <span className="text-slate-400">&nbsp;bid&nbsp;</span>
              <span className="font-bold text-amber-500">
                {formatUnits(bid.amount, auctionDecimal)} TRV2
                {index === 0 && <Crown className="ml-1 inline-block" size={18} />}
              </span>
            </p>
          );
        })
      ) : (
        <p>No bids yet</p>
      )}
    </article>
  );
}
