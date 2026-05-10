import { Router } from "express";
import { roomController } from "./room.container.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { createRoomSchema } from "@repo/validators/room";
const router: Router = Router();

router.post(
  "/",
  validate(createRoomSchema),
  authenticate,
  roomController.createRoom,
);

router.get("/chats/:roomId", authenticate, roomController.getRoomChats);

export { router as roomRouter };
