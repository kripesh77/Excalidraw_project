import dotenv from "dotenv";
dotenv.config();
import { Redis } from "ioredis";

const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;
const REDIS_KEEPALIVE_INTERVAL_MS = 30000;

const config = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false,
  },
};

function createManagedRedisClient(name: string) {
  const client = new Redis({
    ...config,
    keepAlive: 60000,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      return Math.min(times * 1000, 10000);
    },
  });

  let heartbeat: NodeJS.Timeout | null = null;

  const stopHeartbeat = () => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeat = setInterval(() => {
      if (client.status === "ready") {
        client.ping().catch((error: unknown) => {
          console.warn(`Redis ${name} ping failed`, error);
        });
      }
    }, REDIS_KEEPALIVE_INTERVAL_MS);
  };

  client.on("connect", () => {
    console.info(`Redis ${name} connected`);
  });
  client.on("ready", startHeartbeat);
  client.on("close", () => {
    console.warn(`Redis ${name} connection closed`);
    stopHeartbeat();
  });
  client.on("reconnecting", (delay: number) => {
    console.warn(`Redis ${name} reconnecting in ${delay}ms`);
  });
  client.on("end", () => {
    console.warn(`Redis ${name} connection ended`);
    stopHeartbeat();
  });
  client.on("error", (error) => {
    console.warn(`Redis ${name} error`, error);
  });

  return client;
}

export const redisSubscribe = createManagedRedisClient("subscribe");
export const redisPublish = createManagedRedisClient("publish");
