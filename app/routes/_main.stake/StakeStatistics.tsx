// Components
import { Badge } from "~/components/ui/badge";
import Stats from "~/components/Stats";
import { Button } from "~/components/ui/button";

export default function StakeStatistics() {
  return (
    <article className="mx-auto my-14 flex max-w-screen-lg flex-col sm:px-4">
      <Badge className="mx-auto mb-14" variant="orange">
        Performance
      </Badge>
      <div className="w-full">
        <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl">Stake Statistics</h2>
        <p className="mt-2 sm:text-lg">Stake now and enjoy a minimum of 21.9% in annual APY </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <Stats
            className="daisy-stats-vertical w-full sm:w-1/2"
            large
            title="Total Staked"
            value={0}
            desc="TRV1"
          >
            <Stats title="Total Staked Count" large value={0} desc="Account"></Stats>
          </Stats>
          <div className="word-break-word w-full sm:w-1/2">
            <p className="word-break-word text-slate-400">Powered by Base sepolia</p>
            <p className="word-break-word text-lg">TroveStake contract address</p>
            <br />
            <p className="word-break-word mb-3">
              Base Sepolia: 0xcf0c122c6b73ff809c693db761e6baebe62b6a2e
            </p>

            <Button>View Contract</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
