// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { motion } from "framer-motion";
import { useReadTrove, useReadTrove2, useReadTroveAuction } from "~/generated";

// Internal Modules
import { headlineVariants } from "~/lib/utils";
import AuctionCard from "./AuctionCard";

export const meta: MetaFunction = () => {
  return [{ title: "Auction | Trove" }];
};

export default function Mint() {
  // Get data from the smart contract
  const { data: ongoingAuctionData } = useReadTroveAuction({
    functionName: "getOngoingAuctions",
  });
  const { data: troveAddress } = useReadTroveAuction({ functionName: "trove" });
  const { data: baseURI } = useReadTrove({ functionName: "getBaseURI", address: troveAddress });

  return (
    <div className="mb-14">
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
          {ongoingAuctionData && baseURI && ongoingAuctionData.length > 0 ? (
            <div
              className="mt-6 grid auto-rows-auto grid-cols-1 min-[500px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                xl:grid-cols-5"
            >
              {ongoingAuctionData.map((auction, index) => (
                <AuctionCard key={index} data={auction} baseURI={baseURI} />
              ))}
            </div>
          ) : (
            <div>asd</div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
