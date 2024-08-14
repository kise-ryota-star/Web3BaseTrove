import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "app/generated.ts",
  contracts: [],
  plugins: [
    react(),
    foundry({
      project: "./contracts",
      deployments: {
        Trove: {
          84532: "0xbeA56E6FE2a1dd5730f26911393423fF9769d9Aa",
        },
        Trove1: {
          31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          84532: "0xA918a1656f58448D1E2419c523B11Df10b05099a",
        },
        Trove2: {
          84532: "0x5D258E6cc4078fd2EAC464E07B26DFC40439A594",
        },
        TroveStake: {
          31337: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
          84532: "0xd9b4CcF687a3b9f5079756349154D8583D379B98",
        },
        TroveAuction: {
          31337: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
          84532: "0x1788EE841E724E500eD0fB3446E3076b7182DCCF",
        },
      },
    }),
  ],
});
