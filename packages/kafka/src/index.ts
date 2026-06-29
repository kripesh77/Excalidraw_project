import dotenv from "dotenv";
dotenv.config();

import { Kafka, type Producer } from "kafkajs";
import { prisma } from "@repo/db";
import { redisPublish } from "@repo/redis";

interface IMessageProp {
  message: String;
  id: string;
  slug: string;
  value?: string;
}

type Point = { x: number; y: number };
type Shape =
  | {
      id: string;
      type: "rect";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      id: string;
      type: "ellipse";
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
    }
  | {
      id: string;
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | { id: string; type: "free"; points: Point[] };

export type KafkaMessage =
  | {
      topic: "SHAPES";
      slug: string;
      senderId: string;
      action: "draw";
      shape: Shape;
    }
  | {
      topic: "SHAPES";
      slug: string;
      senderId: string;
      action: "delete";
      shapeIds: string[];
    };

const { KAFKA_HOST, KAFKA_PORT, KAFKA_USERNAME, KAFKA_PASSWORD } = process.env;

const ca = process.env.KAFKA_CA_B64
  ? Buffer.from(process.env.KAFKA_CA_B64, "base64").toString("utf-8")
  : undefined;

// This is the way to connect kafka through sasl
const kafka = new Kafka({
  brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`],
  ssl: {
    ca: ca ? [ca] : undefined,
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

export const produceMessage = async (msg: KafkaMessage) => {
  const producer = await createProducer();
  await producer.send({
    topic: msg.topic,
    messages: [
      {
        partition: 0,
        key: `${msg.topic}-${Date.now()}`,
        value: JSON.stringify(msg),
      },
    ],
  });
};

export const startShapeConsumer = async () => {
  console.log("Shape consumer is running");
  const consumer = kafka.consumer({ groupId: "shapes-group" });
  await consumer.connect();
  await consumer.subscribe({ topic: "SHAPES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    autoCommitInterval: 5,
    eachMessage: async ({ message: data, pause }) => {
      if (!data.value) return;

      const msg = JSON.parse(data.value.toString()) as
        | {
            topic: "SHAPES";
            action: "draw";
            slug: string;
            senderId: string;
            shape: Shape;
          }
        | {
            topic: "SHAPES";
            action: "delete";
            slug: string;
            senderId: string;
            shapeIds: string[];
          };

      try {
        if (msg.action === "draw") {
          await prisma.shape.upsert({
            where: { id: msg.shape.id },
            update: {
              data: msg.shape,
              type: msg.shape.type,
            },
            create: {
              id: msg.shape.id,
              type: msg.shape.type,
              data: msg.shape,
              slug: msg.slug,
              creatorId: msg.senderId,
            },
          });

          await redisPublish.publish(
            `room:${msg.slug}`,
            JSON.stringify({
              type: "shape_saved", // client can use this to confirm persistence
              slug: msg.slug,
              shapeId: msg.shape.id,
            }),
          );
        } else if (msg.action === "delete") {
          await prisma.shape.deleteMany({
            where: {
              id: { in: msg.shapeIds },
              slug: msg.slug, // preventing cross-room deletion
            },
          });

          await redisPublish.publish(
            `room:${msg.slug}`,
            JSON.stringify({
              type: "shapes_delete_confirmed",
              slug: msg.slug,
              shapeIds: msg.shapeIds,
            }),
          );
        }
      } catch (e) {
        console.error("Shape consumer error", e);
        pause();
        setTimeout(() => consumer.resume([{ topic: "SHAPES" }]), 60_000);
      }
    },
  });
};

export default kafka;
