import express, { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";
const router: Router = express.Router();

router.use("/auth", authRouter);

export { router };
