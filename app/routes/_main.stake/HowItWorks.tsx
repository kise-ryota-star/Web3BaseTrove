// External Modules
import { motion } from "framer-motion";

// Assets Imports
import spacePng from "~/assets/bg/space.png";
import FeatureBar from "./FeatureBar";

export default function HowItWorks() {
  const steps = [
    {
      title: "TRV2 only mintable through staking TRV1",
      description: `TRV2 is a unique token that can only be obtained by staking TRV1, demonstrating a user's
            dedication to the Trove ecosystem. This exclusive minting process ensures that TRV2
            holders have a vested interest in the platform's success, fostering a sense of community
            and cooperation.`,
      image: "space" as "space",
    },
    {
      title: "The token to bid in Trove Auction for NFT",
      description: `TRV2 is the exclusive token used for bidding in Trove Auctions, where rare and unique NFTs are up for grabs. By participating in these auctions, TRV2 holders can acquire highly sought-after digital assets, further enriching the Trove ecosystem.`,
      image: "explorer" as "explorer",
    },
    {
      title: "Show commitment to Trove ecosystem",
      description: `Holding TRV2 is a badge of honor, signifying a user's long-term commitment to the Trove ecosystem. By staking TRV1 to obtain TRV2, users demonstrate their trust in the platform's vision and their willingness to contribute to its growth and development.`,
      image: "nebula" as "nebula",
    },
  ];

  return (
    <motion.article
      initial={{ opacity: 0.5, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut",
      }}
      className="mx-auto mt-32 flex max-w-screen-lg flex-col sm:px-4"
    >
      <div className="w-full">
        <h2 className="mb-12 text-center text-3xl font-semibold sm:text-4xl md:text-5xl">
          How does it work?
        </h2>
        <FeatureBar
          itemNumber={1}
          title={steps[0].title}
          image={steps[0].image}
          description={steps[0].description}
        />
        <FeatureBar
          itemNumber={2}
          title={steps[1].title}
          image={steps[1].image}
          description={steps[1].description}
          titleFirst={false}
        />
        <FeatureBar
          itemNumber={3}
          title={steps[2].title}
          image={steps[2].image}
          description={steps[2].description}
        />
      </div>
    </motion.article>
  );
}
