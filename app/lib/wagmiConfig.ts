// External Modules
import { http } from "wagmi";
import { baseSepolia, anvil } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { darkTheme, Theme } from "@rainbow-me/rainbowkit";
import merge from "lodash.merge";

export const config = getDefaultConfig({
  appName: "Trove",
  projectId: "YOUR_PROJECT_ID",
  chains: [baseSepolia, anvil],
  ssr: true, // If your dApp uses server side rendering (SSR)
  transports: {
    [baseSepolia.id]: http(
      "https://api.developer.coinbase.com/rpc/v1/base-sepolia/ZuWdxTb7tuxe6bAwfe1z5tmUDxiHDQXi",
    ),
    [anvil.id]: http("http://127.0.0.1:8545"),
  },
});

export const rainbowKitTheme = merge(darkTheme(), {
  fonts: {
    body: "Poppins, sans-serif",
  },
} as Theme);
