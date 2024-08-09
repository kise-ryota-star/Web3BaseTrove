// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Trove} from "../src/trove-nft/Trove.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract TroveTest is Test {
    using Strings for uint256;

    Trove public trove;
    address owner = makeAddr("owner");
    address minter = makeAddr("minter");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address john = makeAddr("john");

    string public constant baseUri = "https://gateway.pinata.cloud/ipfs/QmbDtyGBcHprjwQCVRWTdgSPbUAVyb8d7EjzzLJgjX7AB7/";

    function setUp() public {
        vm.startPrank(owner);
        trove = new Trove(owner, minter, baseUri);
        vm.stopPrank();
    }

    function test_view() external {
        assertEq(trove.totalSupply(), 0);
        assertEq(trove.name(), "Trove");
        assertEq(trove.symbol(), "TRV");

        // This should revert because the token does not exist
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("ERC721OutOfBoundsIndex(address,uint256)")), address(0), 0)
        );
        trove.tokenByIndex(0);
    }

    function mint() public {
        // Owner mints 10 tokens
        vm.deal(owner, 1 ether);
        vm.startPrank(owner);
        trove.safeMint(owner, "106.png");
        trove.safeMint(owner, "23.png");
        trove.safeMint(owner, "33.png");
        trove.safeMint(owner, "54.png");
        trove.safeMint(owner, "51.png");
        trove.safeMint(owner, "354.png");
        trove.safeMint(owner, "72.png");
        trove.safeMint(owner, "38.png");
        trove.safeMint(owner, "29.png");
        trove.safeMint(owner, "310.png");
        vm.stopPrank();
    }

    function test_mint_and_role_access() external {
        // Alice wants to mint a token, but she is not a minter
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), alice, keccak256("MINTER")
            )
        );
        trove.safeMint(alice, "4.png");

        // Bob wants to mint a token, but he is not a minter either
        vm.deal(bob, 1 ether);
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), bob, keccak256("MINTER")
            )
        );
        trove.safeMint(bob, "5.png");

        // The owner wants to mint a token
        vm.deal(owner, 1 ether);
        vm.startPrank(owner);
        trove.safeMint(owner, "354.png");
        trove.safeMint(owner, "6.png");
        vm.stopPrank();

        // The mint is successful
        assertEq(trove.totalSupply(), 2);
        assertEq(trove.tokenByIndex(0), 0);
        assertEq(trove.tokenByIndex(1), 1);
        assertEq(trove.tokenURI(0), string.concat(baseUri, "354.png"));
        assertEq(trove.tokenURI(1), string.concat(baseUri, "6.png"));
        assertEq(trove.balanceOf(owner), 2);
        assertEq(trove.tokenOfOwnerByIndex(owner, 0), 0);
        assertEq(trove.tokenOfOwnerByIndex(owner, 1), 1);

        // The minter wants to mint a token
        vm.deal(minter, 1 ether);
        vm.startPrank(minter);
        trove.safeMint(minter, "7.png");
        vm.stopPrank();

        // The mint is successful
        assertEq(trove.totalSupply(), 3);
        assertEq(trove.tokenByIndex(2), 2);
        assertEq(trove.tokenURI(2), string.concat(baseUri, "7.png"));
        assertEq(trove.balanceOf(minter), 1);
        assertEq(trove.tokenOfOwnerByIndex(minter, 0), 2);
    }

    function test_approval() external {
        mint();

        // Approves alice to transfer the token with id 4
        vm.prank(owner);
        trove.approve(alice, 4);

        // Check if the approval is successful
        assertEq(trove.getApproved(4), alice);

        // Alice transfers the token with id 4 to Bob
        vm.prank(alice);
        trove.transferFrom(owner, bob, 4);

        // Check if the transfer is successful
        assertEq(trove.ownerOf(4), bob);
        assertEq(trove.balanceOf(owner), 9);
        assertEq(trove.balanceOf(bob), 1);
        assertEq(trove.tokenOfOwnerByIndex(bob, 0), 4);
        assertEq(trove.tokenURI(4), string.concat(baseUri, "51.png"));

        // Owner approves alice to transfer all of his tokens
        vm.prank(owner);
        trove.setApprovalForAll(alice, true);

        // Check if the approval is successful
        assert(trove.isApprovedForAll(owner, alice));

        // Alice transfer 4 tokens to John and 2 tokens to herself
        vm.startPrank(alice);
        trove.transferFrom(owner, john, 0);
        trove.transferFrom(owner, john, 1);
        trove.transferFrom(owner, john, 2);
        trove.transferFrom(owner, john, 7);

        trove.transferFrom(owner, alice, 3);
        trove.transferFrom(owner, alice, 9);
        vm.stopPrank();

        // Check if the transfer is successful
        assertEq(trove.balanceOf(owner), 3);
        assertEq(trove.balanceOf(john), 4);
        assertEq(trove.balanceOf(alice), 2);

        assertEq(trove.tokenOfOwnerByIndex(john, 0), 0);
        assertEq(trove.tokenOfOwnerByIndex(john, 1), 1);
        assertEq(trove.tokenOfOwnerByIndex(john, 2), 2);
        assertEq(trove.tokenOfOwnerByIndex(john, 3), 7);

        assertEq(trove.tokenOfOwnerByIndex(alice, 0), 3);
        assertEq(trove.tokenOfOwnerByIndex(alice, 1), 9);

        assertEq(trove.ownerOf(0), john);
        assertEq(trove.ownerOf(1), john);
        assertEq(trove.ownerOf(2), john);
        assertEq(trove.ownerOf(7), john);

        assertEq(trove.ownerOf(3), alice);
        assertEq(trove.ownerOf(9), alice);
    }

    function test_burn() external {
        mint();

        assertEq(trove.tokenByIndex(9), 9);

        // Owner burns the token with id 4
        vm.prank(owner);
        trove.burn(4);

        // Check if the burn is successful
        assertEq(trove.totalSupply(), 9);
        assertEq(trove.balanceOf(owner), 9);

        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("ERC721OutOfBoundsIndex(address,uint256)")), address(0), 9)
        );
        trove.tokenByIndex(9);

        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("ERC721NonexistentToken(uint256)")), 4));
        trove.ownerOf(4);
    }

    function test_admin_only_fn() external {
        mint();

        // Alice tries to set the base URI, but she is not  an admin
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), alice, 0x00)
        );
        trove.setBaseURI("https://example.com");

        // Owner sets the base URI
        assertEq(trove.tokenURI(0), string.concat(baseUri, "106.png"));
        vm.prank(owner);
        trove.setBaseURI("https://example.com/");
        assertEq(trove.tokenURI(0), string.concat("https://example.com/", "106.png"));

        // Alice tries to set the token URI for token with id 1, but she is not an admin
        vm.prank(owner);
        trove.safeTransferFrom(owner, alice, 1);
        assertEq(trove.ownerOf(1), alice);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), alice, 0x00)
        );
        trove.setTokenURI(1, "https://example.com/1.png");
    }
}
