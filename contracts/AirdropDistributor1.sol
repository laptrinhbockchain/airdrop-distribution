// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.6.11;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @dev These functions deal with verification of Merkle trees (hash trees),
 */
library MerkleProof {
    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     */
    function verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        // Check if the computed hash (root) is equal to the provided root
        return computedHash == root;
    }
}

contract AirdropDistributor1 {
    address public token = 0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7;                                    // BUSD token on BSC Testnet
    bytes32 public merkleRoot = 0x36d8b974d3ee6f19502f2c8c114dc0c1577b94cb94aaccf72bc44dc582362eca;       // Merkle Root
    mapping(address => bool) claimMarker;

    // This event is triggered whenever a call to #claim succeeds.
    event Claimed(address account, uint256 amount);

    constructor() public {
    }

    function claim(address account, uint256 amount, bytes32[] calldata merkleProof) external {
        require(!claimMarker[account], 'MerkleDistributor: Drop already claimed.');

        // Verify the merkle proof.
        bytes32 hash = keccak256(abi.encodePacked(account, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, hash), 'MerkleDistributor: Invalid proof.');

        // Mark it claimed and send the token.
        claimMarker[account] = true;
        require(IERC20(token).transfer(account, amount), 'MerkleDistributor: Transfer failed.');

        emit Claimed(account, amount);
    }
}