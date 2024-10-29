const { createPublicClient, http} = require('./node_modules/viem');
const { mainnet } = require('viem/chains');
const axios = require('axios');
const socksProxy = require('socks-proxy-agent');
const abi = require('./abi.json');

const httpsAgent = new socksProxy.SocksProxyAgent('socks://127.0.0.1:4781')
const contractAddress = '0x0483b0dfc6c78062b9e999a82ffb795925381415';
const tokenId = 1;

async function fetchMetadata(tokenURI) {
    try {
        if (tokenURI.startsWith('ipfs://')) {
        tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
  
      const response = await axios.get(tokenURI,{
        httpsAgent:httpsAgent,
      });
      return response.data;
    } catch (error) {
      console.error('获取元数据时发生错误:', error);
      return null;
    }
  }

async function main() {
  const client = createPublicClient({
    chain: mainnet,
    transport: http('https://eth.llamarpc.com'), 
  });

    const owner = await client.readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'ownerOf',
        args: [tokenId], 

    })
    console.log(`Token ID ${tokenId} 的持有人地址: ${owner}`);

    const tokenURI = await client.readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'tokenURI',
        args: [tokenId],
      });
      console.log(`Token ID ${tokenId} 的 Token URI: ${tokenURI}`);
      const metadata = await fetchMetadata(tokenURI);
      console.log(`Token ID ${tokenId} 的元数据:`, metadata);
}

main();