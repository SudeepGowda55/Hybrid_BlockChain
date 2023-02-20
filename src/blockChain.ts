import * as crypto from 'crypto';
import express from "express";
import { Kafka } from 'kafkajs';

const app = express();

//Kafka Broker Connection Client
const kafka = new Kafka({
    clientId: "validator1",
    brokers: ['34.67.215.248:9092']
})

//Converting Hexadecimal to Binary for more flexibality in difficulty
const hexToBinary = (hexData: string) => hexData.split('').map(i => parseInt(i, 16).toString(2).padStart(4, '0')).join('');

//Hash Generating Function
const hashing = (...blockDetails: any) => {
    return hexToBinary(crypto.createHash('sha256').update(blockDetails.sort().join('')).digest('hex'));
}

const miningRate: number = 10000; // Here the mining Rate is defined in milliseconds. so this is 10 seconds


interface BlockVariables {
    blockHeight: number,
    timeStamp: number;
    prevBlockHash: string;
    currentBlockHash: string;
    nonce: number;
    difficulty: number;
}


interface TransactionDetails {
    sender: string,
    receiver: string,
    value: number
}


//Class For Creating Block Objects
class Block implements BlockVariables{
    blockHeight: number = 1;
    timeStamp: number;
    prevBlockHash: string;
    currentBlockHash: string;
    transactionData: TransactionDetails[];
    nonce: number;
    difficulty: number;

    constructor(public object: {
        timestamp: number,
        prevBlockHash: string,
        currentBlockHash: string,
        data: TransactionDetails[],
        nonce: number,
        difficulty: number
    }) {
        this.timeStamp = object.timestamp;
        this.prevBlockHash = object.prevBlockHash;
        this.currentBlockHash = object.currentBlockHash;
        this.transactionData = object.data;
        this.nonce = object.nonce;
        this.difficulty = object.difficulty;
    }

    //Genesis Block Creation
    static genesis(): Block {
        return new Block({
            timestamp: 1668181324864,
            prevBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000000 ',
            currentBlockHash: '0x07166e335add1e3831a7a8fce006660067eca119108cc62122722e2feaaadc',
            data: [{ sender: "0x0000000000000000", receiver: "oxyfwdfywff5532e525", value: 2 }],
            nonce: 0,
            difficulty: 0
        })
    }

    //Creating Block
    static creatingBlock(miningData: { prevBlock: Block, data: TransactionDetails[] }) {
        let nonceTimeStamp: number, currentHash: string, nonce: number = 0;
        let { difficulty } = miningData.prevBlock;
        const prevBlockHash: string = miningData.prevBlock.currentBlockHash;
        do {
            nonce++;
            nonceTimeStamp = Date.now();
            difficulty = Block.adjustingDifficulty({ timestamp: nonceTimeStamp, previousBlock: miningData.prevBlock });
            currentHash = hashing(nonce, nonceTimeStamp, miningData.data, prevBlockHash, difficulty);
        } while (currentHash.substring(0, difficulty) !== '0'.repeat(difficulty));
        console.log(difficulty);
        return new this({ timestamp: nonceTimeStamp, prevBlockHash: prevBlockHash, currentBlockHash: parseInt(currentHash, 2).toString(16).toUpperCase(), data: miningData.data, nonce: nonce, difficulty: difficulty });
    }

    static adjustingDifficulty(difficultyObject: { timestamp: number, previousBlock: Block }) {
        const { difficulty } = difficultyObject.previousBlock;
        if (difficulty < 1) return 1;
        const differenceInTimestamp: number = difficultyObject.timestamp - difficultyObject.previousBlock.timeStamp;
        if (differenceInTimestamp > miningRate) {
            return difficulty - 1;
        }
        else {
            return difficulty + 1;
        }
    }
}


const genesisBlock: Block = Block.genesis();



class BlockChain {
    chain: Block[];

    constructor() {
        this.chain = [genesisBlock]
    }

