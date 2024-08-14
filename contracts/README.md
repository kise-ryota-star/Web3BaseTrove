# Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Local Development

To develop EVM smart contract using foundry toolchain, you should installed all the prerequisites software as prescribed at the main `README.md` prerequisites section.

1. Create a private key keystore

   This step is needed when you want to use your own private key instead of the development private key provided by the anvil blockchain (which have 10,000ETH).

   [Foundry has support for keystore](https://book.getfoundry.sh/reference/cast/cast-wallet-import) which follows the [EIP-2335](https://eips.ethereum.org/EIPS/eip-2335) protocol to securely store your private key in JSON format **_Encrypted_**. This is **_Strongly Recommended_** if you want to use your private key securely on your machine, without exposing it as a plain text.

   1. Firstly, prepare the private key that you want to use
   2. Create a keystore with `cast wallet import main --interactive`. _Where "main" is the name/alias you want to give it_.
   3. You should be prompted to enter your private key and a password to be used for encryption. This is the last time you would ever see your private key.

2. Whenever your command is using the environment variable from your `.env` file, do run `source .env` on the shell session or your environment variable will not be recognize

### File structure

- **src/** - This directory stores all the main solidity file that will be deployed to the production blockchain. At here, I have separated each smart contract with it's directory name for easier visibility when finding the right smart contract.
- **script/** - This directory stores the script file written in solidity. Script file is used to execute code in solidity like deploying the smart contract to the blockchain.
- **test/** - This directory is where you place your test file at. All tests are written in solidity and test is crucial to gain confidence in your code to ensure that the smart contract will work as intended.
- **lib/** - This directory stores all the dependencies required by the project. For example, it may include libraries like openzeppelin-contracts and forge-std. Unlike node_modules in a Node.js project, where dependencies are typically ignored by version control systems like Git (using .gitignore), the dependencies in the lib directory of a Foundry project are actually Git submodules or repositories themselves.
- **blockchain_state.txt** - This txt file stores the anvil blockchain state. This file is used by `start_anvil.sh` to restore the blockchain state when found.
- **start_anvil.sh** - This script is used to start a anvil blockchain and automatically deployed all the smart contract using the script in `script/` directory. It will also look for `blockchain_state.txt` and restore the blockchain state when found, else a fresh blockchain will be created.
- **Makefile** - Contains command to quickly update the anvil blockchain so you do not have to enter the anvil rpc command with curl each time.
  - `make check-rpc` - check if the anvil rpc endpoint is reachable
  - `make increase-12hr` - increase the blockchain timestamp by 12 hour and mine one block
  - `make increase-24hr` - increase the blockchain timestamp by 24 hour and mine one block
  - `make increase-6d` - increase the blockchain timestamp by 6 days and mine one block
  - `make save-state` - save the current blockchain state to `blockchain_state.txt`, if the txt file already exists, override it.
  - `make deploy-anvil` - Deploy all 5 smart contract to the anvil blockchain, this is rarely used as `start_anvil.sh` will deploy all smart contract automatically when the anvil blockchain is up.
  - `make deploy-base-sepolia` - Deploy all 5 smart contract to the Base testnet - sepolia blockchain and automatically verify the smart contract. You will be prompted to enter password for the keystore.
- **remappings.txt** - Generated wit h`forge remappings > remappings.txt`, to provide mappings of shortcut imports path to the correct path, used by your editor of choice like Visual Studio Code.

### Commonly used commands

1. `forge test` - Runs all test located in the `test` directory.
2. `forge test -vvvvv --match-test test_bid` - Run specific test with the highest verbosity, this is normally used when you are trying to find out what happen exactly in your test and what is going wrong. You should change the `test_bid` to the function that you want to test.
3. `forge test -vvvvv --debug test_bid` - Run specific test with the highest verbosity, and debug the test. Run this when the previous `--match-test` with highest verbosity does not give you enough info. You normally would run this when you are desperate.
4. `forge coverage` - Runs all test and give you a test coverage report. This provide you a reference on how much you have tested your smart contract. High percentage or even 100% of test coverage give you an illusion of code confidence.
5. `./start_anvil.sh` - used when you need to start developing your web application (remix app) locally.
6. Some of the make command
7. `forge clean` - remove the `out` directory

### Possible issues

1. `Weird blockchain data error` - Sometimes the state saved to the `blockchain_state.txt` may not be 100% identical to the state when you dump (save) the state to the txt file. If removing the `blockchain_state.txt` and restart the anvil blockchain solve the error, then it is the state error, else it would be the smart contract having error at that specific state.
