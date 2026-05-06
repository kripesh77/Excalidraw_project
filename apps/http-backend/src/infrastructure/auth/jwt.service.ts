// src/config/jwt.config.ts
import dotenv from "dotenv";
dotenv.config();

import { JwtUtil } from "@repo/auth-utils";

const config = {
  accessTokenSecret: process.env.accessTokenSecret!,
  refreshTokenSecret: process.env.refreshTokenSecret!,
  accessExpiry: process.env.accessExpiry!,
  refreshExpiry: process.env.refreshExpiry!,
};

export const jwtUtil = new JwtUtil(config);
