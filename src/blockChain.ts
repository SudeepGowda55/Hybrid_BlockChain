import *  as crypto from 'crypto';

const hashing = (...blockDetails : any)  => {
    return crypto.createHash('sha256').update(blockDetails.sort().join()).digest('hex');
}

class Block {

    timeStamp : number;
    prevBlockHash : string;
    currentBlockHash : string;
    data: string;

    constructor ( object : {timestamp : number, prevBlockHash : string, currentBlockHash : string, data : string}){
       this.timeStamp = object.timestamp;
       this.prevBlockHash = object.prevBlockHash;
       this.currentBlockHash = object.currentBlockHash;
       this.data = object.data;
    }

    static genesis() : Block {
        return new Block({timestamp: 1668181324864, prevBlockHash : '0x0000000000000000000000000000000000000000000000000000000000000000 ', currentBlockHash: 'e717166e335add1e3831a7a8fce006660067eca119108cc62122722e2feaaadc', data : "Genesis Block Created"})
    }

    static creatingBlock(miningData : {prevBlock : Block, data : string}) {
        const timeStamps : number = Date.now();
        const prevBlockHash : string = miningData.prevBlock.currentBlockHash;
        return new this({timestamp : timeStamps, prevBlockHash : prevBlockHash, currentBlockHash: hashing(timeStamps, prevBlockHash, miningData.data), data : miningData.data})
    }
}

const genesisBlock : Block = Block.genesis();


class BlockChain {
    chain : Block[];

    constructor () {
        this.chain = [genesisBlock]
    }

    addBlock(blockChainObject : {data : string}) {
        const newBlock : Block = Block.creatingBlock({prevBlock : this.chain[(this.chain.length)-1], data : blockChainObject.data});
        this.chain.push(newBlock);
    }

    static validationCheck (chainLink : Block[])  {
        if (JSON.stringify(chainLink[0]) != JSON.stringify(Block.genesis())) {
            console.log(false)
        }

        for (let i : number = 1; i < chainLink.length; i ++ ){
            const {currentBlockHash, prevBlockHash, data, timeStamp} = chainLink[i];
            const lastBlockHash = chainLink[i - 1].currentBlockHash;
            if (prevBlockHash !== lastBlockHash) return false;
        }
    }
}

const newBlockchain : any = new  BlockChain();

const blof = BlockChain.validationCheck(newBlockchain)
newBlockchain.addBlock({data: "Sudeep Sent 1 million USD"});
newBlockchain.addBlock({data : "m sudeep"});
newBlockchain.addBlock({data : " sudeep"});

console.log(newBlockchain);