    //Creating Block By Passing Transaction Data
    addBlock(blockChainObject: { data: TransactionDetails[] }) {
        const newBlock: Block = Block.creatingBlock({ prevBlock: this.chain[(this.chain.length) - 1], data: blockChainObject.data });
        this.chain.push(newBlock);
    }


    static validationCheck(newChain: BlockChain) {
        if (JSON.stringify(newChain.chain[0]) !== JSON.stringify(Block.genesis())) {
            console.error("This Chain is not valid")
        }

        for (let i: number = 1; i < newChain.chain.length; i++) {
            const { currentBlockHash, prevBlockHash, transactionData, difficulty, nonce, timeStamp } = newChain.chain[i];
            const lastBlockHash = newChain.chain[i - 1].currentBlockHash;
            const lastBlockDifficulty = newChain.chain[i - 1].difficulty;
            if (prevBlockHash !== lastBlockHash) {
                console.log("This Chain is not valid")
                return
            };

            const hashingFuncHash = parseInt(hashing(timeStamp, transactionData, difficulty, nonce, prevBlockHash), 2).toString(16).toUpperCase();

            if (currentBlockHash !== hashingFuncHash) {
                console.log("This Chain is not valid")
                return
            };

            if (Math.abs(difficulty - lastBlockDifficulty) > 1) {
                console.log("Miner has manipulated the difficulty")
                return
            }

        }
        return "This Blockchain is valid"
    }

    selectingVerifiedChain(minerSentChain: BlockChain) {
        if (minerSentChain.chain.length <= this.chain.length) {
            console.error("This is not the longest Chain");
            return null
        }
        else if (!BlockChain.validationCheck(minerSentChain)) {
            console.error("This Chain is not valid")
            return
        }
        else this.chain = minerSentChain.chain
    }
}

const darkGuildBlockchain: BlockChain = new BlockChain();

const timeStampDifferences: number[] = [];

let prevBlockTimeStamp: number, nextBlockTimeStamp: number, timeDifference: number, avgTime: number;

darkGuildBlockchain.addBlock({ data: [{sender: "0xgwdwr7drwugd7rdevervqcbjdsb", receiver: "0xtqwrqwgdqwty76ygvgDRDsdsguc", value: 3 }] });
darkGuildBlockchain.addBlock({ data: [{sender: "0xgwdwr7drwugd7rdevervqwdqdqd", receiver: "0x89wqfrdq7wtw12d13bjkdbmcbfb", value: 3 }] });
darkGuildBlockchain.addBlock({ data: [{sender: "0x523ggcvdcdfatdsgjcuytwed5w5", receiver: "0xgwdwr7drwugd7rdevervqwdqdqd", value: 3 }] });

for (let j = 2; j < darkGuildBlockchain.chain.length; j++) {
    prevBlockTimeStamp = darkGuildBlockchain.chain[j - 1].timeStamp;
    nextBlockTimeStamp = darkGuildBlockchain.chain[j].timeStamp;
    timeDifference = nextBlockTimeStamp - prevBlockTimeStamp;
    timeStampDifferences.push(timeDifference);
}

avgTime = timeStampDifferences.reduce((total: number, num: number) => total + num) / timeStampDifferences.length;

console.log(avgTime / 1000, "seconds");

const updateBlockchain = async () => {
    const consumer = kafka.consumer({
        groupId: "miners1"
    })

    await consumer.connect();
    await consumer.subscribe({ topic: "blockchain", fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            console.log({ value: message.value?.toString() })
            // darkGuildBlockchain.addBlock({ data: [JSON.stringify(message.value?.toString())] });
        }
    })
}

const verification = BlockChain.validationCheck(darkGuildBlockchain);

if (verification) {
    console.log(darkGuildBlockchain.chain)
    updateBlockchain();
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api/blocks", (req, res) => {
    res.json(darkGuildBlockchain.chain);
})

app.listen(3033, () => {
    console.log(`Server runnng at port no 3030`)
})