// SPDX-License-Identifier: GPL-3.0-only
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ITrove1} from "./ITrove1.sol";

/// @custom:security-contact devalston390@gmail.com
contract Trove1 is ITrove1, ERC20, ERC20Burnable, Ownable {
    string private constant TOKEN_NAME = "Trove1";
    string private constant TOKEN_SYMBOL = "TRV1";

    uint256 private immutable _mintPrice;
    uint256 private immutable _tokenPerMint;
    uint256 private immutable _totalSupply;

    uint256 private _burnedAmount = 0;
    uint256 private _totalBalance = 0;
    mapping(address account => uint256) private _balances;

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

    receive() external payable {}

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
    function totalSupply() public view override(ERC20, IERC20) returns (uint256) {
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
    function balanceOf(address account) public view override(ERC20, IERC20) returns (uint256) {
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
            revert ERC20InvalidMintAmount(amount, _tokenPerMint, _amount);
        }
        if (msg.value < _price) {
            revert ERC20InsufficientEtherPay(_msgSender(), _price, msg.value);
        }
        _mint(to, _amount);
        return true;
    }

    /**
     * @dev Allows the owner to withdraw ether from the smart contract.
     * @param amount The amount of ether to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner returns (bool) {
        if (amount > address(this).balance) {
            revert InsufficientWithrawalBalance(amount, address(this).balance);
        }

        if (amount <= 0) {
            revert InvalidWithrawalAmount(amount);
        }

        (bool success,) = payable(super.owner()).call{value: amount}("");
        if (!success) {
            revert WithdrawFailed();
        }
        return true;
    }
}
