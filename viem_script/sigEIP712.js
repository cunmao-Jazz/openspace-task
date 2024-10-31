// singer721.js

const { parseUnits,http,createWalletClient } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { mainnet } = require('viem/chains');
const client = createWalletClient({
    chain: mainnet,
    transport: http('https://eth.llamarpc.com'), 
  });
  
const domain = {
    name: "NFTMarket",  
    version: "1",
    chainId: 11155111,  
    verifyingContract: "" 
};

const types = {
    Listing: [
        { name: "seller", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "price", type: "uint256" },
    ],
};

const sellerPrivateKey = ""; 

const account = privateKeyToAccount(sellerPrivateKey);




async function signListing() {
    try {
        const signature = await client.signTypedData({
            account,
            domain,
            types,
            primaryType: "Listing",
            message: {
                seller: account.address,
                tokenId:0,
                price: parseUnits("0.01", 18),
            },
        })
        
        console.log("签名结果:", signature);
    } catch (error) {
        console.error("签名 EIP-712 数据时出错：", error);
    }
}

signListing();