const fs = require('fs');
const readline = require('readline');
const MerkleTree1 = require('./utils/MerkleTree1');

const WHITELIST_FILE = "whitelist.txt";

async function loadWhiteList() {
    let wallets = [];
    const fileStream = fs.createReadStream(WHITELIST_FILE);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        let idx = wallets.length;
        let amount = BigInt((1 + idx%10)*10**18).toString();
        wallets.push({ address: line, amount: amount });
    }
    return wallets;
}

async function getAirdropPath(address) {
    // Generate Merkle Tree
    let wallets = await loadWhiteList();
    MerkleTree1.genRootHash(wallets);

    // Get path
    let wallet = wallets.find(item => item.address==address);
    let path = MerkleTree1.getMerklePath(wallet);
    console.log(`Airdrop path for address ${address} (${wallet.amount}): ${path}`);
}

getAirdropPath("0x65C09aF59050B41A4CA12667a5e2FF782eEC5941");