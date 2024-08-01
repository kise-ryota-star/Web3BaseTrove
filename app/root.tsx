// Remix Modules
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

// External Modules
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Internal Modules
import "./globals.css";
import { config, rainbowKitTheme } from "./lib/wagmiConfig";
import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  // This is a workaround for the vaul Drawer component regarding the use of
  // useLayoutEffect on the server.
  // Related issue: https://github.com/emilkowalski/vaul/issues/367
  if (typeof window === "undefined") React.useLayoutEffect = () => {};

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full min-h-dvh flex-col bg-background font-poppins">
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={rainbowKitTheme}>{children}</RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
