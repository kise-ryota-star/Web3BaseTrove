// External Modules
import { add, formatDistance } from "date-fns";
import { formatUnits } from "viem";

// Internal Modules
import { cn } from "~/lib/utils";

// Components
import Stats from "~/components/Stats";

interface AuctionStatsProps {
  auctionDecimal: bigint;
  currentBid: bigint;
  start: bigint;
  duration: bigint;
  className?: string;
  blockData: {
    timestamp: bigint;
  };
}

export default function AuctionStats({
  currentBid,
  auctionDecimal,
  start,
  duration,
  blockData,
  className,
}: AuctionStatsProps) {
  // Calculate using the block timestamp
  const auctionTime = formatDistance(
    new Date(Number(blockData.timestamp) * 1000).getTime(),
    add(Number(start) * 1000, {
      seconds: Number(duration),
    }),
    { includeSeconds: true },
  );

  return (
    <div
      className={cn("mx-auto mb-2 flex flex-col gap-2 rounded-2xl sm:flex-row sm:gap-3", className)}
    >
      <Stats
        title="Current Bid"
        value={formatUnits(currentBid, Number(auctionDecimal))}
        className="w-full sm:w-1/2"
      />
      <Stats title="Auction Ends in" value={auctionTime} className="w-full sm:w-1/2" />
    </div>
  );
}
