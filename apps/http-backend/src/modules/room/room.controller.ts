import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../middleware/catchAsync.js";
import { IRoomService } from "./room.types.js";
import { AppError } from "../../utils/appError.js";

export class RoomController {
  constructor(private readonly roomService: IRoomService) {}
  createRoom = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError("User doesn't exists", 404));
      }
      const room = await this.roomService.createRoom(
        req.body.roomName,
        req.user.id,
      );
      res.status(201).json({ status: "success", data: { room } });
    },
  );
}
