// Internal Modules
import { useReadTrove } from "~/generated";

interface ProfileNftCardProps {
  tokenIndex: number;
  address: `0x${string}`;
}

export default function ProfileNftCard({ tokenIndex, address }: ProfileNftCardProps) {
  const { data: nftIndex } = useReadTrove({
    functionName: "tokenOfOwnerByIndex",
    args: [address, BigInt(tokenIndex)],
  });

  return nftIndex !== undefined ? <NftCard nftIndex={nftIndex} tokenIndex={tokenIndex} /> : null;
}

interface NftCardProps {
  tokenIndex: number;
  nftIndex: bigint;
}

function NftCard({ tokenIndex, nftIndex }: NftCardProps) {
  const { data: tokenURI } = useReadTrove({
    functionName: "tokenURI",
    args: [nftIndex],
  });

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-dark-blue p-2">
      <a
        href={tokenURI}
        target="_blank"
        referrerPolicy="no-referrer"
        rel="noopener noreferrer"
        className="aspect-square h-auto w-full flex-shrink-0"
      >
        <img src={tokenURI} alt={`NFT #${nftIndex}`} className="h-full w-full rounded-xl" />
      </a>
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm">Trove #{tokenIndex}</p>
        <p className="text-sm text-slate-400">Owned</p>
      </div>
    </div>
  );
}
