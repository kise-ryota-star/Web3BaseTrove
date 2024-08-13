// Internal Modules
import { cn } from "~/lib/utils";

interface AuctionStatsProps {
  className?: string;
  status: "passed" | "sold" | "ended";
}

export default function AuctionStatus({ className, status }: AuctionStatsProps) {
  return (
    <div
      className={cn(
        "mx-auto mb-2 flex flex-col rounded-2xl bg-dark-blue p-3 text-center",
        className,
      )}
    >
      <p className="text-sm sm:text-base">Auction has ended</p>
      <p className="text-2xl font-bold text-amber-500 sm:text-3xl">
        {status.slice(0, 1).toUpperCase() + status.slice(1)}
      </p>
    </div>
  );
}
