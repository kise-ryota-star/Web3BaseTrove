// Remix Modules
import { MetaFunction, useParams } from "@remix-run/react";

// External Modules
import { motion } from "framer-motion";
import { useReadTrove, useReadTroveAuction } from "~/generated";

// Internal Modules
import { headlineVariants } from "~/lib/utils";

// Components
import AuctionForm from "./AuctionForm";
import BidApproval from "./BidApproval";
import AuctionStats from "./AuctionStats";
import BidsActivity from "./BidsActivity";

export const meta: MetaFunction = () => {
  return [{ title: "Stake | Trove" }];
};

export default function AuctionDetails() {
  const params = useParams();

  if (!params.auction) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-4 sm:p-10">
        <div>
          <h1 className="mb-3 text-3xl font-semibold">Something went wrong!</h1>
          <p>
            You could open an issue on{" "}
            <a className="text-blue-400 transition-colors duration-200 hover:text-blue-600" href="">
              GitHub
            </a>{" "}
            to notify us about it
          </p>
          <p className="word-break-word">
            Path: <code>{location.pathname}</code>
          </p>
        </div>
      </div>
    );
  }

  const auctionId = params.auction.split("-")[0];
  const auctionIndex = params.auction.split("-")[1];

  // Get data from the smart contract
  const { data: troveBids } = useReadTroveAuction({
    functionName: "getBids",
    args: [BigInt(auctionId), BigInt(auctionIndex)],
  });
  const { data: troveAuction } = useReadTroveAuction({
    functionName: "getAuction",
    args: [BigInt(auctionId)],
  });
  const { data: auctionDecimal } = useReadTroveAuction({
    functionName: "DECIMALS",
  });
  const { data: troveAddress } = useReadTroveAuction({ functionName: "trove" });
  const { data: baseURI } = useReadTrove({ functionName: "getBaseURI", address: troveAddress });

  if (!troveAuction) {
    return (
      <div className="flex h-40 w-full flex-1 items-center justify-center">
        <p className="text-2xl text-amber-500">
          {" "}
          Trove Auction #{auctionId} - {auctionIndex} Does not exists
        </p>
      </div>
    );
  }
  if (!troveAuction || !baseURI) return;

  const nft = `${baseURI}${troveAuction[Number(auctionIndex)].tokenURI}`;
  const currentBid =
    troveBids && troveBids.length > 0 ? troveBids[troveBids.length - 1].amount : 0n;

  return (
    <div className="mb-14">
      <motion.section
        variants={headlineVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-screen-2xl flex-1"
      >
        <h1
          className="mx-auto mb-1 mt-10 max-w-72 text-center text-2xl font-semibold !leading-relaxed
            min-[460px]:max-w-none sm:text-4xl lg:text-5xl lg:leading-snug"
        >
          Trove Auction #{auctionId} - {auctionIndex}
        </h1>
        <div className="mt-14 flex flex-col gap-3 md:flex-row">
          <div className="w-full md:max-w-72 lg:max-w-sm">
            <img
              src={nft}
              alt="NFT"
              width={128}
              height={128}
              className="mx-auto h-auto w-full max-w-72 rounded-2xl bg-dark-blue object-cover md:max-w-none"
            />
            {auctionDecimal ? (
              <AuctionStats
                currentBid={currentBid}
                auctionDecimal={auctionDecimal}
                duration={troveAuction[Number(auctionIndex)].duration}
                start={troveAuction[Number(auctionIndex)].start}
                className="mb-0 mt-6 flex md:hidden"
              />
            ) : null}
            {troveBids && auctionDecimal ? (
              <BidsActivity bids={troveBids} auctionDecimal={Number(auctionDecimal)} />
            ) : null}
          </div>
          <div className="w-full">
            {/* stats */}
            {auctionDecimal ? (
              <AuctionStats
                currentBid={currentBid}
                auctionDecimal={auctionDecimal}
                duration={troveAuction[Number(auctionIndex)].duration}
                start={troveAuction[Number(auctionIndex)].start}
                className="hidden md:flex"
              />
            ) : null}

            {/* Auction input form */}
            {auctionDecimal && troveBids ? (
              <AuctionForm
                data={troveAuction[Number(auctionIndex)]}
                details={{ auctionId, auctionIndex, baseURI, auctionDecimal }}
                bids={troveBids}
              />
            ) : null}
          </div>
        </div>
      </motion.section>

      <BidApproval />
    </div>
  );
}
