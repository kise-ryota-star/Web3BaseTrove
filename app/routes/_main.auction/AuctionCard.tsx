// Internal Modules
import { formatUnits } from "viem";
import { useReadTroveAuction } from "~/generated";

interface AuctionCardProps {
  data: {
    start: bigint;
    duration: bigint;
    startPrice: bigint;
    buyoutPrice: bigint;
    minimumIncrement: bigint;
    tokenURI: string;
    winner: `0x${string}`;
    auctionId: bigint;
  };
  baseURI: string;
}

export default function AuctionCard({ data, baseURI }: AuctionCardProps) {
  const nft = `${baseURI}${data.tokenURI}`;

  const { data: troveBids } = useReadTroveAuction({
    functionName: "getBids",
    args: [data.auctionId],
  });
  const { data: auctionDecimal } = useReadTroveAuction({
    functionName: "DECIMALS",
  });

  const highestBid =
    troveBids && troveBids.length > 0 ? troveBids[troveBids.length - 1].amount : 0n;

  return (
    <article className="mx-auto w-full max-w-80 rounded-2xl bg-dark-blue p-2">
      <img
        src={nft}
        alt="NFT"
        width={128}
        height={128}
        className="h-auto w-full rounded-2xl object-cover"
      />
      <div className="mt-3 rounded-xl bg-accent-dark-blue p-1.5">
        <div className="rounded-lg bg-success p-2 text-center text-sm text-white">
          Ends in {data.duration.toLocaleString()} seconds
        </div>
        <div className="mt-4 flex gap-0.5">
          <div className="flex-1 overflow-hidden text-center">
            <p className="text-xs text-white">Highest</p>
            <p className="mt-1 overflow-hidden text-ellipsis font-bold text-white sm:text-lg">
              {Number(formatUnits(highestBid, Number(auctionDecimal))).toLocaleString()}
            </p>
            <p className="-mt-1">
              <small className="text-xs">TRV2</small>
            </p>
          </div>
          <div className="flex-1 overflow-hidden text-center">
            <p className="text-xs text-white">Bid</p>
            <p className="mt-1 overflow-hidden text-ellipsis font-bold text-white sm:text-lg">
              {Number(formatUnits(data.minimumIncrement, Number(auctionDecimal))).toLocaleString()}
            </p>
            <p className="-mt-1">
              <small className="text-xs">TRV2</small>
            </p>
          </div>
          <div className="flex-1 overflow-hidden text-center">
            <p className="text-xs text-white">Buyout</p>
            <p className="mt-1 overflow-hidden text-ellipsis font-bold text-white sm:text-lg">
              {Number(formatUnits(data.buyoutPrice, Number(auctionDecimal))).toLocaleString()}
            </p>
            <p className="-mt-1">
              <small className="text-xs">TRV2</small>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
