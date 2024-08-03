// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { motion } from "framer-motion";

// Internal Modules
import { headlineVariants } from "~/lib/utils";

// Components
import Stats from "~/components/Stats";
import BurnTokenCard from "./BurnTokenCard";

// Assets Imports
import basePng from "~/assets/base/base.png";
import baseWebp from "~/assets/base/base.webp";
import baseAvif from "~/assets/base/base.avif";

export const meta: MetaFunction = () => {
  return [{ title: "Profile | Trove" }];
};

export default function Mint() {
  return (
    <motion.div variants={headlineVariants} initial="hidden" animate="visible" className="flex-1">
      <h1
        className="mx-auto mb-12 mt-10 max-w-72 text-center text-2xl font-semibold !leading-relaxed
          min-[460px]:max-w-none sm:text-4xl lg:text-5xl lg:leading-snug"
      >
        Your Profile
      </h1>
      <article className="mx-auto mb-20 flex max-w-screen-xl flex-col rounded-2xl bg-dark-blue p-3 sm:p-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">0x827d744652fbe...</h2>
        <div className="mt-2 flex flex-col gap-2 text-sm sm:text-base">
          <div className="flex gap-1">
            <p className="text-slate-400">Balance: </p>&nbsp;
            <p>9,999 ETH</p>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-slate-400">Chain: </p>&nbsp;
            <div className="flex items-center">
              <p>Base Sepolia</p>
              <picture>
                <source srcSet={baseAvif} type="image/avif" />
                <source srcSet={baseWebp} type="image/webp" />
                <img src={basePng} alt="Base Chain" className="ml-2 h-auto w-6 sm:w-8" />
              </picture>
            </div>
          </div>
        </div>

        {/* cards */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Stats
            title="Minted token"
            value="21,000"
            desc="TRV1"
            className="w-full bg-accent-dark-blue sm:w-1/2 md:w-full"
            large
          />
          <Stats
            title="Burned Token"
            value="21,000"
            desc="TRV1"
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
          <BurnTokenCard title="Burn TRV1" desc="TRV1" />
          <BurnTokenCard title="Burn TRV2" desc="TRV2" />
        </div>
      </article>
    </motion.div>
  );
}
