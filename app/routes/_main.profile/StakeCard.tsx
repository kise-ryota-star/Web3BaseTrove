// External Modules
import { useAccount } from "wagmi";

// Internal Modules
import { useReadTroveStake } from "~/generated";

// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatUnits } from "viem";
import { PinContainer } from "~/components/3dPin";

interface StakeCardProps {
  address: `0x${string}`;
  index: number;
  active: boolean;
  amount: bigint;
  start: bigint;
  claimed: bigint;
}
export default function StakeCard({
  address,
  index,
  active,
  amount,
  start,
  claimed,
}: StakeCardProps) {
  const { data: stakeClaimableRewards } = useReadTroveStake({
    functionName: "stakeClaimableRewards",
    args: [address, BigInt(index)],
  });

  return (
    <PinContainer className="w-full" title={`Stakes #${index}`} href={`stake/${address}/${index}`}>
      <Card className={`w-full rounded-3xl bg-dark-blue ${!active && "opacity-60"}`}>
        <CardHeader className="flex-row items-center pb-2 pt-4">
          <CardDescription>Stakes #{index}</CardDescription>
          <Badge className="ml-auto" variant={active ? "success" : "destructive"}>
            {active ? "Active" : "Withdrawn"}
          </Badge>
        </CardHeader>
        <CardContent className="mx-2 mb-2 rounded-2xl bg-accent-dark-blue p-4">
          <div className="text-amber-500">
            <p className="mb-1 font-light">Staked</p>
            <CardTitle className="text-5xl">
              {Number(formatUnits(amount, 18)).toLocaleString()}
            </CardTitle>
          </div>
          <p className="mt-3 font-light">Total Rewards</p>
          <h4 className="text-4xl">
            {stakeClaimableRewards
              ? Number(formatUnits(stakeClaimableRewards, 18)).toLocaleString()
              : 0}
          </h4>
          <p className="-mt-1 text-slate-400">
            <small>TRV2</small>
          </p>

          <div className="mt-3 text-sm sm:text-base">
            <p>
              <span className="font-light text-slate-400">Claimed:</span>{" "}
              {Number(formatUnits(claimed, 18)).toLocaleString()} TRV2
            </p>
            <p>
              <span className="font-light text-slate-400">Starts:</span>{" "}
              {new Date(Number(start) * 1000).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </PinContainer>
  );
}
