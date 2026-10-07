import dotenv from "dotenv";
dotenv.config();

import { WebSocketServer } from "ws";
import { SocketService } from "./services/socketService.js";
import { prisma } from "@repo/db";
import { JwtUtil } from "@repo/auth-utils";
import { config } from "./utils/jwtConfig.js";
import { startShapeConsumer } from "@repo/kafka";

function init() {
  startShapeConsumer();
  const wss = new WebSocketServer({
    port: Number(process.env.WS_PORT) || 8081,
  });

  const jwtUtil = new JwtUtil(config);

  const socketService = new SocketService({
    wss,
    prisma,
    jwtUtil,
  });

  socketService.init();
}

init();
