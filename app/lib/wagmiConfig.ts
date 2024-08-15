// External Modules
import { http } from "wagmi";
import { baseSepolia, anvil } from "wagmi/chains";
import { darkTheme, Theme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import merge from "lodash.merge";

export const config = getDefaultConfig({
  appName: "Trove",
  projectId: "YOUR_PROJECT_ID",
  chains: process.env.NODE_ENV === "development" ? [anvil] : [baseSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
  transports:
    process.env.NODE_ENV === "development"
      ? {
          [anvil.id]: http("http://127.0.0.1:8545"),
        }
      : {
          [baseSepolia.id]: http(
            "https://api.developer.coinbase.com/rpc/v1/base-sepolia/ZuWdxTb7tuxe6bAwfe1z5tmUDxiHDQXi",
          ),
        },
});

export const rainbowKitTheme = merge(darkTheme(), {
  fonts: {
    body: "Poppins, sans-serif",
  },
} as Theme);

export const supportedChains =
  process.env.NODE_ENV === "development" ? [anvil.id] : [baseSepolia.id];
