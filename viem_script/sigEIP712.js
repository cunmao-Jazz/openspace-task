// singer721.js

const { parseUnits,http,createWalletClient } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { mainnet } = require('viem/chains');
const client = createWalletClient({
    chain: mainnet,
    transport: http('https://eth.llamarpc.com'), 
  });
  
const domain = {
    name: "cat",  
    version: "1",
    chainId: 11155111,  
    verifyingContract: "" 
};

const types = {
    Permit: [
        { name: "owner", type: "address" },
        { name: "approve", type: "address" },
        { name: "tokenId", type: "uint256" },
    ],
};

const sellerPrivateKey = ""; 

const account = privateKeyToAccount(sellerPrivateKey);
console.log(account.address)



async function signListing() {
    try {
        const signature = await client.signTypedData({
            account,
            domain,
            types,
            primaryType: "Permit",
            message: {
                owner: account.address,
                approve: "",
                tokenId: 0,
            },
        })
        
        console.log("签名结果:", signature);
    } catch (error) {
        console.error("签名 EIP-712 数据时出错：", error);
    }
}

signListing();