// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Trove1} from "../src/trove-1/Trove1.sol";

contract DeployTrove1 is Script {
    Trove1 public troveContract;

    function setUp() public {}

    function run() external returns (Trove1) {
        vm.startBroadcast();
        troveContract = new Trove1(21_000_000, 25_000, 100, 10_000);
        vm.stopBroadcast();

        return troveContract;
    }
}
