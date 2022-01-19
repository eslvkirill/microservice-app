import { Kafka } from 'kafkajs';
import mongojs from 'mongojs';

const db = mongojs(process.env.MONGO_URL || 'mongodb://mongodb:27017/kafka');

const kafka = new Kafka({
  brokers: ['kafka:9092'],
  clientId: 'actors',
});

const topic = 'topic-actors';
const consumer = kafka.consumer({ groupId: 'actors-group' });

const producer = kafka.producer();

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);

      const payload = JSON.parse(message.value);

      db.collection('actors').insert(JSON.parse(message.value.toString()));

      producer.send({
        topic: 'actors-response',
        messages: [{ value: JSON.stringify(payload) }],
      });
    },
  });
}

run().catch(console.error);
