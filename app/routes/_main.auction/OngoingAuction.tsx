// External Modules
import { motion } from "framer-motion";
import { useReadTroveAuction } from "~/generated";

export default function OngoingAuction() {
  for (let i = 0; i < 10; i++) {
    const { data: auctionData } = useReadTroveAuction({
      functionName: "getAuction",
      args: [0n],
    });
  }

  return (
    <div>
      <h1>Ongoing Auction</h1>
    </div>
  );
}
