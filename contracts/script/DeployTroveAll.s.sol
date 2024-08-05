// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Trove1} from "../src/trove-1/Trove1.sol";
import {TroveStake} from "../src/stake/TroveStake.sol";

contract DeployTrove1 is Script {
    Trove1 public trove1;
    TroveStake public troveStake;

    function setUp() public {}

    function run() external {
        vm.startBroadcast();
        trove1 = new Trove1(21_000_000, 25_000, 100, 10_000);
        troveStake = new TroveStake(msg.sender, 15_000e18);
        vm.stopBroadcast();
    }
}
