// External Modules
import { SimulateContractErrorType } from "@wagmi/core";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

// Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { troveStakeAddress, useReadTrove1, useWriteTrove1 } from "~/generated";
import { formatFloatToBigInt } from "~/lib/utils";

export default function StakeApproval() {
  const account = useAccount();
  const { toast } = useToast();

  // The smart contract handler
  const trove1Write = useWriteTrove1();
  const { data: trv1Amount, refetch: refetchTrv1Amount } = useReadTrove1({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });
  const { data: trv1Decimals } = useReadTrove1({
    functionName: "decimals",
  });
  const { data: trv1Allowance, refetch: refetchTrv1Allowance } = useReadTrove1({
    functionName: "allowance",
    args: account.address && [account.address, troveStakeAddress[31337]],
  });
  const maxApproval =
    trv1Amount && trv1Decimals ? Number(formatUnits(trv1Amount, trv1Decimals)) : 10_000;

  // To show the input field for advanced users to input the
  // amount of token to approve instead of using the full amount
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState(`${trv1Amount}`);
  const [approvalError, setApprovalError] = useState("");

  const handleShowAdvanced = () => {
    if (account.isDisconnected) return;

    setShowInput(!showInput);
  };

  const headlineVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  /**
   * Handle approval input change
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
      if (parts[1].length > 1e18) {
        value = `${parts[0]}.${parts[1].slice(0, 1e18)}`;
      }
    }

    let num = Number(value);
    if (num > maxApproval) value = `${maxApproval}`;

    setInputValue(value);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (account.isDisconnected || approvalError) return;
    if (trv1Amount === undefined || trv1Decimals === undefined || trv1Allowance === undefined)
      return;

    // Prevent user from approving the same maximum amount
    if (trv1Allowance === trv1Amount)
      return toast({
        title: "Nothing to approve",
        description: "Your stake eligible amount is the same as your owned TRV1 token",
        variant: "destructive",
      });

    try {
      const result = await trove1Write.writeContractAsync({
        functionName: "approve",
        args: [troveStakeAddress[31337], formatFloatToBigInt(inputValue, trv1Decimals)],
      });
      toast({
        title: "Approval successful",
        description: `You have successfully approved ${inputValue} TRV1 tokens. Transaction hash: ${result}`,
        variant: "success",
      });

      await refetchTrv1Amount();
      await refetchTrv1Allowance();
      setShowInput(false);
    } catch (error) {
      function isSimulateContractErrorType(error: any): error is SimulateContractErrorType {
        return error && typeof error === "object" && "name" in error;
      }
      if (isSimulateContractErrorType(error)) {
        console.log(error);
        setApprovalError(error.message);
        if (error.name === "ContractFunctionExecutionError") {
          toast({
            title: "Token Approval Failed",
            description: "The approval transaction will most likely be reverted.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Token Approval Failed",
            description: "An error occurred while approving token.",
            variant: "destructive",
          });
        }
        setTimeout(() => {
          setApprovalError("");
        }, 5000);
      } else {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (account.isDisconnected) return;

    if (trv1Amount && trv1Decimals) setInputValue(formatUnits(trv1Amount, trv1Decimals));
  }, [trv1Amount]);

  return (
    <article id="stake-approval" className="mx-auto my-14 flex max-w-screen-lg flex-col sm:px-4">
      <div className="w-full">
        <h2 className="text-xl font-semibold sm:text-2xl md:text-3xl">
          Make your TRV1 Stake Eligible
        </h2>
        <p className="mt-2 text-sm sm:text-base">
          In order to stake, you need to authorized the staking smart contract to have the ability
          to transfer your TRV1 token to the smart contract. By approving the smart contract to
          transfer your token, the smart contract will only transfer the amount of token that you
          stake, but not the whole amount you approve.
        </p>
        <ul className="mt-5 text-sm sm:text-base">
          <li>Owned TRV1 - The amount of TRV1 token you have owned</li>
          <li>Eligible stake - The amount of TRV1 token that you can stake</li>
        </ul>
      </div>
      <form className="mt-6" onSubmit={handleFormSubmit}>
        <div className="flex items-center">
          <Button
            disabled={account.isDisconnected}
            type="submit"
            size="lg"
            variant={approvalError ? "destructive" : "orange"}
          >
            {account.isConnected ? "Approve" : "Wallet not connected"}
          </Button>
          <Button
            onClick={handleShowAdvanced}
            type="button"
            className="ml-5"
            size="sm"
            variant="underline"
            disabled={account.isDisconnected}
          >
            Advanced
            <ChevronDown
              className={`ml-2 transition-transform duration-500 ${showInput && "rotate-180"}`}
              size={18}
            />
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {showInput && (
            <motion.div
              variants={headlineVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mt-4"
            >
              <Input
                disabled={account.isDisconnected}
                type="text"
                value={inputValue}
                className="border-2 border-white/70"
                onChange={handleInputChange}
                max={maxApproval}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </article>
  );
}
