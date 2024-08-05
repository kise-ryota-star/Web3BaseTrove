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
        Trove1: {
          31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        },
        TroveStake: {
          31337: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
        },
      },
    }),
  ],
});
