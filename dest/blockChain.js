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
        this.nonce = object.nonce;
        this.difficulty = object.difficulty;
    }
    static genesis() {
        return new Block({ timestamp: 1668181324864, prevBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000000 ', currentBlockHash: '0x07166e335add1e3831a7a8fce006660067eca119108cc62122722e2feaaadc', data: "Genesis Block Created", nonce: 0, difficulty: 3 });
    }
    static creatingBlock(miningData) {
        let nonceTimeStamp, currentHash, nonce = 0;
        const { difficulty } = miningData.prevBlock;
        const prevBlockHash = miningData.prevBlock.currentBlockHash;
        do {
            nonce++;
            nonceTimeStamp = Date.now();
            currentHash = hashing(nonce, nonceTimeStamp, miningData.data, prevBlockHash, difficulty);
        } while (currentHash.substring(0, difficulty) !== '0'.repeat(difficulty));
        return new this({ timestamp: nonceTimeStamp, prevBlockHash: prevBlockHash, currentBlockHash: currentHash, data: miningData.data, nonce: nonce, difficulty: difficulty });
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
    static validationCheck(newChain) {
        if (JSON.stringify(newChain[0]) !== JSON.stringify(Block.genesis())) {
            console.error("Chain is not valid");
        }
        for (let i = 1; i < newChain.length; i++) {
            const { currentBlockHash, prevBlockHash, data, difficulty, nonce, timeStamp } = newChain[i];
            const lastBlockHash = newChain[i - 1].currentBlockHash;
            if (prevBlockHash !== lastBlockHash)
                return "Chain is not valid";
            const hashingFuncHash = hashing(timeStamp, data, difficulty, nonce, prevBlockHash);
            if (currentBlockHash !== hashingFuncHash)
                return "Chain is not valid";
        }
        return "This Blockchain is valid";
    }
    selectingVerifiedChain(minerSentChain) {
        if (minerSentChain.length <= this.chain.length) {
            console.error("This is not the longest Chain");
            return;
        }
        else if (!BlockChain.validationCheck(minerSentChain)) {
            console.error("This Chain is not valid");
            return;
        }
        else
            this.chain = minerSentChain;
    }
}
const darkGuildBlockchain = new BlockChain();
darkGuildBlockchain.addBlock({ data: "Sudeep Sent 1 million USD" });
darkGuildBlockchain.addBlock({ data: "monisha sent sudeep 10 ETH" });
darkGuildBlockchain.addBlock({ data: " sudeep" });
darkGuildBlockchain.addBlock({ data: "sh" });
const verification = BlockChain.validationCheck(darkGuildBlockchain);
if (verification) {
    console.log(darkGuildBlockchain);
}
