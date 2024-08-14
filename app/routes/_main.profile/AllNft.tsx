// External Modules
import { useAccount } from "wagmi";

// Internal Modules
import { useReadTrove, useReadTroveAuction } from "~/generated";

// Components
import LoadingPage from "~/components/LoadingPage";
import ProfileNftCard from "./ProfileNftCard";

export default function AllNft() {
  const account = useAccount();
  const address = account.address;

  const { data: troveAddress } = useReadTroveAuction({ functionName: "trove" });
  const { data: nftAmount } = useReadTrove({
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    address: troveAddress,
  });

  return (
    <article className="pt-2">
      {nftAmount !== undefined ? (
        nftAmount > 0n && address !== undefined && troveAddress ? (
          <div className="grid auto-rows-auto grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: Number(nftAmount) }, (_, index) => index).map((nftIndex) => (
              <ProfileNftCard
                key={nftIndex}
                tokenIndex={nftIndex}
                address={address}
                troveAddress={troveAddress}
              />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-xl">No Trove NFT found</p>
        )
      ) : (
        <LoadingPage />
      )}
    </article>
  );
}
