"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const hexToBinary = (hexData) => hexData.split('').map(i => parseInt(i, 16).toString(2).padStart(4, '0')).join('');
const hashing = (...blockDetails) => {
    return hexToBinary(crypto.createHash('sha256').update(blockDetails.sort().join('')).digest('hex'));
};
const miningRate = 10000; // Here the mining Rate is defined in milliseconds. so this is 10 seconds
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
        return new Block({ timestamp: 1668181324864, prevBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000000 ', currentBlockHash: '0x07166e335add1e3831a7a8fce006660067eca119108cc62122722e2feaaadc', data: "Genesis Block Created", nonce: 0, difficulty: 15 });
    }
    static creatingBlock(miningData) {
        let nonceTimeStamp, currentHash, nonce = 0;
        let { difficulty } = miningData.prevBlock;
        const prevBlockHash = miningData.prevBlock.currentBlockHash;
        do {
            nonce++;
            nonceTimeStamp = Date.now();
            difficulty = Block.adjustingDifficulty({ timestamp: nonceTimeStamp, previousBlock: miningData.prevBlock });
            currentHash = hashing(nonce, nonceTimeStamp, miningData.data, prevBlockHash, difficulty);
        } while (currentHash.substring(0, difficulty) !== '0'.repeat(difficulty));
        console.log(difficulty);
        return new this({ timestamp: nonceTimeStamp, prevBlockHash: prevBlockHash, currentBlockHash: parseInt(currentHash, 2).toString(16).toUpperCase(), data: miningData.data, nonce: nonce, difficulty: difficulty });
    }
    static adjustingDifficulty(difficultyObject) {
        const { difficulty } = difficultyObject.previousBlock;
        if (difficulty < 1)
            return 1;
        const differenceInTimestamp = difficultyObject.timestamp - difficultyObject.previousBlock.timeStamp;
        if (differenceInTimestamp > miningRate) {
            return difficulty - 1;
        }
        else {
            return difficulty + 1;
        }
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
        if (JSON.stringify(newChain.chain[0]) !== JSON.stringify(Block.genesis())) {
            console.error("This Chain is not valid");
        }
        for (let i = 1; i < newChain.chain.length; i++) {
            const { currentBlockHash, prevBlockHash, data, difficulty, nonce, timeStamp } = newChain.chain[i];
            const lastBlockHash = newChain.chain[i - 1].currentBlockHash;
            const lastBlockDifficulty = newChain.chain[i - 1].difficulty;
            if (prevBlockHash !== lastBlockHash) {
                console.log("This Chain is not valid");
            }
            ;
            const hashingFuncHash = parseInt(hashing(timeStamp, data, difficulty, nonce, prevBlockHash), 2).toString(16).toUpperCase();
            if (currentBlockHash !== hashingFuncHash) {
                console.log("This Chain is not valid");
            }
            ;
            if (Math.abs(difficulty - lastBlockDifficulty) > 1) {
                console.log("Miner has manipulated the difficulty");
            }
        }
        return "This Blockchain is valid";
    }
    selectingVerifiedChain(minerSentChain) {
        if (minerSentChain.chain.length <= this.chain.length) {
            console.error("This is not the longest Chain");
            return;
        }
        else if (!BlockChain.validationCheck(minerSentChain)) {
            console.error("This Chain is not valid");
            return;
        }
        else
            this.chain = minerSentChain.chain;
    }
}
const darkGuildBlockchain = new BlockChain();
const timeStampDifferences = [];
let prevBlockTimeStamp, nextBlockTimeStamp, timeDifference, avgTime;
darkGuildBlockchain.addBlock({ data: "sudeep sent monisha 8 ETH" });
darkGuildBlockchain.addBlock({ data: "monisha sent sudeep 10 ETH" });
darkGuildBlockchain.addBlock({ data: "ms" });
darkGuildBlockchain.addBlock({ data: "sudeep sent monisha 8 ETH" });
darkGuildBlockchain.addBlock({ data: "monisha sent sudeep 10 ETH" });
// darkGuildBlockchain.addBlock({data : "ms"});
// darkGuildBlockchain.addBlock({data : "monisha sent sudeep 10 ETH"});
// darkGuildBlockchain.addBlock({data : "ms"});
for (let j = 2; j < darkGuildBlockchain.chain.length; j++) {
    prevBlockTimeStamp = darkGuildBlockchain.chain[j - 1].timeStamp;
    nextBlockTimeStamp = darkGuildBlockchain.chain[j].timeStamp;
    timeDifference = nextBlockTimeStamp - prevBlockTimeStamp;
    timeStampDifferences.push(timeDifference);
}
avgTime = timeStampDifferences.reduce((total, num) => total + num) / timeStampDifferences.length;
console.log(avgTime / 1000, "seconds");
const verification = BlockChain.validationCheck(darkGuildBlockchain);
if (verification) {
    console.log(darkGuildBlockchain);
}
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.get("/api/blocks", (req, res) => {
    res.json(darkGuildBlockchain.chain);
});
app.post("/api/addblock", (req, res) => {
    const { data } = req.body;
    darkGuildBlockchain.addBlock({ data: data });
    res.redirect("/api/blocks");
});
app.listen(3030, () => {
    console.log(`Server runnng at port no 3030`);
});
