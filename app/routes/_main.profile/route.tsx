// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { motion } from "framer-motion";
import { useAccount, useBalance } from "wagmi";

// Internal Modules
import { headlineVariants, safeBigIntDecimalToNumber } from "~/lib/utils";

// Components
import Stats from "~/components/Stats";
import BurnTokenCard from "./BurnTokenCard";

// Assets Imports
import basePng from "~/assets/base/base.png";
import baseWebp from "~/assets/base/base.webp";
import baseAvif from "~/assets/base/base.avif";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { useReadTrove1 } from "~/generated";

export const meta: MetaFunction = () => {
  return [{ title: "Profile | Trove" }];
};

export default function Profile() {
  const account = useAccount();
  const result = useBalance({
    address: account.address,
  });
  const { data: tokenDecimal } = useReadTrove1({ functionName: "decimals" });
  const { data: trv1Amount } = useReadTrove1({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });

  return (
    <motion.div variants={headlineVariants} initial="hidden" animate="visible" className="flex-1">
      <h1
        className="mx-auto mb-12 mt-10 max-w-72 text-center text-2xl font-semibold !leading-relaxed
          min-[460px]:max-w-none sm:text-4xl lg:text-5xl lg:leading-snug"
      >
        Your Profile
      </h1>
      {account.isConnected ? (
        <article className="mx-auto mb-20 flex max-w-screen-xl flex-col rounded-2xl bg-dark-blue p-3 sm:p-5">
          <h2 className="overflow-hidden text-ellipsis text-xl sm:text-2xl md:text-3xl lg:text-4xl">
            {account.address}
          </h2>
          <div className="mt-2 flex flex-col gap-2 text-sm sm:text-base">
            <div className="flex gap-1">
              <p className="text-slate-400">Balance: </p>&nbsp;
              <p>{result.data ? `${formatEther(result.data.value)} ${result.data.symbol}` : "0"}</p>
            </div>
            <div className="flex items-center gap-1">
              <p className="text-slate-400">Chain: </p>&nbsp;
              <div className="flex items-center">
                <p>
                  {account.chain?.name}{" "}
                  <span className="text-xs text-gray-400">({account.chain?.id})</span>
                </p>
                {account.chain?.name === "Base Sepolia" && (
                  <picture>
                    <source srcSet={baseAvif} type="image/avif" />
                    <source srcSet={baseWebp} type="image/webp" />
                    <img src={basePng} alt="Base Chain" className="ml-2 h-auto w-6 sm:w-8" />
                  </picture>
                )}
              </div>
            </div>
          </div>

          {/* cards */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Stats
              title="TRV1 owned"
              value={
                trv1Amount
                  ? safeBigIntDecimalToNumber(trv1Amount, tokenDecimal).toLocaleString()
                  : "0"
              }
              desc="TRV1"
              className="w-full bg-accent-dark-blue sm:w-1/2 md:w-full"
              large
            />
            <Stats
              title="TRV2 owned"
              value="0"
              desc="TRV2"
              className="w-full bg-accent-dark-blue sm:w-1/2 md:w-full"
              large
            />
          </div>

          <div className="mt-3 flex flex-col gap-5 rounded-xl bg-destructive p-3 sm:p-5 lg:flex-row lg:gap-3">
            <div className="max-w-lg lg:max-w-72">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">Danger Zone</h3>
              <p className="mb-3 mt-2 text-lg">Burn your token!</p>
              <p>
                You can burn your token here with ease. If you wonder what you will get by burning
                your token, you actually get nothing :)
              </p>
            </div>
            <BurnTokenCard
              title="Burn TRV1"
              desc="TRV1"
              decimals={tokenDecimal || 0}
              max={trv1Amount || 0}
            />
            <BurnTokenCard title="Burn TRV2" desc="TRV2" decimals={0} max={0} />
          </div>
        </article>
      ) : (
        <div className="px-4 text-center text-amber-500">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
            Oops, you're not connected!
          </h2>
          <p className="mt-2 text-lg">You need to connect your wallet to view your profile.</p>
          <div className="mx-auto mt-6 w-fit">
            <ConnectButton label="Connect Wallet" showBalance={false} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
