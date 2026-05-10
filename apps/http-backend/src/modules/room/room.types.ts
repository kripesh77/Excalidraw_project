import { Chat, Room, RoomMember, User } from "@repo/db";

export interface IRoomService {
  createRoom: (name: string, adminId: string) => Promise<Room>;
  joinRoom: (user: User, slug: string) => Promise<RoomMember | void>;
  getJoinedRooms: (userId: string) => Promise<Room[]>;
  getChats: (
    page: number,
    limit: number,
    slug: string,
    user: User,
  ) => Promise<Chat[]>;
}
