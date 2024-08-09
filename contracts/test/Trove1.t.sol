// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Trove1} from "../src/trove-1/Trove1.sol";

contract Trove1Test is Test {
    Trove1 public trove1;
    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 public constant totalSupply = 21_000_000;
    uint256 public constant preMintAmount = 25_000;
    uint256 public constant mintCost = 10000 wei;
    uint256 public constant maxMintPerTx = 1_000_000;

    function setUp() public {
        // It is important to deploy the contract with the owner address
        // or the test might fail due to the address used
        // https://github.com/foundry-rs/foundry/issues/3625
        vm.prank(owner);
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
        assertEq(trove1.balanceOf(owner), preMintAmount * 1e18);
        assertEq(trove1.burnedAmount(), 0);
        assertEq(trove1.totalBalance(), preMintAmount * 1e18);
        assertEq(trove1.maxTokenPerMint(), maxMintPerTx * 1e18);
        assertEq(trove1.mintPrice(), mintCost);
    }

    function test_ownership() external {
        assertEq(trove1.owner(), owner);

        // Mint some tokens so the contract has some balance
        uint256 mintAmount = 10_000;
        uint256 exactMintCost = mintAmount * mintCost;

        vm.deal(owner, 1 ether);
        vm.prank(owner);
        trove1.mint{value: exactMintCost}(alice, mintAmount);

        assertEq(address(trove1).balance, exactMintCost);

        // Randoms cannot transfer the ownership of the contract
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableUnauthorizedAccount(address)")), alice));
        trove1.transferOwnership(alice);

        // Attempt to transfer the ownership of the contract to address
        // 0 should revert
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableInvalidOwner(address)")), address(0)));
        trove1.transferOwnership(address(0));

        // Transfer the ownership of the contract to alice
        vm.prank(owner);
        trove1.transferOwnership(alice);
        assertEq(trove1.owner(), alice);

        // Alice is able to withdraw the ether from the contract
        vm.prank(alice);
        trove1.withdraw(exactMintCost);

        // Alice renounces the ownership of the contract
        vm.prank(alice);
        trove1.renounceOwnership();
        assertEq(trove1.owner(), address(0));
    }

    /**
     * @dev Test if approve, allowance and transferFrom function works correctly
     */
    function test_approve() external {
        uint256 approveAmount = 1_000 * 1e18;

        // assure that the allowance of the `owner` to `msg.sender` is 0
        assertEq(trove1.allowance(owner, msg.sender), 0);

        // approve the `msg.sender` to spend `approveAmount` of tokens. The
        // allowance should be equal to `approveAmount` after the approval
        vm.prank(owner);
        trove1.approve(msg.sender, approveAmount);
        assertEq(trove1.allowance(owner, msg.sender), approveAmount);

        // Send a transfer call from `msg.sender` to the contract. The contract
        // should be able to transfer the tokens from the `owner` to the
        // `msg.sender` since the `msg.sender` has been approved to spend the tokens
        vm.prank(msg.sender);
        trove1.transferFrom(owner, msg.sender, approveAmount);
        assertEq(trove1.balanceOf(msg.sender), approveAmount);
        assertEq(trove1.balanceOf(owner), preMintAmount * 1e18 - approveAmount);

        // The allowance should be 0 after the transfer and the totalBalance
        // should not be affected
        assertEq(trove1.totalBalance(), preMintAmount * 1e18);
        assertEq(trove1.allowance(owner, msg.sender), 0);
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

        // Attempt to mint more than the maxTokenPerMint should revert
        uint256 overMintAmount = maxMintPerTx + 1;
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC20InvalidMintAmount(uint256,uint256,uint256)")),
                overMintAmount,
                maxMintPerTx * 1e18,
                overMintAmount * 1e18
            )
        );
        trove1.mint{value: mintCost * (overMintAmount)}(alice, overMintAmount);

        // Attempt to mint less than or equal to 0 should revert
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC20InvalidMintAmount(uint256,uint256,uint256)")), 0, maxMintPerTx * 1e18, 0
            )
        );
        trove1.mint{value: 0}(alice, 0);

        // Attempt to mint without paying mint cost should revert
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC20InsufficientEtherPay(address,uint256,uint256)")), alice, exactMintCost, 0
            )
        );
        trove1.mint{value: 0}(alice, mintAmount);
        // or with less than the exact mint cost
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC20InsufficientEtherPay(address,uint256,uint256)")),
                alice,
                exactMintCost,
                exactMintCost - 1
            )
        );
        trove1.mint{value: exactMintCost - 1}(alice, mintAmount);

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

    function test_mint_max() external {
        uint256 exactMintCost = maxMintPerTx * mintCost;

        // Mint the maximum amount of tokens
        vm.deal(alice, 10 ether);
        vm.startPrank(alice);
        for (uint256 i = 0; i < (totalSupply / maxMintPerTx) - 1; i++) {
            trove1.mint{value: exactMintCost}(alice, maxMintPerTx);
        }

        // Attempt to mint more than the total supply should revert
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC20TotalSupplyExceeded(uint256,uint256,uint256)")),
                totalSupply * 1e18,
                (totalSupply * 1e18) - (trove1.totalBalance()),
                maxMintPerTx * 1e18
            )
        );
        trove1.mint{value: exactMintCost}(alice, maxMintPerTx);
        vm.stopPrank();
    }

    /**
     * @dev Test if the transfer function works correctly
     */
    function test_transfer() external {
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

        // Attempt to transfer more than the balance should revert
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC20InsufficientBalance(address,uint256,uint256)")),
                alice,
                (amount / 2) * 1e18,
                amount * 1e18
            )
        );
        trove1.transfer(bob, amount * 1e18);
    }

    /**
     * @dev Test if the balance of the contract is correct
     */
    function test_balance() external {
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

    function test_withdrawal() external {
        uint256 amount = 1_000;
        uint256 cost = amount * mintCost;

        // assure that the balance of the sender is 0
        assertEq(trove1.balanceOf(alice), 0);
        assertEq(trove1.totalBalance(), preMintAmount * 1e18);

        // The smart contract balance should be 0, since premint
        // cost does not exists
        assertEq(address(trove1).balance, 0);

        // Gives alice 1 ether and send the mint function as alice
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        trove1.mint{value: cost}(alice, amount);

        // Attempt to withdraw more than the contract balance should revert
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("InsufficientWithrawalBalance(uint256,uint256)")), cost + 1_000, cost
            )
        );
        trove1.withdraw(cost + 1_000);

        // Attempt to withdraw less than or equal to 0 ether should revert
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("InvalidWithrawalAmount(uint256)")), 0));
        trove1.withdraw(0);

        // Withdraw the ether from the contract
        assertEq(address(trove1).balance, cost);
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        trove1.withdraw(cost);
        assertEq(address(trove1).balance, 0);

        Trove1 wrongTrove1 = new Trove1(totalSupply, preMintAmount, mintCost, maxMintPerTx);
        vm.deal(bob, 1 ether);
        vm.prank(bob);
        wrongTrove1.mint{value: cost}(bob, amount);

        vm.prank(address(this));
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("WithdrawFailed()"))));
        wrongTrove1.withdraw(cost);
    }
}
