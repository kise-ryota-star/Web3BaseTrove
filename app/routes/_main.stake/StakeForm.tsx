// External Modules
import { useDeferredValue, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { MoveDown } from "lucide-react";

// Internal Modules
import { trove1Address, useReadTrove1, useWriteTrove1 } from "~/generated";
import { safeBigIntDecimalToNumber, safeBigIntToEtherUnit, safeBigIntToNumber } from "~/lib/utils";

// Components
import Stats from "~/components/Stats";
import { Slider } from "~/components/ui/slider";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";

// Types
import { type SimulateContractErrorType } from "@wagmi/core";
import ContractDetails from "~/components/ContractDetails";

export default function StakeForm() {
  const { openConnectModal } = useConnectModal();
  const account = useAccount();
  const { toast } = useToast();

  // Get the details of the token, such as decimals, max mint per transaction, and mint price
  const { data: tokenDecimal } = useReadTrove1({ functionName: "decimals" });
  const maxTokenPerMintAbi = useReadTrove1({ functionName: "maxTokenPerMint" });
  const maxTokenPerMint = safeBigIntDecimalToNumber(maxTokenPerMintAbi.data, tokenDecimal);
  const { data: mintCost } = useReadTrove1({ functionName: "mintPrice" });
  const mintPrice = safeBigIntToEtherUnit(mintCost);
  const totalBalanceAbi = useReadTrove1({ functionName: "totalBalance" });

  const troveWrite = useWriteTrove1();

  // Record the mint amount, used by both the slider and input
  const [mintAmount, setMintAmount] = useState(0);
  const deferredMintAmount = useDeferredValue(mintAmount);

  // Record the error when minting
  const [mintError, setMintError] = useState("");

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
  const handleMintButton = async () => {};

  return (
    <form className="w-full rounded-xl bg-dark-blue p-3">
      <div className="relative">
        <div className="mb-2 rounded-2xl bg-accent-dark-blue shadow">
          <Stats
            title="Stake"
            value={
              <Input
                type="text"
                placeholder="0"
                className="focus !focus-visible:!shadow-none my-2 !border-none !bg-transparent pl-0 text-4xl font-medium
                  outline-none !ring-transparent focus-visible:!border-none focus-visible:!outline-none
                  focus-visible:!ring-offset-0 md:h-12 md:text-5xl lg:h-14 lg:text-6xl"
                maxLength={maxTokenPerMint.toString().length}
                max={maxTokenPerMint}
                value={mintAmount}
                onChange={handleInputChange}
              />
            }
            large
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
            <p className="mt-4 text-xs">1000 TRV1 token = 6 TRV2 token</p>
          </div>
        </div>
        <Button
          type="button"
          className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2"
          size="icon"
          variant="blue"
        >
          <MoveDown />
        </Button>
      </div>
      <div className="rounded-2xl bg-accent-dark-blue shadow">
        <Stats
          title="Reward"
          value={<span className="font-semibold">{6}</span>}
          large
          desc={`Every Day`}
          figure="TRV2"
          className="w-full bg-accent-dark-blue shadow-none"
        />
      </div>
      <Button
        onClick={handleMintButton}
        className="mt-2 w-full rounded-xl"
        size="lg"
        variant={mintError ? "destructive" : "orange"}
      >
        {account.isConnected ? "Mint TRV1" : "Connect Wallet"}
      </Button>
      <div className="mx-2 mb-4 mt-4 text-sm">
        <ContractDetails
          name="Contract address"
          value={trove1Address[31337].slice(0, 10) + "..."}
          copy={trove1Address[31337]}
        />
        <ContractDetails name="Decimal" value={`${tokenDecimal}`} />
        <ContractDetails name="Limit per mint" value={`${maxTokenPerMint}`} />
      </div>
    </form>
  );
}
