// Remix Modules
import { MetaFunction, useParams } from "@remix-run/react";

// External Modules
import { motion } from "framer-motion";
import { useReadTrove, useReadTroveAuction } from "~/generated";
import { useBlock } from "wagmi";
import { add, isAfter } from "date-fns";

// Internal Modules
import { headlineVariants } from "~/lib/utils";

// Components
import LoadingPage from "~/components/LoadingPage";
import AuctionForm from "./AuctionForm";
import BidApproval from "./BidApproval";
import AuctionStats from "./AuctionStats";
import BidsActivity from "./BidsActivity";
import AuctionWithdrawal from "./AuctionWithdrawal";
import AuctionNotExists from "./AuctionNotExists";
import AuctionStatus from "./AuctionStatus";
import AuctionClaim from "./AuctionClaim";
import MissingParam from "~/components/MissingParam";

export const meta: MetaFunction = ({ params }) => {
  if (!params.auction) return [{ title: "Auction | Trove" }];

  return [
    { title: `Auction ${params.auction} | Trove` },
    {
      name: "description",
      content: `Bid TRV2 token here at Auction ${params.auction} to participate in the Web 3 Auction to get yourself an NFT`,
    },
  ];
};

export default function AuctionDetails() {
  const params = useParams();
  const { data: blockData } = useBlock();

  // Get data from the smart contract
  const { data: troveBids } = useReadTroveAuction({
    functionName: "getBids",
    args: params.auction
      ? [BigInt(params.auction.split("-")[0]), BigInt(params.auction.split("-")[1])]
      : undefined,
  });
  const { data: troveAuction } = useReadTroveAuction({
    functionName: "getAuction",
    args: params.auction ? [BigInt(params.auction.split("-")[0])] : undefined,
  });
  const { data: auctionDecimal } = useReadTroveAuction({
    functionName: "DECIMALS",
  });
  const { data: baseURI } = useReadTrove({ functionName: "getBaseURI" });

  if (!params.auction) return <MissingParam className="my-20" />;

  const auctionId = params.auction.split("-")[0];
  const auctionIndex = params.auction.split("-")[1];

  // Check if the auction exists
  if (!troveAuction) return <AuctionNotExists auctionId={auctionId} auctionIndex={auctionIndex} />;
  if (troveAuction[Number(auctionIndex)] === undefined)
    return <AuctionNotExists auctionId={auctionId} auctionIndex={auctionIndex} />;
  if (!blockData || !troveBids || !auctionDecimal || !baseURI) return <LoadingPage />;

  const currentAuction = troveAuction[Number(auctionIndex)];
  const nft = `${baseURI}${currentAuction.tokenURI}`;
  const currentBid =
    troveBids && troveBids.length > 0 ? troveBids[troveBids.length - 1].amount : 0n;

  // Calculate the status of the auction
  const isPassed = currentAuction.duration === 0n;
  const isEnded = isAfter(
    new Date(Number(blockData.timestamp) * 1000),
    add(Number(currentAuction.start) * 1000, { seconds: Number(currentAuction.duration) }),
  );
  const hasWinner = currentAuction.winner !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="mb-14 flex-1">
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

            {isPassed || isEnded ? (
              <AuctionStatus
                className="mb-0 mt-6 flex md:hidden"
                status={isPassed ? "passed" : hasWinner ? "sold" : "ended"}
              />
            ) : (
              <AuctionStats
                currentBid={currentBid}
                auctionDecimal={auctionDecimal}
                duration={troveAuction[Number(auctionIndex)].duration}
                start={troveAuction[Number(auctionIndex)].start}
                blockData={blockData}
                className="mb-0 mt-6 flex md:hidden"
              />
            )}

            <BidsActivity bids={troveBids} auctionDecimal={Number(auctionDecimal)} />
          </div>
          <div className="w-full">
            {/* stats */}

            {isPassed || isEnded ? (
              <AuctionStatus
                className="hidden md:flex"
                status={isPassed ? "passed" : hasWinner ? "sold" : "ended"}
              />
            ) : (
              <AuctionStats
                currentBid={currentBid}
                auctionDecimal={auctionDecimal}
                duration={troveAuction[Number(auctionIndex)].duration}
                start={troveAuction[Number(auctionIndex)].start}
                blockData={blockData}
                className="hidden md:flex"
              />
            )}

            {/* Auction input form */}
            {isPassed || isEnded ? (
              <AuctionClaim
                data={troveAuction[Number(auctionIndex)]}
                details={{ auctionId, auctionIndex, baseURI, auctionDecimal }}
                bids={troveBids}
                // blockData={blockData}
                status={isPassed ? "passed" : hasWinner ? "sold" : "ended"}
              />
            ) : (
              <AuctionForm
                data={troveAuction[Number(auctionIndex)]}
                details={{ auctionId, auctionIndex, baseURI, auctionDecimal }}
                bids={troveBids}
                // blockData={blockData}
              />
            )}

            {isPassed || isEnded ? null : <AuctionWithdrawal auctionId={auctionId} />}
          </div>
        </div>
      </motion.section>
      {isPassed || isEnded ? null : <BidApproval />}
    </div>
  );
}
