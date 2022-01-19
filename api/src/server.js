import express from 'express';
import { Kafka, logLevel } from 'kafkajs';
import routes from './producer';

const app = express();

const kafka = new Kafka({
  clientId: 'api',
  brokers: ['kafka:9092'],
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'actors-group-receiver' });

app.use((req, res, next) => {
  req.producer = producer;

  return next();
});

app.use(routes);

async function run() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: 'actors-response' });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('Response:', String(message.value));
    },
  });

  app.listen(3001);
}

run().catch(console.error);
