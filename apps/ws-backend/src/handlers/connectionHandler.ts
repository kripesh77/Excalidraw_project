import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { SocketDeps } from "../types/socket.js";
import { authenticate } from "../middlewares/authMiddleware.js";

export async function handleConnection(
  ws: WebSocket,
  req: IncomingMessage,
  deps: SocketDeps,
) {
  try {
    const user = await authenticate(req, deps);

    console.log("Authenticated user:", user.id);

    ws.on("message", (data: Buffer) => {
      const message = data.toString();
      console.log("Incoming:", message);
    });
  } catch (err) {
    ws.close(1008, "Unauthorized");
  }
}
