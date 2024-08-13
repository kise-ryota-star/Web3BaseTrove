// External Modules
import { useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { MoveDown } from "lucide-react";
import { format } from "mathjs";
import { formatUnits } from "viem";

// Internal Modules
import {
  troveStakeAddress,
  useReadTrove1,
  useReadTroveStake,
  useWriteTroveStake,
} from "~/generated";
import { formatFloatToBigInt, isSimulateContractErrorType } from "~/lib/utils";

// Components
import Stats from "~/components/Stats";
import { Slider } from "~/components/ui/slider";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import ContractDetails from "~/components/ContractDetails";

export default function StakeForm() {
  const { openConnectModal } = useConnectModal();
  const account = useAccount();
  const { toast } = useToast();

  // Get the details of the user's token balance and trove1 token decimal
  const { data: trove1Balance, refetch: refetchTrv1Balance } = useReadTrove1({
    functionName: "balanceOf",
    args: account.address && [account.address],
  });
  const { data: trove1Allowance, refetch: refetchTrv1Allowance } = useReadTrove1({
    functionName: "allowance",
    args: account.address && [account.address, troveStakeAddress[31337]],
  });
  const { data: trove1Decimal } = useReadTrove1({ functionName: "decimals" });
  const eligibleToken =
    trove1Allowance && trove1Balance
      ? trove1Allowance > trove1Balance
        ? trove1Balance
        : trove1Allowance
      : 0n;
  const maxEligibleToken =
    eligibleToken && trove1Decimal ? Number(formatUnits(eligibleToken, trove1Decimal)) : 10_000;

  // Get the details of the stake contract
  const troveStakeWrite = useWriteTroveStake();
  const totalStakedAbi = useReadTroveStake({ functionName: "totalStaked" });
  const totalStakedCountAbi = useReadTroveStake({ functionName: "totalStakesCount" });
  const { data: stakeDailyBaseRate } = useReadTroveStake({ functionName: "dailyBaseRate" });
  const { data: stakeDailyQuota } = useReadTroveStake({ functionName: "dailyQuota" });
  const { data: stakeCurrentQuota, refetch: refetchStakeCurrentQuota } = useReadTroveStake({
    functionName: "currentQuota",
  });

  // Record the stake amount, used by both the slider and input
  const [stakeAmount, setStakeAmount] = useState("");
  const multiplier =
    parseFloat(stakeAmount) >= 100_001 ? 1.5 : parseFloat(stakeAmount) >= 20_001 ? 1.2 : 1.0;
  const stakeReward = format(
    (stakeAmount ? parseFloat(stakeAmount) : 0) *
      (stakeDailyBaseRate ? parseFloat(formatUnits(stakeDailyBaseRate, 18)) : 0) *
      multiplier,
    { precision: 14, lowerExp: -9 },
  );

  // Record the error when staking
  const [stakeError, setStakeError] = useState("");

  /**
   * Handle stake slider change
   */
  const handleSliderChange = (value: number[]) => {
    setStakeAmount(value[0].toString());
  };

  /**
   * Handle Stake input change
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
    if (num > maxEligibleToken) value = `${maxEligibleToken}`;

    setStakeAmount(value);
  };

  /**
   * Handle Stake button click
   */
  const handleMintButton = async () => {
    if (stakeError) return;

    if (!account.isConnected && openConnectModal) {
      openConnectModal();
      return;
    }

    if (!account.address) return;
    if (!stakeAmount) return;

    if (trove1Allowance === 0n) {
      toast({
        title: "Insufficient allowance",
        description: "Please approve the contract to transfer TRV1 tokens to start staking.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await troveStakeWrite.writeContractAsync({
        functionName: "stake",
        args: [formatFloatToBigInt(stakeAmount, 18)],
      });
      toast({
        title: "Stake successful",
        description: `You have successfully staked ${stakeAmount} TRV1 tokens. Transaction hash: ${result}`,
        variant: "success",
      });

      setStakeAmount("");
      await totalStakedAbi.refetch();
      await totalStakedCountAbi.refetch();
      await refetchStakeCurrentQuota();
      await refetchTrv1Balance();
      await refetchTrv1Allowance();
    } catch (error) {
      console.error(error);
      if (isSimulateContractErrorType(error)) {
        setStakeError(error.message);
        if (error.name === "ContractFunctionExecutionError") {
          toast({
            title: "Unable to Stake",
            description: "The stake transaction will most likely be reverted.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Unable to Stake",
            description: "An error occurred while staking.",
            variant: "destructive",
          });
        }
        setTimeout(() => {
          setStakeError("");
        }, 5000);
      }
    }
  };

  return (
    <div className="w-full rounded-xl bg-dark-blue p-3">
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
                max={maxEligibleToken}
                value={stakeAmount}
                onChange={handleInputChange}
              />
            }
            large
            figure="TRV1"
            className="w-full bg-accent-dark-blue shadow-none"
          />
          <div className="px-6 pb-6 pt-3">
            <Slider
              defaultValue={[0]}
              max={maxEligibleToken}
              step={1}
              value={[Math.round(Number(stakeAmount))]}
              onValueChange={handleSliderChange}
            />
            <p className="mt-4 text-xs">
              10,000 TRV1 token ={" "}
              {stakeDailyBaseRate
                ? Math.round(Number(formatUnits(stakeDailyBaseRate, 18)) * 10_000)
                : 0}{" "}
              TRV2 token
            </p>
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
          value={<span className="font-semibold">{stakeReward}</span>}
          large
          desc={`Every Day`}
          figure="TRV2"
          className="w-full overflow-auto bg-accent-dark-blue shadow-none"
        />
      </div>
      <Button
        onClick={handleMintButton}
        className="mt-2 w-full rounded-xl"
        size="lg"
        variant={stakeError ? "destructive" : "orange"}
      >
        {account.isConnected ? "Stake token" : "Connect Wallet"}
      </Button>
      <div className="mx-2 mb-4 mt-4 text-sm">
        <ContractDetails
          name="Contract address"
          value={troveStakeAddress[31337].slice(0, 10) + "..."}
          copy={troveStakeAddress[31337]}
        />
        <ContractDetails
          name="Daily reward rate"
          value={stakeDailyBaseRate ? formatUnits(stakeDailyBaseRate, 18).toString() : "0"}
        />
        <ContractDetails
          name="Daily claimable quota"
          value={stakeDailyQuota ? formatUnits(stakeDailyQuota, 18).toString() : "0"}
        />
        <ContractDetails
          name="Current claimable quota"
          value={stakeCurrentQuota ? formatUnits(stakeCurrentQuota, 18).toString() : "0"}
        />
      </div>
    </div>
  );
}
