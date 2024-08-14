// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Trove1} from "../src/trove-1/Trove1.sol";
import {TroveStake} from "../src/stake/TroveStake.sol";
import {TroveAuction} from "../src/auction/TroveAuction.sol";

contract DeployTrove1 is Script {
    Trove1 public troveContract;

    function run() external returns (Trove1) {
        vm.startBroadcast();
        troveContract = new Trove1(21_000_000, 25_000, 100, 10_000);
        vm.stopBroadcast();

        return troveContract;
    }
}

/**
 * This script deploys the Trove1, TroveStake, and TroveAuction contracts.
 * The Trove2 smart contract is deployed by the TroveStake contract.
 * The Trove smart contract is deployed by the TroveAuction contract.
 * This script is will deploy a total of 5 smart contracts.
 */
contract DeployTroveAll is Script {
    Trove1 public trove1;
    TroveStake public troveStake;
    TroveAuction public troveAuction;

    string public constant baseUri = "https://gateway.pinata.cloud/ipfs/QmbDtyGBcHprjwQCVRWTdgSPbUAVyb8d7EjzzLJgjX7AB7/";

    function run() external {
        vm.startBroadcast();
        trove1 = new Trove1(21_000_000, 1_000_000, 1000, 10_000);
        troveStake = new TroveStake(address(trove1), 15_000e18);
        troveAuction = new TroveAuction(address(troveStake.trove2()), baseUri);
        vm.stopBroadcast();
    }
}
