// SPDX-License-Identifier: GPL-3.0-only
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface ITrove1 is IERC20 {
    /**
     * @dev Indicates that the amount of ether sent is less than the required amount to mint a token.
     * @param account The account that sent the ether
     * @param expected The amount of ether required to mint a token
     * @param actual The amount of ether sent
     */
    error ERC20InsufficientEtherPay(address account, uint256 expected, uint256 actual);

    /**
     * @dev Indicates that the amount of tokens to mint is greater than the maximum amount
     * or <= 0 of tokens that can be minted per transaction.
     * @param amount The amount of tokens to mint
     * @param maxAmount The maximum amount of tokens that can be minted per transaction
     * @param actual The actual amount of tokens to mint
     */
    error ERC20InvalidMintAmount(uint256 amount, uint256 maxAmount, uint256 actual);

    /**
     * @dev Indicates that the total supply of the token has been exceeded.
     * @param totalSupply The total supply of the token
     * @param remaining The remaining amount of tokens that can be minted
     * @param actual The actual amount of tokens the user mint
     */
    error ERC20TotalSupplyExceeded(uint256 totalSupply, uint256 remaining, uint256 actual);

    /**
     * @dev Indicates that the smart contract has insufficient balance for owner to withdraw
     * @param withdraw The amount of ether the owner wants to withdraw
     * @param balance The balance of the smart contract
     */
    error InsufficientWithrawalBalance(uint256 withdraw, uint256 balance);

    /**
     * @dev Indicates that the owner has entered an invalid withdrawal amount
     * @param amount The amount the owner wants to withdraw
     */
    error InvalidWithrawalAmount(uint256 amount);

    /**
     * @dev Indicates that the withdrawal failed.
     */
    error WithdrawFailed();

    /**
     * @dev Mints `amount` tokens to the `to` address. This function is payable and requires that the amount of ether
     * sent is equal to the amount of tokens to mint multiplied by the mint price.
     * @param to The address to mint the tokens to
     * @param amount The amount of tokens to mint
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 amount) external payable returns (bool);

    /**
     * @dev Allows the owner to withdraw ether from the smart contract.
     * @param amount The amount of ether to withdraw
     */
    function withdraw(uint256 amount) external returns (bool);

    /**
     * @dev Returns the total balance of the token.
     */
    function totalBalance() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens that have been burned.
     */
    function burnedAmount() external view returns (uint256);

    /**
     * @dev Returns the maximum amount of tokens that can be minted per transaction.
     */
    function maxTokenPerMint() external view returns (uint256);

    /**
     * @dev Returns the amount of ether required to mint a token.
     */
    function mintPrice() external view returns (uint256);
}
