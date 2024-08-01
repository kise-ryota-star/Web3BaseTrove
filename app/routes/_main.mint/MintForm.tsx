// External Modules

// Components
import Stats from "~/components/Stats";
import { Slider } from "~/components/ui/slider";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";

export default function MintForm() {
  const [mintAmount, setMintAmount] = useState(0);
  //   const deferredMintAmount = mintAmount

  const handleSliderChange = (value: number[]) => {
    setMintAmount(value[0]);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMintAmount(Number(e.target.value));
  };

  return (
    <div className="w-full rounded-xl bg-dark-blue p-3 md:w-2/3">
      <div className="bg-accent-dark-blue rounded-2xl shadow">
        <Stats
          title="Mint"
          value={
            <Input
              type="text"
              placeholder="0"
              className="focus !focus-visible:!shadow-none my-2 !border-none !bg-transparent pl-0 text-4xl font-medium
                outline-none !ring-transparent focus-visible:!border-none focus-visible:!outline-none
                focus-visible:!ring-offset-0"
              maxLength={16}
              value={mintAmount}
              onChange={handleInputChange}
            />
          }
          desc="0.00004 Sepolia ETH"
          figure="TRV1"
          className="bg-accent-dark-blue w-full shadow-none"
        />
        <div className="px-6 pb-6 pt-3">
          <Slider
            defaultValue={[33]}
            max={100}
            step={1}
            value={[mintAmount]}
            onValueChange={handleSliderChange}
          />
          <p className="mt-4 text-xs">1 TRV1 token = 1000 Sepolia Wei</p>
        </div>
      </div>
      <Button className="mt-2 w-full rounded-xl" size="lg" variant="orange">
        Mint
      </Button>
      <div></div>
    </div>
  );
}
