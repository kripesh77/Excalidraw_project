import { NextFunction, Request, Response } from "express";
import { catchAsync } from "./catchAsync.js";
import { prisma } from "@repo/db";
import { AppError } from "../utils/appError.js";
import { jwtUtil } from "../infrastructure/auth/jwt.service.js";
import { verificationTokenService } from "../infrastructure/security/verification-token.service.js";

export const verifyRefreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let refreshToken;
    const authorization = req.headers["authorization"];

    if (authorization && authorization.startsWith("Bearer")) {
      refreshToken = authorization.split(" ")[1];
    }

    if (!refreshToken) {
      return next(new AppError("Invalid token", 401));
    }

    const decoded = await jwtUtil.verifyRefreshTokenAsync(refreshToken);

    if (!decoded || !decoded.sub) {
      return next(new AppError("Invalid token", 401));
    }

    const hashedRefreshToken = verificationTokenService.hashToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub, refreshToken: hashedRefreshToken },
    });

    if (!user) {
      return next(new AppError("Invalid token", 401));
    }

    req.user = user;
    next();
  },
);
