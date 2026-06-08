import { Kafka, type Producer } from "kafkajs";
import fs from "fs";
import dotenv from "dotenv";
import { prisma } from "@repo/db";
dotenv.config();

interface IMessageProp {
  message: String;
  id: string;
  slug: string;
  value?: string;
}

const { KAFKA_HOST, KAFKA_PORT, KAFKA_USERNAME, KAFKA_PASSWORD, CA } =
  process.env;

// This is the way to connect kafka through ssl
// const kafka = new Kafka({
//   clientId: "my-app",
//   brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`],
//   ssl: {
//     rejectUnauthorized: true,
//     ca: [fs.readFileSync("../kafka_credentials/ca.pem", "utf-8")],
//     key: fs.readFileSync("../kafka_credentials/service.key", "utf-8"),
//     cert: fs.readFileSync("../kafka_credentials/service.cert", "utf-8"),
//   },
// });

// This is the way to connect kafka through sasl
const kafka = new Kafka({
  brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`],
  ssl: {
    ca: [CA!],
  },
  sasl: {
    username: KAFKA_USERNAME as string,
    password: KAFKA_PASSWORD as string,
    mechanism: "plain",
  },
});

// caching the producer so that we won't create a new producer each time the producer is requested
let producer: Producer | null = null;

export const createProducer = async function () {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();

  producer = _producer;
  return producer;
};

export const produceMessage = async function (message: IMessageProp) {
  const producer = await createProducer();
  await producer.send({
    messages: [
      {
        partition: 0,
        key: `message-${Date.now()}`,
        value: JSON.stringify(message),
      },
    ],
    topic: "MESSAGES",
  });
};

export const startMessageConsumer = async function () {
  console.log("Consumer is running");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({
    topic: "MESSAGES",
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: true,
    autoCommitInterval: 5,
    eachMessage: async ({ message: data, pause }) => {
      console.log("New message received");
      if (!data.value) return;
      const { slug, message, id } = JSON.parse(
        data.value?.toString(),
      ) as unknown as IMessageProp;
      try {
        await prisma.chat.create({
          data: {
            slug,
            message: JSON.stringify(message),
            senderId: id,
          },
        });
      } catch (e) {
        console.log("Something went wrong");
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
};

export default kafka;
