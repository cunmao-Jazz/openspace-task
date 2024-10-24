const { createPublicClient, http,parseAbiItem,formatUnits} = require('viem');
const { mainnet } = require('viem/chains');

const transferEventAbi = 'event Transfer(address indexed from, address indexed to, uint256 value)';

const transferEvent = parseAbiItem(transferEventAbi);
async function main() {
    const client = createPublicClient({
        chain: mainnet,
        transport: http('https://eth.llamarpc.com'), 
    });

    const latestBlockBigInt = await client.getBlockNumber();
    console.log(`最新区块号: ${latestBlockBigInt}`);

    const blockRange = 100n;
    const fromBlock = latestBlockBigInt - blockRange > 0n ? latestBlockBigInt - blockRange : 0n;
    const toBlock = latestBlockBigInt;

    console.log(`查询区块范围: ${fromBlock} 到 ${toBlock}\n`);

    const logs = await client.getLogs({
        address: '0xA0b86991C6218B36c1d19D4a2e9Eb0cE3606EB48',
        event:transferEvent,
        fromBlock: fromBlock, 
        toBlock: toBlock,
      });
  
      console.log(`找到 ${logs.length} 个USDC Transfer事件\n`);

      
    const newTransfers = logs.map(log => {
        const { from, to, value } = log.args || {};
        return {
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash,
            from,
            to,
            value: value ? Number(formatUnits(value, 6)).toFixed(5) : '0.00000' };
    });

    newTransfers.forEach(transfer => {
        console.log(`区块高度:${transfer.blockNumber} 从 ${transfer.from} 转账给 ${transfer.to} ${transfer.value} USDC, 交易ID:${transfer.transactionHash}`);
    });

} 

main()