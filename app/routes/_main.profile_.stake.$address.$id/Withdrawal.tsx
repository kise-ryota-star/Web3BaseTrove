// External Modules
import { useAccount } from "wagmi";

// Internal Modules
import { useReadTroveStake, useWriteTroveStakeWithdraw } from "~/generated";

// Components
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";

interface StakeDetailsFormProps {
  address: `0x${string}`;
  id: number;
}

export default function Withdrawal({ address, id }: StakeDetailsFormProps) {
  const account = useAccount();
  const { toast } = useToast();

  // Write data to smart contract
  const troveStakeWithdraw = useWriteTroveStakeWithdraw();

  // Get data from smart contract
  const { refetch: refetchStakeStatus } = useReadTroveStake({
    functionName: "stakeStatus",
    args: [address],
  });
  const { refetch: refetchClaimable } = useReadTroveStake({
    functionName: "claimableRewards",
    args: [address],
  });

  /**
   * Handle withdraw stake button click
   */
  const handleWithdraw = async () => {
    if (account.isDisconnected) return;

    try {
      const result = await troveStakeWithdraw.writeContractAsync({ args: [BigInt(id)] });
      toast({
        title: "Withdraw Stake",
        description: `Stake #${id} has been withdrawn successfully. Transaction Id: ${result}`,
        variant: "success",
      });

      await refetchStakeStatus();
      await refetchClaimable();
    } catch (error) {
      toast({
        title: "Withdraw Stake",
        description: `Failed to withdraw stake #${id}`,
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div className="mx-auto mt-20 w-full max-w-screen-xl">
      <h3 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">Withdraw Stake</h3>
      <div className="mx-auto mt-4 max-w-screen-sm rounded-3xl bg-destructive px-8 py-5">
        <p>
          By withdrawing your stake, you will receive all your staked TRV1 token and this staked
          will be inactive, thus no longer mint TRV2 token.
        </p>
        <br />
        <p>
          All unclaimable rewards will be automatically claimed unless the daily claimable quota
          limit is met. Which you need to claim the remaining rewards afterwards.
        </p>
        <Button
          type="button"
          disabled={account.isDisconnected}
          variant="white"
          className="mt-4 w-full"
          onClick={handleWithdraw}
        >
          {account.isDisconnected ? "Wallet Not Connected" : "Withdraw Stake"}
        </Button>
      </div>
    </div>
  );
}
