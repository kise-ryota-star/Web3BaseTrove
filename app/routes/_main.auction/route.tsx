// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { motion } from "framer-motion";
import { useBlock } from "wagmi";

// Internal Modules
import { useReadTrove, useReadTroveAuction } from "~/generated";
import { headlineVariants } from "~/lib/utils";

// Components
import AuctionCard from "./AuctionCard";
import AuctionPlaceholderGrid from "./AuctionPlaceholderGrid";

export const meta: MetaFunction = () => {
  return [
    { title: "Auction | Trove" },
    {
      name: "description",
      content: "Bid TRV2 token here to participate in the Web 3 Auction to get yourself an NFT",
    },
  ];
};

export default function Mint() {
  const { data: blockData } = useBlock();

  // Get data from the smart contract
  const { data: ongoingAuctionData } = useReadTroveAuction({
    functionName: "getOngoingAuctions",
  });
  const { data: historyAuctionData } = useReadTroveAuction({
    functionName: "getHistoryAuction",
  });
  const { data: baseURI } = useReadTrove({ functionName: "getBaseURI" });

  const isValidAuctionData = (data: typeof ongoingAuctionData | typeof historyAuctionData) => {
    if (data === undefined) return false;
    if (data.length === 0) return false;

    if (data.every((auction) => auction.start === 0n)) {
      return false;
    }

    return true;
  };

  return (
    <div className="mb-14 flex-1">
      <motion.section
        variants={headlineVariants}
        initial="hidden"
        animate="visible"
        className="flex-1"
      >
        <h1
          className="mx-auto mb-1 mt-10 max-w-72 text-center text-2xl font-semibold !leading-relaxed
            min-[460px]:max-w-none sm:text-4xl lg:text-5xl lg:leading-snug"
        >
          NFT Auction
        </h1>
        <p className="mx-auto mb-12 text-center">
          Participate in the auction using TRV2 token to bid your NFT
        </p>
        <div className="mx-auto w-full max-w-screen-2xl">
          <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">Ongoing Auction</h2>
          {ongoingAuctionData !== undefined && baseURI && blockData ? (
            ongoingAuctionData.length > 0 && isValidAuctionData(ongoingAuctionData) ? (
              <div
                className="mb-32 mt-16 grid auto-rows-auto grid-cols-1 min-[500px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                  xl:grid-cols-5"
              >
                {ongoingAuctionData.map((auction, index) => (
                  <AuctionCard key={index} data={auction} baseURI={baseURI} blockData={blockData} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-40 w-full items-center justify-center text-2xl text-amber-500">
                No ongoing auction found
              </div>
            )
          ) : (
            <AuctionPlaceholderGrid />
          )}
        </div>
        <div className="mx-auto w-full max-w-screen-2xl">
          <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">History</h2>
          {historyAuctionData && baseURI && blockData ? (
            historyAuctionData.length > 0 && isValidAuctionData(historyAuctionData) ? (
              <div
                className="mb-32 mt-16 grid auto-rows-auto grid-cols-1 min-[500px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                  xl:grid-cols-5"
              >
                {historyAuctionData.map((auction, index) => (
                  <AuctionCard key={index} data={auction} baseURI={baseURI} blockData={blockData} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-40 w-full items-center justify-center text-2xl text-amber-500">
                No previous auction found
              </div>
            )
          ) : (
            <AuctionPlaceholderGrid />
          )}
        </div>
      </motion.section>
    </div>
  );
}
