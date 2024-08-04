// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Trove2} from "../src/trove-2/Trove2.sol";

contract DeployTrove1 is Script {
    Trove2 public troveContract;

    function setUp() public {}

    function run() external returns (Trove2) {
        vm.startBroadcast();
        troveContract = new Trove2(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, msg.sender);
        vm.stopBroadcast();

        return troveContract;
    }
}
