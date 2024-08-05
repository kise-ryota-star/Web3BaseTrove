// Remix Modules
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { Scale, Github } from "lucide-react";
import { motion } from "framer-motion";

// Internal Modules
import { headlineVariants } from "~/lib/utils";

// Components
import InfoCard from "./InfoCard";
import { HeroHighlight, Highlight } from "~/components/HeroHighlight";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import AnimatedShinyText from "~/components/magicui/animated-shiny-text";

// Assets Imports
import etherscan from "~/assets/etherscan.svg";

import ethereumPng from "~/assets/ethereum/ethereum.png";
import ethereumWebp from "~/assets/ethereum/ethereum.webp";
import ethereumAvif from "~/assets/ethereum/ethereum.avif";

import basePng from "~/assets/base/base.png";
import baseWebp from "~/assets/base/base.webp";
import baseAvif from "~/assets/base/base.avif";

export const meta: MetaFunction = () => {
  return [{ title: "Home | Trove" }, { name: "description", content: "Welcome to Remix!" }];
};

export default function Index() {
  const featureCards = [
    {
      title: "Mint Your TRV1 Token",
      description:
        "Get started with Trove by minting your first TRV1 token. Simply pay the required amount of Ether, and our smart contract will generate TRV1 token, stored securely in your wallet. Begin your Trove journey today!",
      "cta-text": "Mint now",
      "cta-link": "/mint",
    },
    {
      title: "Stake Your TRV1 for TRV2",
      description:
        "Take your Trove experience to the next level by staking your TRV1 tokens. Our smart contract will reward you with TRV2 tokens, generated hourly, and stored in your wallet. The more you stake, the more you earn!",
      "cta-text": "Stake now",
      "cta-link": "/stake",
    },
    {
      title: "Bid on Exclusive NFTs",
      description:
        "Use your TRV2 tokens to bid on rare and exclusive NFTs, available only on Trove. Our auction system ensures a fair and transparent process, with winners receiving their NFTs instantly. Don't miss out on this opportunity to own a unique piece of digital art!",
      "cta-text": "Bid now",
      "cta-link": "/auction",
    },
  ];

  return (
    <>
      <HeroHighlight>
        <motion.div
          className="mx-auto max-w-md px-2 text-center text-neutral-700 dark:text-white sm:px-4 md:max-w-2xl lg:max-w-4xl"
          variants={headlineVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatedShinyText
            className="mb-4 inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600
              hover:duration-300 hover:dark:text-neutral-400"
          >
            <span>✨ Introducing Trove</span>
          </AnimatedShinyText>
          <h1
            className="mx-auto max-w-72 text-2xl font-semibold !leading-relaxed min-[460px]:max-w-none sm:text-4xl
              lg:text-5xl lg:leading-snug"
          >
            Unlock the Treasure: Mint, Stake, and Win{" "}
            <Highlight className="text-black dark:text-white">Exclusive NFTs</Highlight>
          </h1>
          <p className="mt-8 text-sm md:text-base lg:text-lg">
            Discover Trove, where cryptocurrency meets digital treasure. Mint TRV1, stake for TRV2,
            and bid on exclusive NFTs in our weekly auctions.
          </p>
          <div className="mx-auto flex max-w-56 flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="default" size="lg" className="mt-8">
              <Link to="/mint">Mint TRV1</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="sm:mt-8">
              <Link to="/stake">Get TRV2</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="sm:mt-8">
              <Link to="/auction">Bid NFT</Link>
            </Button>
          </div>
        </motion.div>
      </HeroHighlight>
      <article className="mt-4 px-2 sm:mt-12 md:px-4">
        <div
          className="relative z-10 mx-auto max-w-screen-xl rounded-2xl bg-[url('/images/home-bg.webp')] bg-cover
            bg-center bg-no-repeat px-4 py-6 before:absolute before:left-0 before:top-0 before:z-[-1]
            before:h-full before:w-full before:rounded-2xl before:bg-bottom-top-fade sm:px-8 sm:py-10
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
          and reliability on the Ethereum blockchain, the most widely adopted EVM blockchain.
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
      <section className="mx-auto my-20 flex max-w-screen-xl flex-col items-center px-4 text-center">
        <Badge variant="orange">How it works</Badge>
        <h2 className="mt-8 max-w-80 text-2xl font-medium md:max-w-md md:text-3xl lg:text-4xl">
          Mint, Stake, Bid within Trove ecosystem
        </h2>
        <div className="my-8 flex w-full flex-col justify-center gap-4 md:flex-row lg:gap-10">
          {featureCards.map((card, index) => (
            <Card key={index} className="flex w-full flex-col bg-dark-blue md:w-full">
              <CardHeader className="gap-3 text-left">
                <CardTitle className="font-medium leading-snug md:max-w-48">{card.title}</CardTitle>
                <CardDescription className="max-w-xl text-white md:max-w-56">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button asChild variant="white" className="w-full" size="lg">
                  <Link to={card["cta-link"]}>{card["cta-text"]}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
