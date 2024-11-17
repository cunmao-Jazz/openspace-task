const { createPublicClient, http, parseAbiItem, formatUnits } = require('./node_modules/viem');
const { mainnet } = require('viem/chains');

const transferEventAbi = 'event Deposit(address indexed dst, uint256 wad, string nilAddress)';
const transferEvent = parseAbiItem(transferEventAbi);

async function fetchLogsForRange(client, fromBlock, toBlock) {
    try {
        const logs = await client.getLogs({
            address: '0x2E258DBb253b7e1c0846f212b9B36a2F783bA436',
            event: transferEvent,
            fromBlock: fromBlock,
            toBlock: toBlock,
        });

        return logs.map(log => {
            const { dst, wad, nilAddress } = log.args || {};
            return {
                blockNumber: log.blockNumber.toString(),
                transactionHash: log.transactionHash,
                dst,
                nilAddress,
                wad: wad ? Number(formatUnits(wad, 18)).toFixed(5) : '0.00000'
            };
        }).filter(transfer => transfer.nilAddress && transfer.nilAddress.length > 0); // 只保留有nilAddress的记录
    } catch (error) {
        console.error(`Error fetching logs for range ${fromBlock}-${toBlock}:`, error);
        return [];
    }
}

async function main() {
    const times = 10;
    const blockRange = 10000n;

    const client = createPublicClient({
        chain: mainnet,
        transport: http('https://eth.llamarpc.com'),
    });

    const latestBlockBigInt = await client.getBlockNumber();
    console.log(`最新区块号: ${latestBlockBigInt}`);

    let allTransfers = [];
    
    for (let i = 0; i < times; i++) {
        const toBlock = latestBlockBigInt - (blockRange * BigInt(i));
        const fromBlock = toBlock - blockRange;
        
        console.log(`\n正在查询第 ${i + 1}/${times} 批区块`);
        console.log(`查询区块范围: ${fromBlock} 到 ${toBlock}`);

        const transfers = await fetchLogsForRange(client, fromBlock, toBlock);
        allTransfers = allTransfers.concat(transfers);
        
        // 只显示有nilAddress的事件数量
        console.log(`本批次找到 ${transfers.length} 个带有nilAddress的事件`);

        if (i < times - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log(`\n总共找到 ${allTransfers.length} 个带有nilAddress的Deposit事件\n`);

    // 按区块号排序
    allTransfers.sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber));

    // 打印有nilAddress的事件
    allTransfers.forEach(transfer => {
        console.log(`区块高度:${transfer.blockNumber} ethAddress ${transfer.dst} eth: ${transfer.wad} nilAddress:${transfer.nilAddress}, 交易ID:${transfer.transactionHash}`);
    });
}

main().catch(console.error);