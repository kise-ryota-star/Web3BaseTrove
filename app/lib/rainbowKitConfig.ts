// External Modules
import merge from "lodash.merge";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { darkTheme, Theme } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const rainbowKitTheme = merge(darkTheme(), {
  fonts: {
    body: "Poppins, sans-serif",
  },
} as Theme);
