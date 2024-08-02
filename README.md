<p align="center">
  <br />
  <a href="">
      <img src="./public/images/site.png" alt="Ad Explorer logo" width="200px">
  </a>
</p>

<p align="center">
This is a web3 project that is built on the <a href="https://www.base.org/">Base Blockchain</a>, which is a <a href="https://ethereum.org/en/layer-2/">layer 2</a> chain for Ethereum blockchain using <a href="https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/">optimistic rollups</a>. The project is deployed on Base Sepolia testnet blockchain to allow easy access to the smart contract without cost, the website provides an interface to interact with the smart contract easily.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Remix-121212?style=for-the-badge&logo=remix&logoColor=fffff" alt="Remix">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript">
  <img src="https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=fff&style=for-the-badge" alt="Ethereum">
  <img src="https://img.shields.io/badge/Solidity-2b247c?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity">
  <img src="https://img.shields.io/badge/OpenZeppelin-4E5EE4?logo=openzeppelin&logoColor=fff&style=for-the-badge" alt="OpenZeppelin">
  <img src="https://img.shields.io/badge/Wagmi-1b1b1f?logo=wagmi&logoColor=fff&style=for-the-badge" alt="Wagmi">
  <br />
  <br />
  <img src="./public/images/preview.png" alt="Preview">
  <br />
</p>

## Tools/package/framework used

- [Remix](https://remix.run) - A fully featured ReactJs framework
- [Wagmi](https://wagmi.sh/) - A type safe React hook library for Ethereum, allow easy integration with Foundry
- [Foundry](https://book.getfoundry.sh/) - A smart contract development toolchain ([Hardhat](https://hardhat.org/) alternative)
- [RainbowKit](https://www.rainbowkit.com/) - A wallet interface for user to connect their wallet, seamless integration with Wagmi
- [shadcn/ui](https://ui.shadcn.com/) - Pre-build React component on top of [Radix-ui](https://www.radix-ui.com/) and [tailwindcss](https://tailwindcss.com/)
- [Eslint](https://eslint.org/) and [Prettier](https://prettier.io/) - Eslint for linting code and Prettier to format the styling of code.
- [Typescript](https://www.typescriptlang.org/) and [Solidity](https://soliditylang.org/) - Full type safety on both frontend and blockchain development
- [Windows WSL](https://learn.microsoft.com/en-us/windows/wsl/) - To run the project on a Windows machine, this is a requirement

## Development

### Prerequisites

The following is a requirement if you wish to run the project locally on your machine

1. If you are using Windows operating system, then [Windows WSL](https://learn.microsoft.com/en-us/windows/wsl/) is needed. This is because forge does not seems to be able to work well on Windows environment. The project should be cloned into the WSL drive instead of the windows drive and access it from wsl terminal. You should be fine if you are using either Mac os or Linux based operating system.
2. Have foundry toolchain installed, refer to the [documentation](https://book.getfoundry.sh/) on the installation of the programs.

   - You should have the following commands available after your foundry installation

     ```bash
     forge --version
     anvil --version
     chisel --version
     cast --version
     ```

3. You need to have [pnpm](https://pnpm.io/installation) package manager installed as the project's dependency is managed using pnpm.

### Local development

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/AlstonChan/Web3BaseTrove
   ```

2. Install the required dependencies for Remix app:

   ```bash
   pnpm install
   ```

3. Open up a new terminal, and change directory (`cd`) into the project's `contracts` directory to

   1. Run the local blockchain node (anvil)
   2. Deploy the contract to local blockchain

   Firstly, you would have to run the local blockchain that come with foundry install, which is anvil

   ```bash
   anvil
   ```

   You need to open another terminal as the anvil session does not run at the background (nor it should be running in the background, so you have better control over it and able to see the logs output to the terminal) and thus you need to open up another terminal.

   At the same directory where, deploy the smart contract using the deployment script.

   ```bash
   forge script script/DeployTrove1.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 -vvvv
   ```

   > \[!WARNING]\
   > The private key used above is using the private key provided by anvil package. You **SHOULD NOT** expose your private key in the terminal as such when using your own private key or you are in risk of getting your private key leak!

4. Run the Remix development server at the root of the project:

   ```bash
   pnpm dev
   ```

You should have at least two terminal opened that are running a process.

- Remix dev server
- Anvil blockchain testnet

Run the dev server:

## License

This project is licensed under [GNU General Public License v3](./LICENSE.txt)
