import * as z from "zod";

export const createRoomSchema = z
  .object({
    roomName: z
      .string("roomName is required to create a room")
      .min(3, "roomName should be atleast 3 char long")
      .max(100, "roomName should be atmost 100 char long"),
  })
  .strip();

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
