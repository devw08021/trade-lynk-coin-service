import { Kafka } from 'kafkajs';

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const KAFKA_DEPOSIT_TOPIC = process.env.KAFKA_DEPOSIT_TOPIC || 'deposit-events';

const kafka = new Kafka({
  clientId: 'eth-server',
  brokers: [KAFKA_BROKER],
});

const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
}

export async function sendDepositEvent(event: any) {
  await producer.send({
    topic: KAFKA_DEPOSIT_TOPIC,
    messages: [
      { value: JSON.stringify(event) },
    ],
  });
} 