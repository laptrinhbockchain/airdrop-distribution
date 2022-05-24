const fs = require('fs');
const readline = require('readline');
const MerkleTree = require('./utils/MerkleTree');

const WHITELIST_FILE = "whitelist.txt";

async function loadWhiteList() {
    let wallets = [];
    const fileStream = fs.createReadStream(WHITELIST_FILE);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (line) wallets.push(line);
    }
    return wallets;
}

async function generateRootHash() {
    let wallets = await loadWhiteList();
    console.log(`Number of wallets: ${wallets.length}`);
    let startTime = Date.now();
    let rootHash = MerkleTree.genRootHash(wallets);
    console.log(`Root Hash: ${rootHash}`);
    let diffTime = Date.now() - startTime;
    console.log(`Done in ${(diffTime/(60*1000)).toFixed(2)} mins!`);
}

generateRootHash();