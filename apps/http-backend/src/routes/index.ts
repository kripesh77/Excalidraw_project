import express, { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";
import { roomRouter } from "../modules/room/room.route.js";
const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/room", roomRouter);

export { router };
