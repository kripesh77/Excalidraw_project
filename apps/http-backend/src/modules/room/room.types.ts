import { Room } from "@repo/db";

export interface IRoomService {
  createRoom: (name: string, adminId: string) => Promise<Room>;
}
