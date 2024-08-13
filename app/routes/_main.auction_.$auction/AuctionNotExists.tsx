interface AuctionNotExistsProps {
  auctionId: string;
  auctionIndex: string;
}

export default function AuctionNotExists({ auctionId, auctionIndex }: AuctionNotExistsProps) {
  return (
    <div className="my-20 flex h-40 w-full flex-1 items-center justify-center">
      <p className="text-2xl text-amber-500">
        Trove Auction #{auctionId} - {auctionIndex} Does not exists
      </p>
    </div>
  );
}
