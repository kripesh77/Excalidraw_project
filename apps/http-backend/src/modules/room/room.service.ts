import { PrismaClient, User } from "@repo/db";
import { IRoomService } from "./room.types.js";
import slugify from "slugify";

export class RoomService implements IRoomService {
  constructor(private readonly prisma: PrismaClient) {}
  async createRoom(name: string, adminId: string) {
    const slug = `${slugify(name, {
      lower: true,
      strict: true,
    })}-${Math.random().toString(36).slice(2, 6)}`;
    return this.prisma.room.create({ data: { slug, adminId } });
  }

  async getChats(page: number, limit: number, roomId: number, user: User) {
    return this.prisma.chat.findMany({
      where: { roomId },
      orderBy: { id: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
