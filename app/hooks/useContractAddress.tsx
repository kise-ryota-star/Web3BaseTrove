// Internal Modules
import { useChainId } from "wagmi";
import {
  trove1Address,
  trove2Address,
  troveAddress,
  troveAuctionAddress,
  troveStakeAddress,
} from "~/generated";
import { supportedChains } from "~/lib/wagmiConfig";
import { useNotification } from "./useNotificationBar";

interface ContractAddressReturn {
  chainId: number;
  contractAddress: `0x${string}`;
  matched: boolean;
}

function isSupportedChain(chainId: number) {
  for (const supportedChain of supportedChains) {
    if (chainId === supportedChain) {
      return chainId;
    }
  }

  return false;
}

export default function useContractAddress(
  contract: "troveAuction" | "troveToken1" | "troveToken2" | "troveStake" | "trove",
): ContractAddressReturn {
  const chainId = useChainId();
  const { showNotification, hideNotification } = useNotification();

  const chain = isSupportedChain(chainId);

  // If the chain is not supported, return default values
  if (!chain) {
    switch (contract) {
      case "troveAuction":
        showNotification(`Chain id ${chainId} not supported`);
        return {
          chainId: chainId,
          contractAddress: troveAuctionAddress[supportedChains[0]],
          matched: false,
        };
      case "troveToken1":
        showNotification(`Chain id ${chainId} not supported`);
        return {
          chainId: chainId,
          contractAddress: trove1Address[supportedChains[0]],
          matched: false,
        };
      case "troveToken2":
        showNotification(`Chain id ${chainId} not supported`);
        return {
          chainId: chainId,
          contractAddress: trove2Address[supportedChains[0]],
          matched: false,
        };
      case "troveStake":
        showNotification(`Chain id ${chainId} not supported`);
        return {
          chainId: chainId,
          contractAddress: troveStakeAddress[supportedChains[0]],
          matched: false,
        };
      case "trove":
        showNotification(`Chain id ${chainId} not supported`);
        return {
          chainId: chainId,
          contractAddress: troveAddress[supportedChains[0]],
          matched: false,
        };
      default:
        showNotification("Invalid contract type");
        throw new Error("Invalid contract type");
    }
  }

  switch (contract) {
    case "troveAuction":
      hideNotification();
      return { chainId: chain, contractAddress: troveAuctionAddress[chain], matched: true };
    case "troveToken1":
      hideNotification();
      return { chainId: chain, contractAddress: trove1Address[chain], matched: true };
    case "troveToken2":
      hideNotification();
      return { chainId: chain, contractAddress: trove2Address[chain], matched: true };
    case "troveStake":
      hideNotification();
      return { chainId: chain, contractAddress: troveStakeAddress[chain], matched: true };
    case "trove":
      hideNotification();
      return { chainId: chain, contractAddress: troveAddress[chain], matched: true };
    default:
      showNotification("Invalid contract type");
      throw new Error("Invalid contract type");
  }
}
