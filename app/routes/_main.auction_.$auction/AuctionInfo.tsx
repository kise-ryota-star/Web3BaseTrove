// External Modules
import { formatUnits } from "viem";
import { add, format, formatDistance } from "date-fns";

// Internal Modules
import useContractAddress from "~/hooks/useContractAddress";

// Components
import ContractDetails from "~/components/ContractDetails";

interface AuctionInfoProps {
  // blockData: {
  //   timestamp: bigint;
  //   chainId: number;
  // };
  info: {
    auctionId: string;
    auctionIndex: string;
    start: bigint;
    duration: bigint;
    startPrice: bigint;
    buyoutPrice: bigint;
    minimumIncrement: bigint;
    tokenURI: string;
    baseURI: string;
    auctionDecimal: bigint;
  };
}

export default function AuctionInfo({ info }: AuctionInfoProps) {
  const { contractAddress } = useContractAddress("troveAuction");

  return (
    <div className="mx-2 mt-4 text-sm">
      <ContractDetails
        name="Contract address"
        value={contractAddress.slice(0, 10) + "..."}
        copy={contractAddress}
      />
      <ContractDetails name="Auction ID" value={info.auctionId} />
      <ContractDetails name="Auction Index" value={info.auctionIndex} />
      <ContractDetails
        name="NFT URI"
        value={`${info.baseURI}${info.tokenURI}`.slice(0, 29) + "..."}
        copy={`${info.baseURI}${info.tokenURI}`}
      />
      <ContractDetails
        name="Start Time"
        value={format(Number(info.start) * 1000, "dd-MM-yyyy, HH:mm:ss")}
      />
      <ContractDetails
        name="Duration"
        value={
          info.duration === 0n
            ? "Passed"
            : formatDistance(
                Number(info.start),
                add(Number(info.start), {
                  seconds: Number(info.duration),
                }),
                { includeSeconds: true },
              )
        }
      />
      <ContractDetails
        name="Start Price"
        value={`${Number(formatUnits(info.startPrice, Number(info.auctionDecimal))).toLocaleString()} TRV2`}
      />
      <ContractDetails
        name="Minimum Bid Increment"
        value={`${Number(formatUnits(info.minimumIncrement, Number(info.auctionDecimal))).toLocaleString()} TRV2`}
      />
      <ContractDetails
        name="Buyout Price"
        value={`${Number(formatUnits(info.buyoutPrice, Number(info.auctionDecimal))).toLocaleString()} TRV2`}
      />
    </div>
  );
}
