// Remix Modules
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { Scale, Github } from "lucide-react";
import { motion } from "framer-motion";

// Components
import NavHeader from "~/components/NavHeader";
import InfoCard from "./InfoCard";
import { HeroHighlight, Highlight } from "~/components/HeroHighlight";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

// Assets Imports
import etherscan from "~/assets/etherscan.svg";

import ethereumPng from "~/assets/ethereum/ethereum.png";
import ethereumWebp from "~/assets/ethereum/ethereum.webp";
import ethereumAvif from "~/assets/ethereum/ethereum.avif";

import basePng from "~/assets/base/base.png";
import baseWebp from "~/assets/base/base.webp";
import baseAvif from "~/assets/base/base.avif";

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
      <article className="px-4">
        <div
          className="relative z-10 mx-auto max-w-screen-xl rounded-2xl bg-[url('/images/home-bg.webp')] bg-cover
            bg-center bg-no-repeat px-8 py-10 before:absolute before:left-0 before:top-0 before:z-[-1]
            before:h-full before:w-full before:rounded-2xl before:bg-bottom-top-fade
            before:md:bg-left-right-fade"
        >
          <h2 className="mb-5 max-w-sm text-2xl font-bold md:text-3xl lg:text-4xl">
            Decentralized and Open Source
          </h2>
          <div className="leading-relaxed dark:text-white md:max-w-screen-sm xl:max-w-screen-md">
            <p>
              The entire project's source code is open-sourced and publicly available on GitHub. Our
              smart contracts are also published and verified on Etherscan. Anyone can review the
              code and technology behind Trove.
            </p>
            <p className="my-3">
              There are no backend servers executing the logic, decentralized means that the entire
              platform operates solely on the blockchain, ensuring that all interactions are
              transparent, secure, and censorship-resistant.
            </p>
          </div>
          <div className="mt-10 flex w-full flex-col gap-4 md:flex-row">
            <InfoCard
              className="w-full flex-1 md:w-1/4"
              cardIllustration={<Github className="mx-auto h-auto w-10 md:w-14" />}
              cardTitle="GitHub"
              link="https://github.com/AlstonChan/TokenTrove"
            />
            <InfoCard
              className="w-full flex-1 md:w-1/4"
              cardIllustration={
                <img src={etherscan} alt="etherscan" className="mx-auto h-auto w-10 md:w-14" />
              }
              cardTitle="Etherscan"
              link=""
            />
            <InfoCard
              className="w-full flex-1 md:w-1/4"
              cardIllustration={<Scale className="mx-auto h-auto w-10 md:w-14" />}
              cardTitle="License"
              link="https://github.com/AlstonChan/TokenTrove/blob/main/LICENSE.txt"
            />
          </div>
        </div>
      </article>
      <section className="mx-auto my-14 flex max-w-screen-xl flex-col items-center px-4 text-center">
        <Badge variant="orange">EVM compatible Layer 2</Badge>
        <h2 className="mt-12 max-w-80 text-2xl font-medium md:max-w-md md:text-3xl lg:text-4xl">
          Built on Base chain, secured by Ethereum
        </h2>
        <p className="mt-4 max-w-3xl text-sm sm:text-base lg:text-lg">
          Built on Base chain, a scalable Ethereum Layer 2 blockchain, Trove offers a seamless
          experience with lower gas fees and faster transactions, all while maintaining the security
          and reliability of the Ethereum blockchain, the most widely adopted EVM blockchain.
        </p>
        <div className="my-10 flex items-center justify-center gap-10">
          <picture>
            <source srcSet={baseAvif} type="image/avif" />
            <source srcSet={baseWebp} type="image/webp" />
            <img src={basePng} alt="Base Chain" className="h-auto w-full" />
          </picture>
          <picture>
            <source srcSet={ethereumAvif} type="image/avif" />
            <source srcSet={ethereumWebp} type="image/webp" />
            <img src={ethereumPng} alt="Ethereum" className="h-auto w-full" />
          </picture>
        </div>
      </section>
    </div>
  );
}
