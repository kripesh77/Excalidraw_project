import { PrismaClient, User } from "@repo/db";
import { IRoomService } from "./room.types.js";
import slugify from "slugify";
import { AppError } from "../../utils/appError.js";

export class RoomService implements IRoomService {
  constructor(private readonly prisma: PrismaClient) {}
  async createRoom(name: string, adminId: string) {
    const slug = `${slugify(name, {
      lower: true,
      strict: true,
    })}-${Math.random().toString(36).slice(2, 6)}`;
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          slug,
        },
      });

      await tx.roomMember.create({
        data: {
          userId: adminId,
          roomId: room.id,
          role: "ADMIN",
        },
      });

      return room;
    });
  }

  async joinRoom(user: User, slug: string) {
    try {
      return await this.prisma.roomMember.create({
        data: {
          role: "MEMBER",
          user: {
            connect: {
              id: user.id,
            },
          },

          room: {
            connect: {
              slug,
            },
          },
        },
      });
    } catch (error) {
      const prismaError = error as { code?: string };

      // Duplicate membership
      if (prismaError.code === "P2002") {
        throw new AppError("Already joined this room", 400);
      }

      // Room slug does not exist
      if (prismaError.code === "P2025") {
        throw new AppError("Room not found", 404);
      }

      throw error;
    }
  }

  async getJoinedRooms(userId: string) {
    return this.prisma.room.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }

  async getChats(page: number, limit: number, slug: string, user: User) {
    return this.prisma.chat.findMany({
      where: {
        slug,
        room: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
