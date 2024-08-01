// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// Internal Modules
import { useReadTrove1 } from "~/generated";

// Components
import Stats from "~/components/Stats";
import MintForm from "./MintForm";
import { safeBigIntDecimalToNumber } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "Mint | Trove" }];
};

export default function Mint() {
  const { data: tokenDecimal } = useReadTrove1({ functionName: "decimals" });
  const { data: totalSupply } = useReadTrove1({ functionName: "totalSupply" });
  const { data: totalBalance } = useReadTrove1({ functionName: "totalBalance" });
  const { data: burnedAmount } = useReadTrove1({ functionName: "burnedAmount" });

  return (
    <div className="flex-1">
      <h1
        className="mx-auto mb-12 mt-10 max-w-72 text-center text-2xl font-semibold !leading-relaxed
          min-[460px]:max-w-none sm:text-4xl lg:text-5xl lg:leading-snug"
      >
        Mint TRV1 Token
      </h1>
      <article className="mx-auto mb-20 flex max-w-screen-lg flex-col gap-3 sm:gap-4 md:flex-row md:gap-5">
        <div className="flex w-full flex-col gap-4 md:w-1/3">
          <Stats
            title="Total Supply"
            value={safeBigIntDecimalToNumber(totalSupply, tokenDecimal).toLocaleString()}
            desc="TRV1"
          />
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4 md:flex-col md:gap-5">
            <Stats
              title="Minted token"
              value={safeBigIntDecimalToNumber(totalBalance, tokenDecimal).toLocaleString()}
              desc="TRV1"
              className="w-full sm:w-1/2 md:w-full"
            />
            <Stats
              title="Burned Token"
              value={safeBigIntDecimalToNumber(burnedAmount, tokenDecimal).toLocaleString()}
              desc="TRV1"
              className="w-full sm:w-1/2 md:w-full"
            />
          </div>
        </div>
        <MintForm />
      </article>
    </div>
  );
}
