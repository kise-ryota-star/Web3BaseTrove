// SPDX-License-Identifier: GPL-3.0-only
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @custom:security-contact devalston390@gmail.com
contract Trove is ERC721, ERC721Enumerable, ERC721Burnable, ERC721URIStorage, AccessControl, ReentrancyGuard {
    string private constant TOKEN_NAME = "Trove";
    string private constant TOKEN_SYMBOL = "TRV";

    bytes32 private constant MINTER = keccak256("MINTER");
    uint256 private _nextTokenId;
    string private baseUri;

    /**
     * @dev Constructor that sets the initial roles of the contract.
     * @param admin The address that will be the admin of the contract
     * @param minter The smart contract address that will be the minter of the contract
     */
    constructor(address admin, address minter, string memory _baseUri) ERC721(TOKEN_NAME, TOKEN_SYMBOL) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER, admin);
        _grantRole(MINTER, minter);
        baseUri = _baseUri;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Returns the base URI of the NFT, which is used to construct the full token URI.
     */
    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    /**
     * @dev Returns the base URI of the NFT.
     */
    function getBaseURI() external view returns (string memory) {
        return baseUri;
    }

    /**
     * @dev Sets the base URI of the NFT. Only the admin can call this function.
     * @param uri The base URI of the NFT
     */
    function setBaseURI(string memory uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseUri = uri;
    }

    /**
     * @dev Returns the full token URI of the NFT with the given token ID.
     * @param tokenId The token ID of the NFT
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Mints an NFT to an address. Only the address with minter role can call this function.
     * @param to The address to mint the NFT to
     * @param uri The base URI of the NFT
     */
    function safeMint(address to, string memory uri) external onlyRole(MINTER) nonReentrant {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Sets the token URI of the NFT with the given token ID, only the admin can call this function.
     * @param tokenId The token ID of the NFT
     * @param _tokenURI The token URI of the NFT
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTokenURI(tokenId, _tokenURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
