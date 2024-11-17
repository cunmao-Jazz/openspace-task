const { createPublicClient, http,parseAbiItem,formatUnits, webSocket} = require('./node_modules/viem');
const { mainnet } = require('viem/chains');
const abi = require('./usdtabi.json');

const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const transferEventAbi = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

const client = createPublicClient({
    chain: mainnet,
    transport: webSocket("wss://mainnet.gateway.tenderly.co"), 
  });

function watchBlock(){
    client.watchBlocks({
        onBlock: (block)=>{
            console.log(`区块高度: ${block.number}, 区块哈希: ${block.hash}`);
        }
    })


}

function watchnillion(){
    client.watchContractEvent({
        address: usdtAddress,
        abi: abi,
        eventName: 'Transfer',
        onLogs: logs => {
            logs.forEach(log => {
                const { from, to, value } = log.args;
                console.log(`从 ${from} 转账 ${formatUnits(value, 6)} USDT 到 ${to}`);
            });
        },
        onError: error => {
            console.error('事件监听错误:', error);
        }
    });
}

function main(){
    // watchUSDT()
    watchBlock()
}

main()