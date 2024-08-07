// External Modules
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";

// Internal Modules
import { safeBigIntDecimalToNumber } from "~/lib/utils";
import { useReadTrove1, useReadTrove2, useReadTroveStake } from "~/generated";

// Components
import Stats from "~/components/Stats";

export default function CardsSection() {
  const account = useAccount();

  const { data: trove2Address } = useReadTroveStake({ functionName: "trove2" });
  const { data: trv1Decimal } = useReadTrove1({ functionName: "decimals" });
  const { data: trv2Decimal } = useReadTrove2({ functionName: "decimals", address: trove2Address });
  const { data: trv1Amount } = useReadTrove1({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });
  const { data: trv2Amount } = useReadTrove2({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
    address: trove2Address,
  });

  const { data: trvStakeActiveStakes } = useReadTroveStake({
    functionName: "accountActiveStakes",
    args: account.address && [account.address],
  });
  const { data: trvStakeClaimableRewards } = useReadTroveStake({
    functionName: "claimableRewards",
    args: account.address && [account.address],
  });

  const trv1Balance =
    trv1Amount && trv1Decimal ? Number(formatUnits(trv1Amount, trv1Decimal)).toLocaleString() : "0";
  const trv2Balance =
    trv2Amount && trv2Decimal ? Number(formatUnits(trv2Amount, trv2Decimal)).toLocaleString() : "0";
  const activeStakes = trvStakeActiveStakes
    ? Number(formatUnits(trvStakeActiveStakes, 18)).toLocaleString()
    : 0;
  const claimableRewards = trvStakeClaimableRewards
    ? Number(formatUnits(trvStakeClaimableRewards, 18)).toLocaleString()
    : 0;

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Stats
          title="TRV1 balance"
          value={trv1Balance}
          desc="TRV1"
          className="w-full bg-accent-dark-blue sm:w-1/2 md:w-full"
          large
        />
        <Stats
          title="TRV2 balance"
          value={trv2Balance}
          desc="TRV2"
          className="w-full bg-accent-dark-blue sm:w-1/2 md:w-full"
          large
        />
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Stats
          title="Total active stakes"
          value={activeStakes}
          desc="TRV1"
          className="w-full bg-accent-dark-blue sm:w-1/2 md:w-full"
          large
        />
        <Stats
          title="Total Claimable Rewards"
          value={claimableRewards}
          desc="TRV2"
          className="w-full bg-accent-dark-blue sm:w-1/2 md:w-full"
          large
        />
      </div>
    </>
  );
}
