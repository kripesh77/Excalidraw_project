import { WebSocket } from "ws";
import { IncomingMessage } from "http";

import { SocketDeps } from "../types/socket.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { isUserVerifiedMember } from "../repositories/userRepository.js";

import { redisPublish, redisSubscribe } from "@repo/redis";
import { produceMessage } from "@repo/kafka";

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

async function joinRoom(
  user: IUser,
  slug: string,
  deps: SocketDeps,
): Promise<boolean> {
  if (!slug) return false;

  const isMember = await isUserVerifiedMember(deps.prisma, user.userId, slug);

  if (!isMember) {
    user.ws.send(
      JSON.stringify({
        type: "join_room_denied",
        slug,
        message: "Not a member",
      }),
    );
    return false;
  }

  addToRoom(user, slug);

  user.ws.send(
    JSON.stringify({
      type: "join_room_ack",
      slug,
      message: "Joined room successfully",
    }),
  );

  return true;
}

async function ensureInRoom(
  user: IUser,
  slug: string,
  deps: SocketDeps,
): Promise<boolean> {
  if (user.rooms.has(slug)) return true;

  const isMember = await isUserVerifiedMember(deps.prisma, user.userId, slug);
  if (!isMember) {
    user.ws.send(
      JSON.stringify({
        type: "join_room_denied",
        slug,
        message: "Not a member",
      }),
    );
    return false;
  }

  addToRoom(user, slug);
  return true;
}

type WsMessageType =
  | { type: "join_room"; slug: string }
  | { type: "leave_room"; slug: string }
  | { type: "draw_shape"; slug: string; shape: Shape }
  | { type: "delete_shapes"; slug: string; shapeIds: string[] };

type Point = { x: number; y: number };
type Shape =
  | {
      id: string;
      type: "rect";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      id: string;
      type: "ellipse";
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
    }
  | {
      id: string;
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | { id: string; type: "free"; points: Point[] };

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
      let parsed: WsMessageType;

      try {
        parsed = JSON.parse(data);
      } catch {
        ws.send(JSON.stringify({ message: "Invalid JSON payload" }));
        return;
      }

      const { type } = parsed;

      if (type === "join_room") {
        const { slug } = parsed;
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
        const { slug } = parsed;
        if (!slug) return;
        removeFromRoom(user, slug);
        ws.send(JSON.stringify({ type: "room_left_successfully" }));
        return;
      }

      if (type === "draw_shape") {
        const { slug, shape } = parsed;
        if (!slug || !shape?.id || !shape?.type) return;

        const allowed = await ensureInRoom(user, slug, deps);
        if (!allowed) return;

        const payload = JSON.stringify({
          type: "shape_drawn",
          slug,
          shape,
          senderId: id,
        });

        try {
          await Promise.all([
            redisPublish.publish(`room:${slug}`, payload),
            produceMessage({
              topic: "SHAPES",
              slug,
              senderId: id,
              action: "draw",
              shape,
            }),
          ]);
        } catch (error) {
          console.warn("draw_shape publish failed", {
            slug,
            userId: id,
            error,
          });
        }
        return;
      }

      if (type === "delete_shapes") {
        const { slug, shapeIds } = parsed;
        if (!slug || !Array.isArray(shapeIds) || shapeIds.length === 0) return;

        const allowed = await ensureInRoom(user, slug, deps);
        if (!allowed) return;

        const payload = JSON.stringify({
          type: "shapes_deleted",
          slug,
          shapeIds,
          senderId: id,
        });

        try {
          await Promise.all([
            redisPublish.publish(`room:${slug}`, payload),
            produceMessage({
              topic: "SHAPES",
              slug,
              senderId: id,
              action: "delete",
              shapeIds,
            }),
          ]);
        } catch (error) {
          console.warn("delete_shapes publish failed", {
            slug,
            userId: id,
            error,
          });
        }
        return;
      }
    });

    ws.send(JSON.stringify({ type: "connected" }));
  } catch (err) {
    try {
      console.warn("WS connection rejected", {
        url: req.url,
        remoteAddress: req.socket?.remoteAddress,
        error: (err as Error).message,
      });
    } catch {
      ws.close(1008, "Unauthorized");
    }
    ws.close(1008, "Unauthorized");
  }
}
