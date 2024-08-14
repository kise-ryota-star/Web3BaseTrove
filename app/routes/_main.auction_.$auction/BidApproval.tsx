// External Modules
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

// Internal Modules
import {
  troveAuctionAddress,
  useReadTrove2,
  useReadTroveAuction,
  useWriteTrove2,
} from "~/generated";
import { formatFloatToBigInt, isSimulateContractErrorType } from "~/lib/utils";

// Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";

export default function BidApproval() {
  const account = useAccount();
  const { toast } = useToast();

  // The smart contract handler
  const trove2Write = useWriteTrove2();
  const { data: trv2Amount, refetch: refetchTrv2Amount } = useReadTrove2({
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
  });
  const { data: trv2Decimals } = useReadTrove2({
    functionName: "decimals",
  });
  const { data: trv2Allowance, refetch: refetchTrv2Allowance } = useReadTrove2({
    functionName: "allowance",
    args: account.address && [account.address, troveAuctionAddress[31337]],
  });
  const { data: scalingFactor } = useReadTroveAuction({
    functionName: "SCALING_FACTOR",
  });
  const maxApproval =
    trv2Amount && trv2Decimals ? Number(formatUnits(trv2Amount, trv2Decimals)) : 0;

  // To show the input field for advanced users to input the
  // amount of token to approve instead of using the full amount
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState(`0`);
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
    if (scalingFactor === undefined) return;
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
      if (parts[1].length > Number(scalingFactor)) {
        value = `${parts[0]}.${parts[`1`].slice(0, Number(scalingFactor))}`;
      }
    }

    let num = Number(value);
    if (num > maxApproval) value = `${maxApproval}`;

    setInputValue(value);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (account.isDisconnected || approvalError) return;
    if (trv2Amount === undefined || trv2Decimals === undefined || trv2Allowance === undefined)
      return;

    // Prevent user from approving the same maximum amount
    if (trv2Allowance === trv2Amount)
      return toast({
        title: "Nothing to approve",
        description: "Your stake eligible amount is the same as your owned TRV2 token",
        variant: "destructive",
      });

    try {
      const result = await trove2Write.writeContractAsync({
        functionName: "approve",
        args: [troveAuctionAddress[31337], formatFloatToBigInt(inputValue, trv2Decimals)],
      });
      toast({
        title: "Approval successful",
        description: `You have successfully approved ${inputValue} TRV2 tokens. Transaction hash: ${result}`,
        variant: "success",
      });

      await refetchTrv2Amount();
      await refetchTrv2Allowance();
      setShowInput(false);
    } catch (error) {
      console.error(error);
      if (isSimulateContractErrorType(error)) {
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
      }
    }
  };

  useEffect(() => {
    if (account.isDisconnected) return;

    if (trv2Amount && trv2Decimals) setInputValue(formatUnits(trv2Amount, trv2Decimals));

    // Reset the input value when the user closes the input field
    if (!showInput && trv2Amount && trv2Decimals)
      setInputValue(formatUnits(trv2Amount, trv2Decimals));
  }, [trv2Amount, trv2Decimals, showInput]);

  return (
    <article id="stake-approval" className="mx-auto my-14 flex max-w-screen-lg flex-col sm:px-4">
      <div className="w-full">
        <h2 className="text-xl font-semibold sm:text-2xl md:text-3xl">
          Approve TRV2 token before you bid
        </h2>
        <p className="mt-2 text-sm sm:text-base">
          In order to bid, you need to authorized the auction smart contract to have the ability to
          transfer your TRV2 token to the smart contract. By approving the smart contract to
          transfer your token, the smart contract will only transfer the amount of token that you
          bid, but not the whole amount you approve.
        </p>
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
