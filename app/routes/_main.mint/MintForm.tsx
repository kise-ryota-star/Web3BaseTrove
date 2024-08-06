// External Modules
import { useDeferredValue, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

// Internal Modules
import { trove1Address, useReadTrove1, useWriteTrove1 } from "~/generated";
import { safeBigIntDecimalToNumber, safeBigIntToEtherUnit, safeBigIntToNumber } from "~/lib/utils";

// Components
import ContractDetails from "~/components/ContractDetails";
import Stats from "~/components/Stats";
import { Slider } from "~/components/ui/slider";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";

// Types
import { type SimulateContractErrorType } from "@wagmi/core";

export default function MintForm() {
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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleMintButton();
    }
  };

  /**
   * Handle Mint button click
   */
  const handleMintButton = async () => {
    if (mintError) return;

    if (!account.isConnected && openConnectModal) {
      openConnectModal();
      return;
    }

    if (account.address) {
      try {
        const result = await troveWrite.writeContractAsync({
          functionName: "mint",
          value: BigInt(mintAmount * safeBigIntToNumber(mintCost)),
          args: [account.address, BigInt(mintAmount)],
        });
        toast({
          title: "Mint successful",
          description: `You have successfully minted ${mintAmount} TRV1 tokens. Transaction hash: ${result}`,
          variant: "success",
        });

        await totalBalanceAbi.refetch();
        setMintAmount(0);
      } catch (error) {
        function isSimulateContractErrorType(error: any): error is SimulateContractErrorType {
          return error && typeof error === "object" && "name" in error;
        }
        if (isSimulateContractErrorType(error)) {
          console.error(error.name);
          setMintError(error.message);
          if (error.name === "ContractFunctionExecutionError") {
            toast({
              title: "Unable to mint",
              description: "The mint transaction will most likely be reverted.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Unable to mint",
              description: "An error occurred while minting.",
              variant: "destructive",
            });
          }
          setTimeout(() => {
            setMintError("");
          }, 5000);
        } else {
          console.error(error);
        }
      }
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
              onKeyDown={handleInputKeyDown}
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
        variant={mintError ? "destructive" : "orange"}
      >
        {account.isConnected ? "Mint TRV1" : "Connect Wallet"}
      </Button>
      <div className="mx-2 mt-4 text-sm">
        <ContractDetails
          name="Contract address"
          value={trove1Address[31337].slice(0, 10) + "..."}
          copy={trove1Address[31337]}
        />
        <ContractDetails name="Decimal" value={`${tokenDecimal}`} />
        <ContractDetails name="Limit per mint" value={`${maxTokenPerMint}`} />
      </div>
    </div>
  );
}
