// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { useState } from "react";
import { motion } from "framer-motion";

// Components
import NavHeader from "~/components/NavHeader";
import { HeroHighlight, Highlight } from "~/components/HeroHighlight";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export default function Index() {
  const headlineVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
  };

  return (
    <div className="p-4">
      <NavHeader />
      <HeroHighlight>
        <motion.div
          className="mx-auto max-w-md px-4 text-center text-neutral-700 dark:text-white md:max-w-2xl lg:max-w-4xl"
          variants={headlineVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-2xl font-semibold !leading-relaxed md:text-4xl lg:text-5xl lg:leading-snug">
            Unlock the Treasure: Mint, Stake, and Win{" "}
            <Highlight className="text-black dark:text-white">Exclusive NFTs</Highlight>
          </h1>
          <p className="mt-8 text-sm md:text-base lg:text-lg">
            Discover Trove, where cryptocurrency meets digital treasure. Mint TRV1, stake for TRV2,
            and bid on exclusive NFTs in our hourly auctions.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="default" size="lg" className="mt-8">
              Mint TRV1
            </Button>
            <Button variant="outline" size="lg" className="mt-8">
              Get TRV2
            </Button>
            <Button variant="outline" size="lg" className="mt-8">
              Bid NFT
            </Button>
          </div>
        </motion.div>
      </HeroHighlight>
    </div>
  );
}
