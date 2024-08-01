// External Modules
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

// Internal Modules
import { useReadTrove1 } from "~/generated";

// Components
import Stats from "~/components/Stats";
import { Slider } from "~/components/ui/slider";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useDeferredValue, useState } from "react";
import { safeBigIntDecimalToNumber, safeBigIntToEtherUnit, safeBigIntToNumber } from "~/lib/utils";

export default function MintForm() {
  const { openConnectModal } = useConnectModal();

  const { data: tokenDecimal } = useReadTrove1({ functionName: "decimals" });
  const maxTokenPerMintAbi = useReadTrove1({ functionName: "maxTokenPerMint" });
  const maxTokenPerMint = safeBigIntDecimalToNumber(maxTokenPerMintAbi.data, tokenDecimal);
  const { data: mintCost } = useReadTrove1({ functionName: "mintPrice" });
  const mintPrice = safeBigIntToEtherUnit(mintCost);

  // Record the mint amount, used by both the slider and input
  const [mintAmount, setMintAmount] = useState(0);
  const deferredMintAmount = useDeferredValue(mintAmount);

  const account = useAccount();

  /**
   * Handle mint slider change
   */
  const handleSliderChange = (value: number[]) => {
    setMintAmount(value[0]);
  };

  /**
   * Handle mint input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let value = inputValue.replace(/[^0-9.]/g, ""); // Allow only numeric and decimal values
    let num = Number(value);

    if (num > maxTokenPerMint) num = maxTokenPerMint;

    setMintAmount(num);
  };

  /**
   * Handle Mint button click
   */
  const handleMintButton = () => {
    if (!account.isConnected && openConnectModal) {
      openConnectModal();
      return;
    }
  };

  return (
    <div className="w-full rounded-xl bg-dark-blue p-3 md:w-2/3">
      <div className="rounded-2xl bg-accent-dark-blue shadow">
        <Stats
          title="Mint"
          value={
            <Input
              type="text"
              placeholder="0"
              className="focus !focus-visible:!shadow-none my-2 !border-none !bg-transparent pl-0 text-4xl font-medium
                outline-none !ring-transparent focus-visible:!border-none focus-visible:!outline-none
                focus-visible:!ring-offset-0"
              maxLength={maxTokenPerMint.toString().length}
              max={maxTokenPerMint}
              value={mintAmount}
              onChange={handleInputChange}
            />
          }
          desc={`${(deferredMintAmount * safeBigIntToNumber(mintCost)).toLocaleString()} Sepolia Wei`}
          figure="TRV1"
          className="w-full bg-accent-dark-blue shadow-none"
        />
        <div className="px-6 pb-6 pt-3">
          <Slider
            defaultValue={[33]}
            max={maxTokenPerMint}
            step={1}
            value={[mintAmount]}
            onValueChange={handleSliderChange}
          />
          <p className="mt-4 text-xs">
            1 TRV1 token = {mintPrice !== 0 ? mintPrice.amount : 0} Sepolia{" "}
            {mintPrice !== 0 ? mintPrice.unit : ""}
          </p>
        </div>
      </div>
      <Button
        onClick={handleMintButton}
        className="mt-2 w-full rounded-xl"
        size="lg"
        variant="orange"
      >
        {account.isConnected ? "Mint TRV1" : "Connect Wallet"}
      </Button>
      <div></div>
    </div>
  );
}
