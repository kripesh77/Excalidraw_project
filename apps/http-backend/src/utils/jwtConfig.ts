import dotenv from "dotenv";
dotenv.config();
export const config = {
  accessTokenSecret: process.env.accessTokenSecret!,
  refreshTokenSecret: process.env.refreshTokenSecret!,
  accessExpiry: process.env.accessExpiry!,
  refreshExpiry: process.env.refreshExpiry!,
};
