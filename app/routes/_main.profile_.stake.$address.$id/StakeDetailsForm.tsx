// External Modules
import { useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

// Internal Modules
import { useReadTrove2, useReadTroveStake, useWriteTroveStakeClaim } from "~/generated";

// Components
import ContractDetails from "~/components/ContractDetails";
import Stats from "~/components/Stats";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { useToast } from "~/components/ui/use-toast";
import { formatFloatToBigInt } from "~/lib/utils";

interface StakeDetailsFormProps {
  address: `0x${string}`;
  id: number;
  stake: {
    active: boolean;
    amount: bigint;
    start: bigint;
    claimed: bigint;
  };
}

const ninetyOneDays = 60 * 60 * 24 * 91 * 1000;
const oneHundredAndEightyOneDays = 60 * 60 * 24 * 181 * 1000;
const threeHundredAndElevenDays = 60 * 60 * 24 * 311 * 1000;

export default function StakeDetailsForm({ address, id, stake }: StakeDetailsFormProps) {
  const { toast } = useToast();
  const account = useAccount();
  const [claimAmount, setClaimAmount] = useState("");

  const troveStakeClaimReward = useWriteTroveStakeClaim();

  // Get data from smart contract
  const { data: trove2Address } = useReadTroveStake({ functionName: "trove2" });
  const { refetch: refetchTrv2Supply } = useReadTrove2({
    functionName: "totalSupply",
    address: trove2Address,
  });
  const { data: currentQuota, refetch: refetchQuota } = useReadTroveStake({
    functionName: "currentQuota",
  });
  const { refetch: refetchStakeStatus } = useReadTroveStake({
    functionName: "stakeStatus",
    args: [address],
  });
  const { refetch: refetchClaimable } = useReadTroveStake({
    functionName: "claimableRewards",
    args: [address],
  });
  const { data: stakeClaimableRewards, refetch: refetchStakeClaimable } = useReadTroveStake({
    functionName: "stakeClaimableRewards",
    args: [address, BigInt(Number(id))],
  });

  const currentClaimable = currentQuota
    ? Number(formatUnits(currentQuota, 18)).toLocaleString()
    : 0;
  const maxAmount = stakeClaimableRewards
    ? Number(formatUnits(stakeClaimableRewards - stake.claimed, 18))
    : 0;

  const startDate = new Date(Number(stake.start) * 1000).getTime();
  const timeMultiplier =
    Date.now() > startDate + threeHundredAndElevenDays
      ? "x2.0"
      : Date.now() > startDate + oneHundredAndEightyOneDays
        ? "x1.5"
        : Date.now() > startDate + ninetyOneDays
          ? "x1.2"
          : "x1.0";
  const amountMultiplier =
    Number(formatUnits(stake.amount, 18)) >= 100_001
      ? "x1.5"
      : Number(formatUnits(stake.amount, 18)) >= 20_001
        ? "x1.2"
        : "x1.0";

  /**
   * Handle claim reward button click
   */
  const handleClaimReward = async (e: React.FormEvent) => {
    e.preventDefault();

    if (account.isDisconnected) return;

    if (Number(claimAmount) === 0)
      return toast({
        title: "Unable to claim rewards",
        description: "You cannot claim 0 TRV2",
        variant: "destructive",
      });

    try {
      // Write data to smart contract
      const result = await troveStakeClaimReward.writeContractAsync({
        args: [BigInt(id), formatFloatToBigInt(claimAmount, 18)],
      });

      toast({
        title: "Claim Rewards",
        description: `Rewards claimed successfully. Transaction Id: ${result}`,
        variant: "success",
      });

      await refetchClaimable();
      await refetchStakeStatus();
      await refetchQuota();
      await refetchStakeClaimable();
      await refetchTrv2Supply();
      setClaimAmount("");
    } catch (error) {
      toast({
        title: "Claim Rewards",
        description: "Failed to claim rewards",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  /**
   * Handle claim amount slider change
   */
  const handleSliderChange = (value: number[]) => {
    setClaimAmount(value[0].toString());
  };

  /**
   * Handle claim amount input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const decimals = 18;
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

    let num = Number(value);
    if (num > maxAmount) value = `${maxAmount}`;

    setClaimAmount(value);
  };

  return (
    <form onSubmit={handleClaimReward} className="w-full rounded-xl bg-dark-blue p-3 md:w-2/3">
      <div className="rounded-2xl bg-accent-dark-blue shadow">
        <Stats
          title="Claim Rewards"
          value={
            <Input
              type="text"
              placeholder="0"
              className="focus !focus-visible:!shadow-none my-2 !border-none !bg-transparent pl-0 text-4xl font-medium
                outline-none !ring-transparent focus-visible:!border-none focus-visible:!outline-none
                focus-visible:!ring-offset-0"
              max={maxAmount}
              value={claimAmount}
              onChange={handleInputChange}
              disabled={account.isDisconnected}
            />
          }
          figure="TRV2"
          className="w-full bg-accent-dark-blue shadow-none"
        />
        <div className="px-6 pb-6 pt-3">
          <Slider
            defaultValue={[0]}
            max={maxAmount}
            step={1}
            value={[Number(claimAmount)]}
            onValueChange={handleSliderChange}
            disabled={account.isDisconnected}
          />
          <p className="mt-4 text-xs">Current claimable quota: {currentClaimable} TRV2</p>
        </div>
      </div>
      <Button
        type="submit"
        className="mt-2 w-full rounded-xl"
        size="lg"
        variant={"orange"}
        disabled={account.isDisconnected}
      >
        {account.isDisconnected ? "Wallet Not Connected" : "Claim Rewards"}
      </Button>
      <div className="mx-2 mt-4 text-sm">
        <ContractDetails name="Status" value={stake.active ? "Active" : "Withdrawn"} />
        <ContractDetails
          name="Start"
          value={new Date(Number(stake.start) * 1000).toLocaleString()}
        />
        <ContractDetails name="Time Multiplier" value={timeMultiplier} />
        <ContractDetails name="Amount Multiplier" value={amountMultiplier} />
        <ContractDetails name="Stake Id" value={`#${id}`} />
      </div>
    </form>
  );
}
