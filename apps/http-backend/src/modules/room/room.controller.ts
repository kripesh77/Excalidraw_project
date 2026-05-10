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

  joinRoom = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("User doesn't exist", 404));
      const slug = req.params.slug;
      if (!slug || Array.isArray(slug))
        return next(new AppError("Invalid roomId", 400));

      const data = await this.roomService.joinRoom(req.user, slug);

      res.json({ status: "success", data });
    },
  );

  getJoinedRooms = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("User doesn't exist", 404));
      const data = await this.roomService.getJoinedRooms(req.user.id);

      res.json({ status: "success", data });
    },
  );

  getRoomChats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("User doesn't exists", 404));
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const slug = req.params.slug;
      if (Array.isArray(slug) || !slug) {
        return next(new AppError("User doesn't exists", 404));
      }
      const chats = await this.roomService.getChats(
        page,
        limit,
        slug,
        req.user,
      );
      res.json({
        status: "success",
        data: chats,
      });
    },
  );
}
