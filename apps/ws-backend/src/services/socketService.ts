import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { SocketDeps } from "../types/socket.js";
import { handleConnection } from "../handlers/connectionHandler.js";

interface SocketServiceDeps extends SocketDeps {
  wss: WebSocketServer;
}

export class SocketService {
  constructor(private readonly deps: SocketServiceDeps) {}

  public init() {
    this.deps.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      handleConnection(ws, req, this.deps);
    });
  }
}
