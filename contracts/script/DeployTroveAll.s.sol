// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Trove1} from "../src/trove-1/Trove1.sol";
import {TroveStake} from "../src/stake/TroveStake.sol";
import {TroveAuction} from "../src/auction/TroveAuction.sol";

contract DeployTrove1 is Script {
    Trove1 public trove1;
    TroveStake public troveStake;
    TroveAuction public troveAuction;

    string public constant baseUri = "https://gateway.pinata.cloud/ipfs/QmbDtyGBcHprjwQCVRWTdgSPbUAVyb8d7EjzzLJgjX7AB7/";

    function setUp() public {}

    function run() external {
        vm.startBroadcast();
        trove1 = new Trove1(21_000_000, 1_000_000, 1000, 10_000);
        troveStake = new TroveStake(address(trove1), 15_000e18);
        troveAuction = new TroveAuction(address(troveStake.trove2()), baseUri);
        vm.stopBroadcast();
    }
}
