import { Router } from "express";
import { authController } from "./auth.container.js";
import { validate } from "../../middleware/validate.js";
import { signInSchema, signUpSchema } from "@repo/validators/auth";
import { verifyRefreshToken } from "../../middleware/verifyRefreshToken.js";

const router: Router = Router();

router.post("/signup", validate(signUpSchema), authController.signup);
router.post("/signin", validate(signInSchema), authController.signin);
router.get("/verify/:token", authController.verify);
router.post("/refresh", verifyRefreshToken, authController.refresh);

export { router as authRouter };
