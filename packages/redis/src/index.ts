import dotenv from "dotenv";
dotenv.config();
import { Redis } from "ioredis";

const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;

const config = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false,
  },
};

export const redisSubscribe = new Redis(config);
export const redisPublish = new Redis(config);
