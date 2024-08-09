// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Trove2} from "../src/trove-2/Trove2.sol";

contract Trove2Test is Test {
    Trove2 public trove2;
    address admin = makeAddr("admin");
    address minter = makeAddr("minter");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        vm.prank(admin);
        trove2 = new Trove2(admin, minter);
    }

    /**
     * @dev Test if the metadata of the token is correct
     */
    function test_metadata() external view {
        assertEq(trove2.name(), "Trove2");
        assertEq(trove2.symbol(), "TRV2");
        assertEq(trove2.decimals(), 18);
    }

    function test_role_access() external view {
        // Check that the admin and minter roles are set correctly
        assertEq(trove2.hasRole(trove2.DEFAULT_ADMIN_ROLE(), admin), true);
        assertEq(trove2.hasRole(trove2.MINTER(), admin), true);
        assertEq(trove2.hasRole(trove2.MINTER(), minter), true);
    }

    function test_mint() external {
        // Check that the minter can mint tokens
        assertEq(trove2.balanceOf(alice), 0);
        vm.prank(minter);
        trove2.mint(alice, 1000);
        assertEq(trove2.balanceOf(alice), 1000);

        // The admin can also mint tokens as they have the minter role
        vm.prank(admin);
        trove2.mint(alice, 1000);
        assertEq(trove2.balanceOf(alice), 2000);

        // The smart contract that deployed the Trove2 contract cannot mint tokens
        vm.expectRevert();
        trove2.mint(alice, 1000);

        // So as Bob cannot mint tokens
        vm.prank(bob);
        vm.expectRevert();
        trove2.mint(alice, 1000);
    }

    function test_burn() external {
        // Mint some tokens to Alice
        vm.prank(minter);
        trove2.mint(alice, 1000);
        assertEq(trove2.balanceOf(alice), 1000);

        // Burn some tokens
        vm.prank(alice);
        trove2.burn(500);
        assertEq(trove2.balanceOf(alice), 500);
        assertEq(trove2.burnedAmount(), 500);
    }
}
