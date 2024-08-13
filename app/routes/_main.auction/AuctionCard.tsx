// External Modules
import { formatUnits } from "viem";
import { add, formatDistance, isAfter } from "date-fns";

// Internal Modules
import { useReadTroveAuction } from "~/generated";

// Components
import { PinContainer } from "~/components/3dPin";

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
    auctionIndex: bigint;
  };
  baseURI: string;
  blockData: {
    timestamp: bigint;
  };
}

export default function AuctionCard({ data, baseURI, blockData }: AuctionCardProps) {
  const nft = `${baseURI}${data.tokenURI}`;

  const { data: troveBids } = useReadTroveAuction({
    functionName: "getBids",
    args: [data.auctionId, data.auctionIndex],
  });
  const { data: auctionDecimal } = useReadTroveAuction({
    functionName: "DECIMALS",
  });

  // Check if the auction data is valid, if the start is 0n, then
  // the entire auction data is the default null data from the smart contract
  if (data.start === 0n) return null;

  const highestBid =
    troveBids && troveBids.length > 0 ? troveBids[troveBids.length - 1].amount : 0n;
  const auctionTime = formatDistance(
    new Date(Number(blockData.timestamp) * 1000).getTime(),
    add(Number(data.start) * 1000, {
      seconds: Number(data.duration),
    }),
    { includeSeconds: true },
  );

  const isPassed = data.duration === 0n;
  const isEnded = isAfter(
    new Date(Number(blockData.timestamp) * 1000),
    add(Number(data.start) * 1000, { seconds: Number(data.duration) }),
  );
  const hasWinner = data.winner !== "0x0000000000000000000000000000000000000000";

  return (
    <PinContainer
      className="mx-auto w-full max-w-80 rounded-2xl bg-dark-blue p-2"
      title={`Stakes #${data.auctionId}`}
      href={`${Number(data.auctionId)}-${Number(data.auctionIndex)}`}
    >
      <img
        src={nft}
        alt="NFT"
        width={128}
        height={128}
        className="h-auto w-full rounded-2xl object-cover"
      />
      <div className="mt-3 rounded-xl bg-accent-dark-blue p-1.5">
        <div
          className={`rounded-lg p-2 text-center text-sm text-white
            ${isPassed ? "bg-slate-600" : isEnded ? "bg-destructive" : "bg-success"}`}
        >
          {isPassed ? (
            <span> Passed</span>
          ) : isEnded ? (
            hasWinner ? (
              <span>Sold</span>
            ) : (
              <span>Ended</span>
            )
          ) : (
            <span>Ends in {auctionTime}</span>
          )}
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
    </PinContainer>
  );
}
