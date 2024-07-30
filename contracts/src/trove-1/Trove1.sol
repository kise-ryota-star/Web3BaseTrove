// SPDX-License-Identifier: GPL-3.0-only
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact devalston390@gmail.com
contract Trove1 is ERC20, ERC20Burnable, Ownable {
    string private constant TOKEN_NAME = "Trove1";
    string private constant TOKEN_SYMBOL = "TRV1";

    uint256 private immutable _mintPrice;
    uint256 private immutable _tokenPerMint;
    uint256 private immutable _totalSupply;

    uint256 private _burnedAmount = 0;
    uint256 private _totalBalance = 0;
    mapping(address account => uint256) private _balances;

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
     * @param supply The total supply of the token
     * @param _preMint The amount of tokens to pre-mint to the deployer of the contract
     * @param price The amount of ether to mint a token
     * @param tokenPerMint The maximum amount of tokens that can be minted per transaction
     */
    constructor(uint256 supply, uint256 _preMint, uint256 price, uint256 tokenPerMint)
        ERC20(TOKEN_NAME, TOKEN_SYMBOL)
        Ownable(_msgSender())
    {
        _totalSupply = supply * 1e18;
        _mintPrice = price;
        _tokenPerMint = tokenPerMint * 1e18;

        super._mint(_msgSender(), _preMint * 1e18);
    }

    /**
     * @dev Returns the amount of ether required to mint a token.
     */
    function mintPrice() external view returns (uint256) {
        return _mintPrice;
    }

    /**
     * @dev Returns the maximum amount of tokens that can be minted per transaction.
     */
    function maxTokenPerMint() external view returns (uint256) {
        return _tokenPerMint;
    }

    /**
     * @dev Returns the total supply of the token.
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the amount of tokens that have been burned.
     */
    function burnedAmount() external view returns (uint256) {
        return _burnedAmount;
    }

    /**
     * @dev Returns the total balance of the token.
     */
    function totalBalance() external view returns (uint256) {
        return _totalBalance;
    }

    /**
     * @dev Returns the balance of the `account` address. This function is an override
     * of the {ERC20-balanceOf} function. This is needed as the _balances mapping is private
     * and needs to be accessed by the {balanceOf} function.
     * @param account The address to check the balance of
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
     * (or `to`) is the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0)) {
            if (_totalBalance + value > _totalSupply) {
                revert ERC20TotalSupplyExceeded(_totalSupply, _totalSupply - _totalBalance, value);
            }
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                // Overflow not possible: value <= fromBalance <= totalSupply.
                _balances[from] = fromBalance - value;
                _totalBalance -= value;
            }
        }

        if (to == address(0)) {
            unchecked {
                // Overflow not possible: value <= totalSupply, _totalBalance + _burnedAmount = _totalSupply.
                _burnedAmount += value;
            }
        } else {
            unchecked {
                // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
                _balances[to] += value;
                _totalBalance += value;
            }
        }

        emit Transfer(from, to, value);
    }

    /**
     * @dev Mints `amount` tokens to the `to` address. This function is payable and requires that the amount of ether
     * sent is equal to the amount of tokens to mint multiplied by the mint price.
     * @param to The address to mint the tokens to
     * @param amount The amount of tokens to mint
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 amount) external payable returns (bool) {
        uint256 _price = amount * _mintPrice;
        uint256 _amount = amount * 1e18;
        if (_amount <= 0 || _amount > _tokenPerMint) {
            revert ERC20InvalidMintAmount(amount, _tokenPerMint, amount);
        }
        if (msg.value < _price) {
            revert ERC20InsufficientEtherPay(_msgSender(), _price, msg.value);
        }
        _mint(to, _amount);
        return true;
    }
}
