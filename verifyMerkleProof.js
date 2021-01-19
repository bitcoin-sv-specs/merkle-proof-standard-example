const bsv = require('bsv')
const { swapEndianness } = require('buffer-swap-endianness')
const exampleMerkleProofs = require('./proofs.json')

// For this reference implementation, we are just using a map to get the block
// header corresponding to the block hash but you will need to retreive it from from
// the headers store of an SPV client or from a third party provider like WhatsOnChain
const mapHashToHeader = {
  '76f26e3dcecb7aafcc2b32d0b910eb7b365dc74ee3d8714541e1e2fb6c0ce669': {
    hash: '76f26e3dcecb7aafcc2b32d0b910eb7b365dc74ee3d8714541e1e2fb6c0ce669',
    confirmations: 1,
    height: 104,
    version: 536870912,
    versionHex: '20000000',
    merkleroot: '9d4e9c273350424f50e961f9fdf8f5d3120bb3528b3f9c6678a42b22df479923',
    num_tx: 15,
    time: 1606136477,
    mediantime: 1605720471,
    nonce: 1,
    bits: '207fffff',
    difficulty: 4.656542373906925e-10,
    chainwork: '00000000000000000000000000000000000000000000000000000000000000d2',
    previousblockhash: '7a37cc07be66f19632628cae6104e07fa2014170045472b56d1f67bb4b294850'
  }
}

function VerifyMerkleProof (merkleProof) {
  let txid
  if (merkleProof.txId) {
    txid = merkleProof.txId
  } else if (merkleProof.txHex) {
    const tx = new bsv.Transaction(merkleProof.txHex)
    txid = tx.id
  } else {
    throw new Error('txId or tx fields missing')
  }

  let merkleRoot
  if (merkleProof.merkleRoot) {
    merkleRoot = merkleProof.merkleRoot
  } else if (merkleProof.blockHeader) {
    merkleRoot = merkleProof.blockHeader.merkleroot
  } else if (merkleProof.blockHash) {
    // You will need to get the block header corresponding
    // to this block hash in order to get the merkle root
    // from it. You can get this from from the headers
    // store of an SPV client or from a third party
    // provider like WhatsOnChain
    merkleRoot = mapHashToHeader[merkleProof.blockHash].merkleroot
  } else {
    throw new Error('merkleRoot or blockHeader or blockHash fields missing')
  }

  let nodes
  if (merkleProof.merkleBranch) {
    nodes = merkleProof.merkleBranch
  } else if (merkleProof.merkleTree) {
    // not supported in this version!
    throw new Error('merkleTree not supported in this version')
  } else {
    throw new Error('merkleBranch or merkleTree or blockHash fields missing')
  }

  // Composite proof not supported in this version

  let index = merkleProof.index // index of node in current layer (will be changed on every iteration)
  let c = txid // first calculated node is the txid of the tx to prove
  let isLastInTree = true

  nodes.forEach(p => {
    // Check if the node is the left or the right child
    const cIsLeft = index % 2 === 0

    // Check for duplicate hash - this happens if the node (p) is
    // the last element of an uneven merkle tree layer
    if (p === '*') {
      if (!cIsLeft) { // this shouldn't happen...
        return { isValidIndex: false, proofValid: false }
      }
      p = c
    }

    // This check fails at least once if it's not the last element
    if (cIsLeft && c !== p) {
      isLastInTree = false
    }

    // Calculate the parent node
    if (cIsLeft) {
      // Concatenate left leaf (c) with right leaf (p)
      c = getMerkleTreeParent(c, p)
    } else {
      // Concatenate left leaf (p) with right leaf (c)
      c = getMerkleTreeParent(p, c)
    }

    // We need integer division here with remainder dropped.
    // Javascript does floating point math by default so we
    // need to use Math.floor to drop the fraction.
    // In most languages we would use: i = i / 2;
    index = Math.floor(index / 2)
  })

  // c is now the calculated merkle root
  return {
    proofValid: c === merkleRoot,
    isLastInTree
  }
}

function getMerkleTreeParent (leftNode, rightNode) {
  // swap endianness before concatenating
  const leftConc = swapEndianness(Buffer.from(leftNode, 'hex'))
  const rightConc = swapEndianness(Buffer.from(rightNode, 'hex'))

  // concatenate leaves
  const concat = Buffer.concat([leftConc, rightConc])

  // hash the concatenation
  const hash = bsv.crypto.Hash.sha256sha256(concat)

  // swap endianness at the end and convert to hex string
  return swapEndianness(Buffer.from(hash, 'hex')).toString('hex')
}

try {
  let allValid = true

  exampleMerkleProofs.forEach((proof, i) => {
    if (!VerifyMerkleProof(proof).proofValid) {
      allValid = false
      console.log(`proof #${i} failed to verify:`)
      console.log('%j', proof)
    }
  })

  if (allValid) {
    console.log('All proofs provided were verified!')
  }
} catch (error) {
  console.error(error)
}
