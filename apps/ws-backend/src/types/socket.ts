import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { PrismaClient } from "@repo/db";
import { ITokenService } from "@repo/auth-utils";

export interface SocketDeps {
  prisma: PrismaClient;
  jwtUtil: ITokenService;
}

export interface WSContext {
  ws: WebSocket;
  req: IncomingMessage;
  user?: {
    id: string;
  };
}
