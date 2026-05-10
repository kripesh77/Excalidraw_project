import { NextFunction, Request, Response } from "express";
import { catchAsync } from "./catchAsync.js";
import { AppError } from "../utils/appError.js";
import { prisma } from "@repo/db";
import { jwtUtil } from "../infrastructure/auth/jwt.service.js";

export const authenticate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Please login to access this resource", 401));
    }

    const decoded = await jwtUtil.verifyAccessTokenAsync(token);

    if (!decoded || !decoded.sub) {
      return next(new AppError("Please login to access this resource", 401));
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user) return next(new AppError("User doesn't exists", 404));

    req.user = user;

    next();
  },
);
