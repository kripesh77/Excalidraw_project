import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { SocketDeps } from "../types/socket.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { isUserVerifiedMember } from "../repositories/userRepository.js";

interface IUser {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

const users: IUser[] = [];

function removeUser(ws: WebSocket) {
  const idx = users.findIndex((user) => user.ws === ws);
  if (idx !== -1) {
    users.splice(idx, 1);
  }
}

export async function handleConnection(
  ws: WebSocket,
  req: IncomingMessage,
  deps: SocketDeps,
) {
  try {
    const { id } = await authenticate(req, deps);

    console.log("Authenticated user:", id);

    users.push({ userId: id, rooms: [], ws });

    // Ensure cleanup on both expected and unexpected disconnects.
    ws.on("close", () => removeUser(ws));
    ws.on("error", () => removeUser(ws));

    ws.on("message", async (data: string) => {
      try {
        const parsedData = JSON.parse(data) as {
          type: string;
          slug?: string;
          message?: unknown;
        };

        console.log(parsedData);

        if (parsedData.type === "join_room") {
          const slug = parsedData.slug;
          if (!slug) {
            ws.send(JSON.stringify({ type: "join_room_denied" }));
            return;
          }

          const isMember = await isUserVerifiedMember(deps.prisma, id, slug);
          if (!isMember) {
            ws.send(
              JSON.stringify({
                type: "join_room_denied",
                slug,
                message: "Not a member",
              }),
            );
            return;
          }

          const user = users.find((x) => x.ws === ws);
          if (user && !user.rooms.includes(slug)) {
            user.rooms.push(slug);
          }
          ws.send(JSON.stringify({ type: "join_room_ack", slug }));
        }

        if (parsedData.type === "leave_room") {
          const slug = parsedData.slug;
          if (!slug) return;
          const user = users.find((x) => x.ws === ws);
          if (!user) return;
          user.rooms = user.rooms.filter((x) => x !== slug);
        }

        if (parsedData.type === "chat") {
          const slug = parsedData.slug;
          if (!slug) return;

          const user = users.find((x) => x.ws === ws);
          if (!user || !user.rooms.includes(slug)) return;

          const message = parsedData.message;

          await deps.prisma.chat.create({
            data: {
              slug,
              message: JSON.stringify(message),
              senderId: id,
            },
          });

          users.forEach((user) => {
            if (user.rooms.includes(slug)) {
              user.ws.send(
                JSON.stringify({
                  type: "chat",
                  message,
                  slug,
                }),
              );
            }
          });
        }
      } catch (e) {
        ws.send(JSON.stringify({ message: "Please send stringified data" }));
      }
    });

    ws.send(JSON.stringify({ type: "connected" }));
  } catch (err) {
    ws.close(1008, "Unauthorized");
  }
}
