import * as crypto from 'crypto';
const hashing = (...blockDetails) => {
    return crypto.createHash('sha256').update(blockDetails.sort().join()).digest('hex');
};
class Block {
    constructor(object) {
        this.timeStamp = object.timestamp;
        this.prevBlockHash = object.prevBlockHash;
        this.currentBlockHash = object.currentBlockHash;
        this.data = object.data;
    }
    static genesis() {
        return new Block({ timestamp: 1668181324864, prevBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000000 ', currentBlockHash: 'e717166e335add1e3831a7a8fce006660067eca119108cc62122722e2feaaadc', data: "Genesis Block Created" });
    }
    static creatingBlock(miningData) {
        const timeStamps = Date.now();
        const prevBlockHash = miningData.prevBlock.currentBlockHash;
        return new this({ timestamp: timeStamps, prevBlockHash: prevBlockHash, currentBlockHash: hashing(timeStamps, prevBlockHash, miningData.data), data: miningData.data });
    }
}
const genesisBlock = Block.genesis();
class BlockChain {
    constructor() {
        this.chain = [genesisBlock];
    }
    addBlock(blockChainObject) {
        const newBlock = Block.creatingBlock({ prevBlock: this.chain[(this.chain.length) - 1], data: blockChainObject.data });
        this.chain.push(newBlock);
    }
    static validationCheck(chainLink) {
        if (JSON.stringify(chainLink[0]) != JSON.stringify(Block.genesis())) {
            console.log(false);
        }
    }
}
const newBlockchain = new BlockChain();
const blof = BlockChain.validationCheck(newBlockchain);
newBlockchain.addBlock({ data: "Sudeep Sent 1 million USD" });
newBlockchain.addBlock({ data: "m sudeep" });
newBlockchain.addBlock({ data: " sudeep" });
console.log(newBlockchain);
