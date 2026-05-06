import dotenv from "dotenv";
dotenv.config();

import { WebSocketServer } from "ws";
import { SocketService } from "./services/socketService.js";
import { prisma } from "@repo/db";
import { JwtUtil } from "@repo/auth-utils";
import { config } from "./utils/jwtConfig.js";

const wss = new WebSocketServer({ port: 8080 });

const jwtUtil = new JwtUtil(config);

const socketService = new SocketService({
  wss,
  prisma,
  jwtUtil,
});

socketService.init();
