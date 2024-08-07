// External Modules
import { useAccount } from "wagmi";

// Internal Modules
import { useReadTroveStake } from "~/generated";

// Components
import StakeCard from "./StakeCard";

export default function AllStakes() {
  const account = useAccount();

  const address = account.address;
  const { data: stakeDetails } = useReadTroveStake({
    functionName: "stakeStatus",
    args: address ? [address] : undefined,
  });
  console.log(stakeDetails);
  return (
    <article className="pt-2">
      {stakeDetails && address && stakeDetails.length > 0 ? (
        <div className="grid auto-rows-auto grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stakeDetails.map((stake, index) => (
            <StakeCard
              key={index}
              address={address}
              index={index}
              active={stake.active}
              amount={stake.amount}
              start={stake.start}
              claimed={stake.claimed}
            />
          ))}
        </div>
      ) : (
        <p className="text-xl">No stake record found</p>
      )}
    </article>
  );
}
