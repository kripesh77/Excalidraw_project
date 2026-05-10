import { Chat, Room, User } from "@repo/db";

export interface IRoomService {
  createRoom: (name: string, adminId: string) => Promise<Room>;
  getChats: (
    page: number,
    limit: number,
    roomId: number,
    user: User,
  ) => Promise<Chat[]>;
}
