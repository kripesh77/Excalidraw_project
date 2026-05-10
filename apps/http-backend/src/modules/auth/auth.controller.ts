import { NextFunction, Request, Response } from "express";
import { IAuthService } from "./auth.types.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { AppError } from "../../utils/appError.js";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}
  signup = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = await this.authService.signup(req.body);
      res.status(201).json({
        status: "success",
        data,
      });
    },
  );

  signin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await this.authService.signin(req.body);
      res.status(200).json({
        status: "success",
        data: user,
      });
    },
  );

  verify = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.params.token;
      if (!token || Array.isArray(token)) {
        return next(new AppError("Verification token is not provided", 400));
      }
      const user = await this.authService.verify(token);

      if (!user) {
        return next(new AppError("User doesn't exists", 404));
      }
      res.status(200).json({
        status: "success",
        data: user,
      });
    },
  );

  refresh = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError("Invalid token", 401));
      }
      const accessToken = await this.authService.refresh(req.user);

      res.status(200).json({
        status: "success",
        data: { accessToken },
      });
    },
  );
}
