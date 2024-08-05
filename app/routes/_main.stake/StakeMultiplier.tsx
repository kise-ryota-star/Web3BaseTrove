// Components
import { CanvasRevealEffect } from "~/components/CanvasRevealEffect";
import MultiplierCard from "./MultiplierCard";
import { Clock4, Coins } from "lucide-react";

export default function StakeMultiplier() {
  return (
    <article className="mx-auto my-32 flex max-w-screen-lg flex-col sm:px-4">
      <div className="w-full">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl md:text-3xl">
          Your stake is boosted
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center sm:text-lg">
          The more you stake, the longer you stake, the more you get
        </p>

        <div className="mx-auto flex w-full flex-col items-center justify-center gap-4 py-10 md:flex-row">
          <MultiplierCard
            icon={
              <div className="flex flex-col items-center gap-2">
                <Clock4 size={36} />
                <p className="text-2xl">Time Multiplier</p>
              </div>
            }
            effect={
              <CanvasRevealEffect
                animationSpeed={5.1}
                containerClassName="bg-emerald-900 rounded-3xl"
                canvasClassName="rounded-3xl"
              />
            }
          >
            <ul className="text-center">
              <li className="mb-4">0 - 90 days: x1.0 multiplier</li>
              <li className="mb-4">91 - 180 days: x1.2 multiplier</li>
              <li className="mb-4">181 - 310 days: x1.5 multiplier</li>
              <li>311 - ♾️ days: x2.0 multiplier</li>
            </ul>
          </MultiplierCard>
          <MultiplierCard
            icon={
              <div className="flex flex-col items-center gap-2">
                <Coins size={36} />
                <p className="text-2xl">Amount Multiplier</p>
              </div>
            }
            effect={
              <CanvasRevealEffect
                animationSpeed={3}
                containerClassName="bg-sky-600  rounded-3xl"
                colors={[[125, 211, 252]]}
                canvasClassName="rounded-3xl"
              />
            }
          >
            <ul className="text-center">
              <li className="mb-4">1 - 20,000: x1.0 multiplier</li>
              <li className="mb-4">20,001 - 100,000: x1.2 multiplier</li>
              <li>100,001 - ♾️: x1.5 multiplier</li>
            </ul>
          </MultiplierCard>
        </div>
        <p className="text-center">**Stake reward is calculated daily</p>
      </div>
    </article>
  );
}
