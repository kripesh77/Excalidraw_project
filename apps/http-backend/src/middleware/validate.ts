import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { treeifyError } from "@repo/validators/auth";

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body || {});
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          status: "fail",
          errors: treeifyError(error),
        });
      }
      next(error);
    }
  };
