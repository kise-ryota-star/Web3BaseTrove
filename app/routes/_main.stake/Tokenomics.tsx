// Components
import { formatUnits } from "viem";
import Stats from "~/components/Stats";
import { useReadTrove2 } from "~/generated";

export default function Tokenomics() {
  const { data: trove2BurnedAmount } = useReadTrove2({ functionName: "burnedAmount" });
  const { data: trove2TotalSupply } = useReadTrove2({ functionName: "totalSupply" });
  const { data: trove2Decimals } = useReadTrove2({ functionName: "decimals" });

  return (
    <article className="mx-auto mt-32 flex max-w-screen-lg flex-col sm:px-4">
      <div className="w-full">
        <h2 className="mb-12 text-right text-3xl font-semibold sm:text-4xl md:text-5xl">
          Tokenomics
        </h2>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <Stats
            className="daisy-stats-vertical w-full sm:w-1/2"
            large
            title="Minted Token"
            value={
              trove2TotalSupply && trove2Decimals
                ? formatUnits(trove2TotalSupply, trove2Decimals)
                : 0
            }
            desc="TRV2"
          >
            <Stats
              title="Burned Count"
              large
              value={
                trove2BurnedAmount && trove2Decimals
                  ? formatUnits(trove2BurnedAmount, trove2Decimals)
                  : 0
              }
              desc="TRV2"
            ></Stats>
          </Stats>
          <div className="word-break-word w-full sm:w-1/2">
            <h3 className="text-lg font-semibold sm:text-2xl md:text-3xl">
              The only way to mint TRV2 is to stake
            </h3>
            <p className="mt-4 sm:text-lg md:text-xl">
              Stake your TRV1 and get TRV2 as a reward. You still get back all your TRV1 when you
              unstake, nothing to lose!
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
