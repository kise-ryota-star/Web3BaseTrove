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
          31337: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        },
        TroveAuction: {
          31337: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        },
      },
    }),
  ],
});
