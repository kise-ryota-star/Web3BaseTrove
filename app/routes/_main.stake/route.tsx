// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { motion } from "framer-motion";

// Internal Modules
import { headlineVariants } from "~/lib/utils";

// Components
import StakeForm from "./StakeForm";
import StakeStatistics from "./StakeStatistics";
import StakeMultiplier from "./StakeMultiplier";
import Tokenomics from "./Tokenomics";
import HowItWorks from "./HowItWorks";
import StakeLiquidity from "./StakeLiquidity";
import { LampContainer } from "~/components/Lamp";

export const meta: MetaFunction = () => {
  return [{ title: "Stake | Trove" }];
};

export default function Mint() {
  return (
    <div className="mb-14">
      <motion.section
        variants={headlineVariants}
        initial="hidden"
        animate="visible"
        className="mb-24 flex-1"
      >
        <h1
          className="mx-auto mb-1 mt-10 max-w-72 text-center text-2xl font-semibold !leading-relaxed
            min-[460px]:max-w-none sm:text-4xl lg:text-5xl lg:leading-snug"
        >
          Stake TRV1 Token
        </h1>
        <p className="mx-auto mb-12 text-center">Get TRV2 token every day when you stake</p>
        <article className="mx-auto max-w-screen-lg rounded-2xl bg-dark-blue">
          <StakeForm />
        </article>
        {/* Stake Statistics section */}
        <StakeStatistics />
        {/* Stake multiplier section */}
        <StakeMultiplier />
        {/* Stake liquidity section */}
        <StakeLiquidity />
        {/* Tokenomics secton */}
        <Tokenomics />
        <LampContainer>
          {/* How does it work section */}
          <HowItWorks />
        </LampContainer>
      </motion.section>
    </div>
  );
}
