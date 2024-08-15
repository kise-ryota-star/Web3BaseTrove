// Remix Modules
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";

// External Modules
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Internal Modules
import "./globals.css";
import { config, rainbowKitTheme } from "./lib/wagmiConfig";
import ErrorPage from "./components/ErrorPage";

export function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  // This is a workaround for the vaul Drawer component regarding the use of
  // useLayoutEffect on the server.
  // Related issue: https://github.com/emilkowalski/vaul/issues/367
  if (typeof window === "undefined") React.useLayoutEffect = () => {};

  return (
    <html lang="en" className="dark">
      <head>
        {/* Essential tag */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
        <meta name="theme-color" content="#020817" />

        {/* page specific tag */}
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

export function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);
  return (
    <html lang="en" className="dark">
      <head>
        {/* Essential tag */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
        <meta name="theme-color" content="#020817" />

        {/* page specific tag */}
        <Meta />
        <Links />
      </head>
      <body className="flex h-full min-h-dvh flex-col bg-background font-poppins">
        {isRouteErrorResponse(error) ? (
          <ErrorPage code={error.status} title={error.statusText} message={error.data} />
        ) : error instanceof Error ? (
          <ErrorPage code={500} title={error.name} message={error.message} />
        ) : (
          <ErrorPage code={500} title={"Unknown Error"} message={null} />
        )}
        <Scripts />
      </body>
    </html>
  );
}
