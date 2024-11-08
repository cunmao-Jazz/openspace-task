// merkle.js

const { toHex, encodePacked, keccak256 } = require('viem');
const { MerkleTree } = require('merkletreejs');

// 用户数据，仅包含地址
const users = [
    "0xe05fcC23807536bEe418f142D19fa0d21BB0cfF7",
    "0xb7D15753D3F76e7C892B63db6b4729f700C01298",
    "0xf69Ca530Cd4849e3d1329FBEC06787a96a3f9A68",
    "0xa8532aAa27E9f7c3a96d754674c99F1E2f824800",
  ];

/**
 * 构建叶子节点
 * 对每个用户地址，生成 keccak256(abi.encodePacked(address))
 */
const elements = users.map((user) => {
  const encoded = encodePacked(["address"], [user]); // encodePacked 返回 Uint8Array
  // 使用 keccak256 对编码后的字节进行哈希
  const hash = keccak256(encoded); // keccak256 返回 Uint8Array
  return Buffer.from(hash.slice(2), 'hex'); // 转换为 Buffer 以供 merkletreejs 使用
});

// 创建梅克尔树，使用 keccak256 作为哈希算法，启用排序
const merkleTree = new MerkleTree(elements, keccak256, { sort: true });

// 获取梅克尔根
const merkleRoot = merkleTree.getHexRoot();
console.log('Merkle Root:', merkleRoot);

// 生成特定用户的梅克尔证明
const targetUser = users[0]; // 选择第一个用户
const targetEncoded = encodePacked(["address"], [targetUser]);
const targetHash = keccak256(targetEncoded);
const targetLeaf = Buffer.from(targetHash.slice(2), 'hex');
const proof = merkleTree.getHexProof(targetLeaf);
console.log(`Merkle Proof for ${targetUser}:`, proof);

