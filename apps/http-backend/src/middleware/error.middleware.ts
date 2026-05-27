import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { Prisma } from "@repo/db";

const handlePrismaDuplicate = (
  err: Prisma.PrismaClientKnownRequestError,
): AppError => {
  const cause = (err.meta as any)?.driverAdapterError?.cause;
  const fields: string[] = Array.isArray(cause?.constraint?.fields)
    ? cause.constraint.fields
    : [];

  return new AppError(
    fields.length
      ? `Duplicate field value: ${fields.join(", ")}`
      : "Duplicate field value",
    409,
  );
};

const handlePrismaValidation = (): AppError =>
  new AppError("Invalid input data", 400);

const sendErrorDev = (err: AppError, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("ERROR 💥", err);

  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error: AppError =
    err instanceof AppError
      ? err
      : new AppError("Something went very wrong!", 500);

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    error = handlePrismaDuplicate(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = handlePrismaValidation();
  } else if (err instanceof jwt.TokenExpiredError) {
    error = new AppError("Token expired, please login again", 401);
  } else if (err instanceof jwt.JsonWebTokenError) {
    error = new AppError("Invalid token, please login again", 401);
  }

  if (process.env.NODE_ENV === "development") return sendErrorDev(error, res);
  return sendErrorProd(error, res);
};
