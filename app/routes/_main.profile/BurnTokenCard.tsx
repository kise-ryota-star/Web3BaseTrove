// External Modules
import { useState } from "react";
import { useReadTrove1, useReadTrove2, useWriteTrove1, useWriteTrove2 } from "~/generated";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

// Internal Modules
import { formatFloatToBigInt, isSimulateContractErrorType } from "~/lib/utils";

// Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";

interface BurnTokenCardProps {
  type: "trv1" | "trv2";
}

function BurnTokenCard({ type }: BurnTokenCardProps) {
  const { toast } = useToast();
  const account = useAccount();

  // Record the mint amount, used by both the slider and input
  const [burnAmount, setBurnAmount] = useState("");
  const [burnError, setBurnError] = useState("");

  const trv1Write = useWriteTrove1();
  const trv1AmountAbi = useReadTrove1({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });
  const { data: trv1Decimals } = useReadTrove1({ functionName: "decimals" });
  const { data: trv1Amount } = useReadTrove1({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });

  const trv2Write = useWriteTrove2();
  const trv2AmountAbi = useReadTrove2({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });
  const { data: trv2Decimals } = useReadTrove2({ functionName: "decimals" });
  const { data: trv2Amount } = useReadTrove2({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });

  const maxAmount =
    type === "trv1"
      ? trv1Amount && trv1Decimals
        ? Number(formatUnits(trv1Amount, trv1Decimals))
        : 0
      : trv2Amount && trv2Decimals
        ? Number(formatUnits(trv2Amount, trv2Decimals))
        : 0;
  const decimals = type === "trv1" ? trv1Decimals : trv2Decimals;
  const desc = type === "trv1" ? "TRV1" : "TRV2";
  const title = `Burn ${desc} Tokens`;

  /**
   * Handle mint input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!decimals) return;
    const inputValue = e.target.value;
    let value = inputValue.replace(/[^0-9.]/g, ""); // Allow only numeric and decimal values

    // Optional: Ensure only one decimal point
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = value.split(".");
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

    const num = Number(value);
    if (num > maxAmount) value = `${maxAmount}`;

    setBurnAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (account.address === undefined) return;
    if (burnError) return;
    if (burnAmount === "0" || burnAmount === "" || !burnAmount) return;

    try {
      if (type === "trv1") {
        if (!trv1Decimals) return;
        const result = await trv1Write.writeContractAsync({
          functionName: "burn",
          args: [formatFloatToBigInt(burnAmount, trv1Decimals)],
        });
        toast({
          title: "Burned successful",
          description: `You have successfully burned ${burnAmount} ${desc} tokens. Transaction hash: ${result}`,
          variant: "success",
        });

        await trv1AmountAbi.refetch();
      } else {
        if (!trv2Decimals) return;

        const result = await trv2Write.writeContractAsync({
          functionName: "burn",
          args: [formatFloatToBigInt(burnAmount, trv2Decimals)],
        });
        toast({
          title: "Burned successful",
          description: `You have successfully burned ${burnAmount} ${desc} tokens. Transaction hash: ${result}`,
          variant: "success",
        });

        await trv2AmountAbi.refetch();
      }
      setBurnAmount(``);
    } catch (error) {
      console.error(error);
      if (isSimulateContractErrorType(error)) {
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
        max={maxAmount}
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
