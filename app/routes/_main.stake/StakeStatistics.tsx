// External Modules
import { extractChain, formatUnits } from "viem";
import { useChainId } from "wagmi";

// Internal Modules
import { troveStakeAddress, useReadTroveStake } from "~/generated";

// Components
import { Badge } from "~/components/ui/badge";
import Stats from "~/components/Stats";
import { Button } from "~/components/ui/button";
import { anvil, baseSepolia } from "viem/chains";

export default function StakeStatistics() {
  const chainId = useChainId();
  const chain = extractChain({ chains: [baseSepolia, anvil], id: chainId as 31337 | 84532 });

  const { data: totalStaked } = useReadTroveStake({ functionName: "totalStaked" });
  const { data: totalStakedCount } = useReadTroveStake({ functionName: "totalStakesCount" });
  const { data: stakeDailyBaseRate } = useReadTroveStake({ functionName: "dailyBaseRate" });
  const annualApy = stakeDailyBaseRate ? parseFloat(formatUnits(stakeDailyBaseRate, 18)) * 365 : 0;

  return (
    <article className="mx-auto my-14 flex max-w-screen-lg flex-col sm:px-4">
      <Badge className="mx-auto mb-14" variant="orange">
        Performance
      </Badge>
      <div className="w-full">
        <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl">Stake Statistics</h2>
        <p className="mt-2 sm:text-lg">
          Stake now and enjoy a minimum of {annualApy * 100}% in annual APY{" "}
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <Stats
            className="daisy-stats-vertical w-full sm:w-1/2"
            large
            title="Total Staked"
            value={totalStaked ? formatUnits(totalStaked, 18) : "0"}
            desc="TRV1"
          >
            <Stats
              title="Total Staked Count"
              large
              value={totalStakedCount?.toString() || 0}
              desc="Account"
            ></Stats>
          </Stats>
          <div className="word-break-word w-full sm:w-1/2">
            <p className="word-break-word text-slate-400">Powered by {chain.name}</p>
            <p className="word-break-word text-lg">TroveStake contract address</p>
            <br />
            <p className="word-break-word mb-3">
              {" "}
              {chain.name}: {troveStakeAddress[31337]}
            </p>

            <Button>View Contract</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
