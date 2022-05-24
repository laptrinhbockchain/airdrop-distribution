const Web3 = require('web3');

const web3Provider = new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443');
const web3 = new Web3(web3Provider);

const merkleTree = {
    leaves: null,
    root: null
};

function genRootHash(whiteList) {
    const leaves = genLeaveHashes(whiteList);
    merkleTree.leaves = leaves;
    merkleTree.root = buildMerkleTree(leaves);
    return merkleTree.root.hash;
}
exports.genRootHash = genRootHash;

function genLeaveHashes(chunks) {
    const leaves = []
    chunks.forEach((data) => {
        const hash = buildHash(data)
        const node = {
            hash,
            parent: null,
        }
        leaves.push(node)
    })
    return leaves
}

function buildMerkleTree(leaves) {
    const numLeaves = leaves.length
    if (numLeaves === 1) {
        return leaves[0]
    }
    const parents = []
    let i = 0
    while (i < numLeaves) {
        const leftChild = leaves[i]
        const rightChild = i + 1 < numLeaves ? leaves[i + 1] : leftChild
        parents.push(createParent(leftChild, rightChild))
        i += 2
    }
    return buildMerkleTree(parents)
}

function createParent(leftChild, rightChild) {
    const hash = leftChild.hash < rightChild.hash ? buildHash(leftChild.hash, rightChild.hash) : buildHash(rightChild.hash, leftChild.hash)
    const parent = {
        hash,
        parent: null,
        leftChild,
        rightChild
    }
    leftChild.parent = parent
    rightChild.parent = parent
    return parent
}

function buildHash(...data) {
    return web3.utils.soliditySha3(...data)
}

function getMerklePath(data) {
    const hash = buildHash(data)
    for (let i = 0; i < merkleTree.leaves.length; i += 1) {
        const leaf = merkleTree.leaves[i]
        if (leaf.hash === hash) {
            return generateMerklePath(leaf)
        }
    }
}
exports.getMerklePath = getMerklePath;

function generateMerklePath(node, path = []) {
    if (node.hash === merkleTree.root.hash) {
        return path
    }
    const isLeft = (node.parent.leftChild === node)
    if (isLeft) {
        path.push(node.parent.rightChild.hash)
    } else {
        path.push(node.parent.leftChild.hash)
    }
    return generateMerklePath(node.parent, path)
}

function verifyPath(data, path) {
    let hash = buildHash(data)
    for (let i = 0; i < path.length; i += 1) {
        hash = hash < path[i] ? buildHash(hash, path[i]) : buildHash(path[i], hash)
    }
    return hash === merkleTree.root.hash
}
exports.verifyPath = verifyPath;