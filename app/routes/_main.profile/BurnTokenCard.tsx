// External Modules
import { useState } from "react";
import { useReadTrove1, useWriteTrove1 } from "~/generated";
import { useAccount } from "wagmi";
import type { SimulateContractErrorType } from "viem";

// Internal Modules
import { formatFloatToBigInt, safeBigIntDecimalToNumber } from "~/lib/utils";

// Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";

interface BurnTokenCardProps {
  title: string;
  desc: string;
  max: number | bigint;
  decimals: number;
}

function BurnTokenCard({ title, desc, max, decimals }: BurnTokenCardProps) {
  const { toast } = useToast();
  const account = useAccount();
  const troveWrite = useWriteTrove1();
  // Record the mint amount, used by both the slider and input
  const [burnAmount, setBurnAmount] = useState("");
  const [burnError, setBurnError] = useState("");

  const trv1AmountAbi = useReadTrove1({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });

  /**
   * Handle mint input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let value = inputValue.replace(/[^0-9.]/g, ""); // Allow only numeric and decimal values

    // Optional: Ensure only one decimal point
    let decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      let parts = value.split(".");
      value = parts[0] + "." + parts.slice(1).join("");
    }
    // Optional: Remove leading decimal point
    if (value.startsWith(".")) {
      value = value.substring(1);
    }

    const hasDecimal = value.indexOf(".") !== -1;
    if (hasDecimal) {
      const parts = value.split(".");
      if (parts[1].length > decimals) {
        value = `${parts[0]}.${parts[1].slice(0, decimals)}`;
      }
    }

    const maxValue = typeof max === "bigint" ? safeBigIntDecimalToNumber(max, decimals) : max;

    let num = Number(value);
    if (num > maxValue) value = `${maxValue}`;

    setBurnAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (account.address === undefined) return;
    if (burnError) return;
    if (burnAmount === "0" || burnAmount === "" || !burnAmount) return;

    try {
      console.log("burnAmount", formatFloatToBigInt(burnAmount, decimals));
      const result = await troveWrite.writeContractAsync({
        functionName: "burn",
        args: [formatFloatToBigInt(burnAmount, decimals)],
      });
      toast({
        title: "Burned successful",
        description: `You have successfully burned ${burnAmount} ${desc} tokens. Transaction hash: ${result}`,
        variant: "success",
      });

      await trv1AmountAbi.refetch();
      setBurnAmount(``);
    } catch (error) {
      function isSimulateContractErrorType(error: any): error is SimulateContractErrorType {
        return error && typeof error === "object" && "name" in error;
      }
      if (isSimulateContractErrorType(error)) {
        console.log(error.name);
        setBurnError(error.message);
        if (error.name === "ContractFunctionExecutionError") {
          toast({
            title: "Unable to burn",
            description: "The burn transaction will most likely be reverted.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Unable to burn",
            description: "An error occurred while burning.",
            variant: "destructive",
          });
        }
        setTimeout(() => {
          setBurnError("");
        }, 5000);
      } else {
        console.log(error);
      }
    }
  };

  return (
    <form className="rounded-xl bg-background p-4" onSubmit={handleSubmit}>
      <h4>{title}</h4>
      <Input
        type="text"
        placeholder="0"
        className="focus !focus-visible:!shadow-none my-2 !border-none !bg-transparent pl-0 text-4xl font-medium
          text-amber-500 outline-none !ring-transparent placeholder:text-amber-500 focus-visible:!border-none
          focus-visible:!outline-none focus-visible:!ring-offset-0"
        max={typeof max === "bigint" ? safeBigIntDecimalToNumber(max, decimals) : max}
        value={burnAmount}
        onChange={handleInputChange}
      />
      <p className="text-slate-400">{desc}</p>
      <Button
        type="submit"
        variant={burnError ? "destructive" : "orange"}
        size="lg"
        className="mt-10 w-full"
      >
        Burn Token
      </Button>
    </form>
  );
}

export default BurnTokenCard;
