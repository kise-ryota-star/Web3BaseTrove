// SPDX-License-Identifier: GPL-3.0-only
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @custom:security-contact devalston390@gmail.com
contract Trove2 is ERC20, ERC20Burnable, AccessControl {
    string private constant TOKEN_NAME = "Trove2";
    string private constant TOKEN_SYMBOL = "TRV2";

    bytes32 public constant MINTER = keccak256("MINTER");

    /**
     * @dev Constructor that sets the initial roles of the contract.
     * @param admin The address that will be the admin of the contract
     * @param minter The smart contract address that will be the minter of the contract
     */
    constructor(address admin, address minter) ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER, admin);
        _grantRole(MINTER, minter);
    }

    /**
     * @dev Mints `amount` tokens to the `to` address. Only the minter role can call this function.
     * @param to The address to mint the tokens to
     * @param amount The amount of tokens to mint
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 amount) external returns (bool) {
        require(hasRole(MINTER, _msgSender()));
        _mint(to, amount);
        return true;
    }
}
