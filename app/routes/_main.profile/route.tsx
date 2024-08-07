// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { motion } from "framer-motion";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";

// Internal Modules
import { headlineVariants } from "~/lib/utils";
import { useReadTrove1 } from "~/generated";

// Components
import BurnTokenCard from "./BurnTokenCard";
import AllStakes from "./AllStakes";
import CardsSection from "./CardsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Assets Imports
import basePng from "~/assets/base/base.png";
import baseWebp from "~/assets/base/base.webp";
import baseAvif from "~/assets/base/base.avif";

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
        <>
          <article className="mx-auto mb-8 flex max-w-screen-xl flex-col rounded-2xl bg-dark-blue p-3 sm:p-5">
            <h2 className="overflow-hidden text-ellipsis text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              {account.address}
            </h2>
            <div className="mt-2 flex flex-col gap-2 text-sm sm:text-base">
              <div className="flex gap-1">
                <p className="text-slate-400">Balance: </p>&nbsp;
                <p>
                  {result.data ? `${formatEther(result.data.value)} ${result.data.symbol}` : "0"}
                </p>
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
            <CardsSection />

            <div className="mt-5 flex flex-col gap-5 rounded-xl bg-destructive p-3 sm:p-5 lg:flex-row lg:gap-3">
              <div className="max-w-lg lg:max-w-72">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">Danger Zone</h3>
                <p className="mb-3 mt-2 text-lg">Burn your token!</p>
                <p>
                  You can burn your token here with ease. If you wonder what you will get by burning
                  your token, you actually get nothing :)
                </p>
              </div>
              <BurnTokenCard type="trv1" />
              <BurnTokenCard type="trv2" />
            </div>
          </article>
          <article className="mx-auto mb-20 flex max-w-screen-xl flex-col">
            <Tabs defaultValue="account">
              <TabsList>
                <TabsTrigger value="account">Stakes</TabsTrigger>
                <TabsTrigger value="password">Trove NFT</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <AllStakes />
              </TabsContent>
              <TabsContent value="password">Coming soon</TabsContent>
            </Tabs>
          </article>
        </>
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
