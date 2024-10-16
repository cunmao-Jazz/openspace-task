// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTMarket is IERC721Receiver  {
    IERC20 public paymentToken;
    IERC721 public nftContract;

    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(uint256 => Listing) public  listings;

    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);

    constructor(address _paymentToken, address _nftContract){
        paymentToken = IERC20(_paymentToken);
        nftContract = IERC721(_nftContract);
    }

    function list(uint256 tokenId, uint256 price ) public {
        require(nftContract.ownerOf(tokenId) == msg.sender,"Not the owner");
        require(nftContract.getApproved(tokenId) == address(this),"NFT not approved");

        listings[tokenId] = Listing({seller: msg.sender,price: price});
        nftContract.safeTransferFrom(msg.sender, address(this), tokenId);

        emit NFTListed(tokenId,msg.sender,price);
    }

    function buy(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "This NFT is not for sale.");

        require(paymentToken.balanceOf(msg.sender) >= listing.price, "Insufficient token balance.");

        require(paymentToken.allowance(msg.sender, address(this)) >= listing.price, "Insufficient allowance.");

        require(paymentToken.transferFrom(msg.sender, listing.seller, listing.price), "Token transfer failed.");

        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);

        delete listings[tokenId];

        emit NFTPurchased(tokenId, msg.sender, listing.price);

    }

    function tokensReceived(address from, uint256 amount, bytes calldata data) external {
        uint256 tokenId = abi.decode(data, (uint256));

        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "This NFT is not for sale.");
        require(amount >= listing.price, "Insufficient token amount sent.");

        nftContract.safeTransferFrom(address(this), from, tokenId);

        paymentToken.transferFrom(from, listing.seller, listing.price);

        delete listings[tokenId];

        emit NFTPurchased(tokenId, from, listing.price);
    }

     function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        // This contract accepts all ERC721 tokens
        return this.onERC721Received.selector;
    }
}