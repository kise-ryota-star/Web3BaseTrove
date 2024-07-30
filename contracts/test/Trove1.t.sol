// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Trove1} from "../src/trove-1/Trove1.sol";

contract Trove1Test is Test {
    Trove1 public trove1;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 public constant totalSupply = 21_000_000;
    uint256 public constant preMintAmount = 25_000;
    uint256 public constant mintCost = 100 wei;
    uint256 public constant maxMintPerTx = 10_000;

    function setUp() public {
        trove1 = new Trove1(totalSupply, preMintAmount, mintCost, maxMintPerTx);
    }

    /**
     * @dev Test if the metadata of the token is correct
     */
    function test_metadata() external view {
        assertEq(trove1.name(), "Trove1");
        assertEq(trove1.symbol(), "TRV1");
        assertEq(trove1.decimals(), 18);
    }

    /**
     * @dev Test if the constructor parameters are set correctly
     */
    function test_token_amount() external view {
        assertEq(trove1.totalSupply(), totalSupply * 1e18);
        assertEq(trove1.balanceOf(address(this)), preMintAmount * 1e18);
        assertEq(trove1.burnedAmount(), 0);
        assertEq(trove1.totalBalance(), preMintAmount * 1e18);
        assertEq(trove1.maxTokenPerMint(), maxMintPerTx * 1e18);
        assertEq(trove1.mintPrice(), mintCost);
    }

    /**
     * @dev Test if approve, allowance and transferFrom function works correctly
     */
    function test_approve() external {
        uint256 approveAmount = 1_000 * 1e18;

        // assure that the allowance of the `address(this)` to `msg.sender` is 0
        assertEq(trove1.allowance(address(this), msg.sender), 0);

        // approve the `msg.sender` to spend `approveAmount` of tokens. The
        // allowance should be equal to `approveAmount` after the approval
        trove1.approve(msg.sender, approveAmount);
        assertEq(trove1.allowance(address(this), msg.sender), approveAmount);

        // Send a transfer call from `msg.sender` to the contract. The contract
        // should be able to transfer the tokens from the `address(this)` to the
        // `msg.sender` since the `msg.sender` has been approved to spend the tokens
        vm.prank(msg.sender);
        trove1.transferFrom(address(this), msg.sender, approveAmount);
        assertEq(trove1.balanceOf(msg.sender), approveAmount);
        assertEq(trove1.balanceOf(address(this)), preMintAmount * 1e18 - approveAmount);

        // The allowance should be 0 after the transfer and the totalBalance
        // should not be affected
        assertEq(trove1.totalBalance(), preMintAmount * 1e18);
        assertEq(trove1.allowance(address(this), msg.sender), 0);
    }

    /**
     * @dev Test if the mint and burn functions work correctly
     */
    function test_mint_and_burn() external {
        uint256 mintAmount = 1_000;
        uint256 exactMintCost = mintAmount * mintCost;

        // assure that the balance of the sender is 0
        assertEq(trove1.balanceOf(alice), 0);
        assertEq(trove1.totalBalance(), preMintAmount * 1e18);

        // Gives alice 1 ether and send the mint function as alice
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        trove1.mint{value: exactMintCost}(alice, mintAmount);

        // Alice balance should be equal to the mintAmount and the totalBalance
        // should be equal to the preMintAmount + mintAmount. The balance of the
        // alice's ether balance should be 1 ether - exactMintCost
        assertEq(trove1.balanceOf(alice), mintAmount * 1e18);
        assertEq(trove1.totalBalance(), preMintAmount * 1e18 + mintAmount * 1e18);
        assertEq(alice.balance, 1 ether - exactMintCost);

        // Burning the minted tokens should reduce the balance of the alice and increase
        // the burnedAmount of the contract.
        vm.prank(alice);
        trove1.burn(mintAmount * 1e18);
        assertEq(trove1.balanceOf(alice), 0);
        assertEq(trove1.totalBalance(), preMintAmount * 1e18);
        assertEq(trove1.burnedAmount(), mintAmount * 1e18);
    }

    /**
     * @dev Test if the transfer function works correctly
     */
    function testTransfer() external {
        uint256 amount = 1_000;
        uint256 cost = amount * mintCost;

        // assure that the balance of the sender is 0
        assertEq(trove1.balanceOf(alice), 0);
        assertEq(trove1.totalBalance(), preMintAmount * 1e18);

        // Gives alice 1 ether and send the mint function as alice
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        trove1.mint{value: cost}(alice, amount);

        // Transfer half of the minted tokens to bob
        vm.prank(alice);
        trove1.transfer(bob, (amount / 2) * 1e18);
        assertEq(trove1.balanceOf(bob), (amount / 2) * 1e18);
        assertEq(trove1.balanceOf(alice), (amount - (amount / 2)) * 1e18);
    }

    /**
     * @dev Test if the balance of the contract is correct
     */
    function testBalance() external {
        uint256 total = 0;
        address[] memory accounts = new address[](10);
        string[10] memory names =
            ["Charlie", "David", "Emily", "Frank", "Gabriella", "Harrison", "Isabella", "Julian", "Kathryn", "Lucas"];

        for (uint256 i = 0; i < 10; i++) {
            address name = makeAddr(names[i]);
            uint256 amount = 1_000 + (i * 1_000);
            uint256 cost = amount * mintCost;

            accounts[i] = name;

            // assure that the balance of the sender is 0, the totalBalance should gradually
            // increase as the mint function is called
            assertEq(trove1.balanceOf(name), 0);
            assertEq(trove1.totalBalance(), preMintAmount * 1e18 + (total) * 1e18);
            total += amount;

            // Give each address 1 ether and mint the tokens
            vm.deal(name, 1 ether);
            vm.prank(name);
            trove1.mint{value: cost}(name, amount);
        }

        // Check if the balance of each address is correct
        for (uint256 i = 0; i < 10; i++) {
            assertEq(trove1.balanceOf(accounts[i]), (1_000 + (i * 1_000)) * 1e18);
        }
    }
}
