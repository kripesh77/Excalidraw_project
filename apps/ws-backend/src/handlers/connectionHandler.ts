import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { SocketDeps } from "../types/socket.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { prisma } from "@repo/db";

interface IUser {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

const users: IUser[] = [];

export async function handleConnection(
  ws: WebSocket,
  req: IncomingMessage,
  deps: SocketDeps,
) {
  try {
    const user = await authenticate(req, deps);

    console.log("Authenticated user:", user.id);

    users.push({ userId: user.id, rooms: [], ws });

    ws.on("message", async (data: string) => {
      try {
        const parsedData = JSON.parse(data) as {
          type: string;
          roomId: string;
          message: string;
        };

        if (parsedData.type === "join_room") {
          console.log(parsedData);
          const user = users.find((x) => x.ws === ws);
          user?.rooms.push(parsedData.roomId);
          ws.send(
            JSON.stringify({ message: `joined the room ${parsedData.roomId}` }),
          );
        }

        if (parsedData.type === "leave_room") {
          const user = users.find((x) => x.ws === ws);
          if (!user) return;
          user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
        }

        if (parsedData.type === "chat") {
          const roomId = parsedData.roomId;
          const message = parsedData.message;

          await prisma.chat.create({
            data: {
              roomId: +roomId,
              message,
              senderId: user.id,
            },
          });

          users.forEach((user) => {
            if (user.rooms.includes(roomId)) {
              user.ws.send(JSON.stringify({ type: "chat", message, roomId }));
            }
          });
        }
      } catch (e) {
        ws.send(JSON.stringify({ message: "Please send stringified data" }));
      }
    });
  } catch (err) {
    ws.close(1008, "Unauthorized");
  }
}
