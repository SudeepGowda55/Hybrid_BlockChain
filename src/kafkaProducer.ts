import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId : "node1",
    brokers : ['34.67.215.248:9092']
})

const publishData = async () =>  {
    const producer = kafka.producer();

    await producer.connect();
    await producer.send({
        topic : 'blockchain',
        messages : [
            {value : "0x123dDFF223gdj6ge663ggh sent 15 ETH to 0x9cdf35jnfbha7gf8ddDDF"}
        ]
    });
}

publishData();