import { WebSocket } from "ws";
import { IncomingMessage } from "http";

import { SocketDeps } from "../types/socket.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { isUserVerifiedMember } from "../repositories/userRepository.js";

import { redisPublish, redisSubscribe } from "@repo/redis";

interface IUser {
  userId: string;
  rooms: Set<string>;
  ws: WebSocket;
}

const userMap = new Map<WebSocket, IUser>();
const roomMap = new Map<string, Set<IUser>>();

function addToRoom(user: IUser, room: string) {
  if (!roomMap.has(room)) roomMap.set(room, new Set());
  roomMap.get(room)!.add(user);
  user.rooms.add(room);
}

function removeFromRoom(user: IUser, room: string) {
  user.rooms.delete(room);
  const set = roomMap.get(room);
  if (!set) return;

  set.delete(user);
  if (set.size === 0) roomMap.delete(room);
}

redisSubscribe.psubscribe("room:*");

redisSubscribe.on("pmessage", (_pattern, channel, message) => {
  const room = channel.split(":")[1];
  const users = roomMap.get(room as string);

  if (!users) return;

  for (const user of users) {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(message);
    }
  }
});

function removeUser(ws: WebSocket) {
  const user = userMap.get(ws);
  if (!user) return;

  for (const room of user.rooms) {
    const set = roomMap.get(room);
    if (set) {
      set.delete(user);
      if (set.size === 0) roomMap.delete(room);
    }
  }

  userMap.delete(ws);
}

export async function handleConnection(
  ws: WebSocket,
  req: IncomingMessage,
  deps: SocketDeps,
) {
  try {
    const { id } = await authenticate(req, deps);

    const user: IUser = {
      userId: id,
      rooms: new Set(),
      ws,
    };

    userMap.set(ws, user);

    ws.on("close", () => removeUser(ws));
    ws.on("error", () => removeUser(ws));

    ws.on("message", async (data: string) => {
      let parsed: any;

      try {
        parsed = JSON.parse(data);
      } catch {
        ws.send(JSON.stringify({ message: "Invalid JSON payload" }));
        return;
      }

      const { type, slug, message } = parsed;

      if (type === "join_room") {
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

        addToRoom(user, slug);

        ws.send(JSON.stringify({ type: "join_room_ack", slug }));
        return;
      }

      if (type === "leave_room") {
        if (!slug) return;
        removeFromRoom(user, slug);
        return;
      }

      if (type === "chat") {
        if (!slug || !message) return;
        if (!user.rooms.has(slug)) return;

        await deps.prisma.chat.create({
          data: {
            slug,
            message: JSON.stringify(message),
            senderId: id,
          },
        });

        const payload = JSON.stringify({
          type: "chat",
          slug,
          message,
        });

        await redisPublish.publish(`room:${slug}`, payload);
      }
    });

    ws.send(JSON.stringify({ type: "connected" }));
  } catch (err) {
    // log auth/connect errors to help debug frequent reconnects in production
    try {
      console.warn("WS connection rejected", {
        url: req.url,
        remoteAddress: req.socket?.remoteAddress,
        error: (err as Error).message,
      });
    } catch {
      // ignore logging errors
    }
    ws.close(1008, "Unauthorized");
  }
}
