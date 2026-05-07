import { prisma } from "@repo/db";
import { RoomService } from "./room.service.js";
import { RoomController } from "./room.controller.js";

const roomService = new RoomService(prisma);

const roomController = new RoomController(roomService);

export { roomController };
