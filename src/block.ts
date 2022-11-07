class Block {

    timeStamp : number;
    prevBlockHash : string;
    currentBlockHash : string;
    data: string;

    constructor (timeStamp : number, prevBlockHash : string, currentBlockHash: string, data: string){
       this.timeStamp = timeStamp;
       this.prevBlockHash = prevBlockHash;
       this.currentBlockHash = currentBlockHash;
       this.data = data;
    }
}
for (let number : number = 0; number < 10; number = number + 1 ) {
    const firstBlock = new Block(number, "0xabcfrs46483477rfhdcgdjgcj", "0xcdfsugdiiwt53442gghdi", "sudeep sent 1 million usd");
    const secondBlock = new Block(number + 1, `${firstBlock.currentBlockHash}`, "0xdshjdjgjdk", "Tanmaya with saketh")
    console.log(firstBlock);
    console.log(secondBlock);
}

