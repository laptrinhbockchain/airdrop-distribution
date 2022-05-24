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

async function getAirdropPath(address) {
    // Generate Merkle Tree
    let wallets = await loadWhiteList();
    MerkleTree.genRootHash(wallets);

    // Get path
    let path = MerkleTree.getMerklePath(address);
    console.log(`Airdrop path for address ${address}: ${path}`);
}

getAirdropPath("0xE42C439D836708f43F77a65C198A2d7f55b3f3f4");