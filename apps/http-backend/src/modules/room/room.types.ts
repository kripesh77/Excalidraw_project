import { Room, RoomMember, Shape, User } from "@repo/db";

export interface IRoomService {
  createRoom: (name: string, adminId: string) => Promise<Room>;
  joinRoom: (user: User, slug: string) => Promise<RoomMember | void>;
  getJoinedRooms: (userId: string) => Promise<Room[]>;
  getShapes: (
    page: number,
    limit: number,
    slug: string,
    user: User,
  ) => Promise<Shape[]>;
}
