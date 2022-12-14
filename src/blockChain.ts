import *  as crypto from 'crypto';
import express from "express";
import { Kafka } from 'kafkajs';

const app = express();

const kafka = new Kafka({
    clientId : "validator1",
    brokers : ['34.67.215.248:9092']
})

const hexToBinary = (hexData : string) => hexData.split('').map(i => parseInt(i, 16).toString(2).padStart(4, '0')).join('');

const hashing = (...blockDetails : any)  => {
    return hexToBinary(crypto.createHash('sha256').update(blockDetails.sort().join('')).digest('hex'));
}

const miningRate : number = 10000; // Here the mining Rate is defined in milliseconds. so this is 10 seconds

class Block {

    timeStamp : number;
    prevBlockHash : string;
    currentBlockHash : string;
    transactionData: string[];
    nonce : number;
    difficulty : number;

    constructor ( object : {timestamp : number, prevBlockHash : string, currentBlockHash : string, data : string[], nonce : number, difficulty : number}){
       this.timeStamp = object.timestamp;
       this.prevBlockHash = object.prevBlockHash;
       this.currentBlockHash = object.currentBlockHash;
       this.transactionData = object.data;
       this.nonce = object.nonce;
       this.difficulty = object.difficulty;
    }

    static genesis() : Block {
        return new Block({timestamp: 1668181324864, prevBlockHash : '0x0000000000000000000000000000000000000000000000000000000000000000 ', currentBlockHash: '0x07166e335add1e3831a7a8fce006660067eca119108cc62122722e2feaaadc', data : ["Genesis Block Created"], nonce : 0, difficulty : 15})
    }

    static creatingBlock(miningData : {prevBlock : Block, data : string[]}) {
        let nonceTimeStamp: number, currentHash : string, nonce : number = 0;
        let { difficulty } = miningData.prevBlock ;
        const prevBlockHash : string = miningData.prevBlock.currentBlockHash;
        do {
            nonce ++; 
            nonceTimeStamp = Date.now();
            difficulty = Block.adjustingDifficulty({timestamp : nonceTimeStamp, previousBlock : miningData.prevBlock});
            currentHash = hashing(nonce, nonceTimeStamp, miningData.data, prevBlockHash, difficulty );
        } while (currentHash.substring(0, difficulty) !== '0'.repeat(difficulty)) ;
        console.log(difficulty);
        return new this({timestamp : nonceTimeStamp, prevBlockHash : prevBlockHash, currentBlockHash: parseInt(currentHash, 2).toString(16).toUpperCase(), data : miningData.data, nonce : nonce, difficulty : difficulty });
    }   

    static adjustingDifficulty(difficultyObject : {timestamp : number, previousBlock : Block}){
        const {difficulty} = difficultyObject.previousBlock;
        if (difficulty < 1) return 1;
        const differenceInTimestamp : number = difficultyObject.timestamp - difficultyObject.previousBlock.timeStamp;
        if (differenceInTimestamp > miningRate) {
            return difficulty - 1;
        } 
        else {
            return difficulty + 1;
        }
    }
}

const genesisBlock : Block = Block.genesis();

class BlockChain {
    chain : Block[];

    constructor () {
        this.chain = [genesisBlock]
    }

    addBlock(blockChainObject : {data : string[]}) {
        const newBlock : Block = Block.creatingBlock({prevBlock : this.chain[(this.chain.length)-1], data : blockChainObject.data});
        this.chain.push(newBlock);
    }

    static validationCheck (newChain : BlockChain)  {
        if (JSON.stringify(newChain.chain[0]) !== JSON.stringify(Block.genesis())) {
            console.error("This Chain is not valid")
        }

        for (let i : number = 1; i < newChain.chain.length; i ++ ){
            const {currentBlockHash, prevBlockHash, transactionData, difficulty, nonce, timeStamp} = newChain.chain[i];
            const lastBlockHash = newChain.chain[i - 1].currentBlockHash;
            const lastBlockDifficulty = newChain.chain[i - 1].difficulty;
            if (prevBlockHash !== lastBlockHash) {
                console.log("This Chain is not valid")
            };
            const hashingFuncHash = parseInt(hashing(timeStamp, transactionData, difficulty, nonce, prevBlockHash), 2).toString(16).toUpperCase();

            if (currentBlockHash !== hashingFuncHash) {
                console.log("This Chain is not valid")
            };

            if (Math.abs(difficulty - lastBlockDifficulty) > 1) {
                console.log("Miner has manipulated the difficulty")
            }
        }
        return "This Blockchain is valid"
    }

    selectingVerifiedChain (minerSentChain : BlockChain) {
      if (minerSentChain.chain.length <= this.chain.length){
        console.error("This is not the longest Chain");
        return
      }
      else if (!BlockChain.validationCheck(minerSentChain)){
        console.error("This Chain is not valid")
        return
      }
      else this.chain = minerSentChain.chain
    }
}

const darkGuildBlockchain : BlockChain  = new BlockChain();

const timeStampDifferences : number[] = [];

let prevBlockTimeStamp : number, nextBlockTimeStamp : number, timeDifference : number, avgTime : number ;

darkGuildBlockchain.addBlock({data : ["sudeep sent monisha 8 ETH", "bob sent 1 eth to 0x893bjkdbmcbfb"]});
darkGuildBlockchain.addBlock({data : ["monisha sent sudeep 10 ETH"]});
darkGuildBlockchain.addBlock({data : ["ms"]});
darkGuildBlockchain.addBlock({data : ["Hackersploit sent david 12 ETH"]});
darkGuildBlockchain.addBlock({data : ["monisha sent sudeep 10 ETH", "david 12 eth"]});
darkGuildBlockchain.addBlock({data : ["monisha sent sudeep 10 ETH"]});

for (let j = 2 ; j < darkGuildBlockchain.chain.length; j ++) {
    prevBlockTimeStamp = darkGuildBlockchain.chain[j- 1].timeStamp;
    nextBlockTimeStamp = darkGuildBlockchain.chain[j].timeStamp;
    timeDifference = nextBlockTimeStamp - prevBlockTimeStamp;
    timeStampDifferences.push(timeDifference);
}

avgTime = timeStampDifferences.reduce((total : number, num : number) => total + num) /timeStampDifferences.length;

console.log(avgTime / 1000, "seconds");

const updateBlockchain = async () => {
    const consumer = kafka.consumer({
        groupId : "miners1"
    })

    await consumer.connect();
    await consumer.subscribe({topic : "blockchain", fromBeginning : true});
    await consumer.run({
        eachMessage : async ({message}) => {
            console.log({ value : message.value?.toString() })
            darkGuildBlockchain.addBlock({ data : [JSON.stringify(message.value?.toString())]});
        }
    })
}

const verification = BlockChain.validationCheck(darkGuildBlockchain);

if (verification) {
    console.log(darkGuildBlockchain.chain)
    updateBlockchain();
}

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/api/blocks", (req, res) => {
    res.json(darkGuildBlockchain.chain);
})

app.listen(3033, () =>  {
    console.log(`Server runnng at port no 3030`)
})