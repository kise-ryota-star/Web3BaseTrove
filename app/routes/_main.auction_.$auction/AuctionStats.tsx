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
}

export default function AuctionStats({
  currentBid,
  auctionDecimal,
  start,
  duration,
  className,
}: AuctionStatsProps) {
  return (
    <div
      className={cn("mx-auto mb-2 flex flex-col gap-2 rounded-2xl sm:flex-row sm:gap-3", className)}
    >
      <Stats
        title="Current Bid"
        value={formatUnits(currentBid, Number(auctionDecimal))}
        className="w-full sm:w-1/2"
      />
      <Stats
        title="Auction Ends in"
        value={formatDistance(
          new Date().getTime() / 1000,
          add(Number(start), {
            seconds: Number(duration),
          }),
          { includeSeconds: true },
        )}
        className="w-full sm:w-1/2"
      />
    </div>
  );
}
