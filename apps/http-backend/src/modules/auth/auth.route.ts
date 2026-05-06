import { Router } from "express";
import { authController } from "./auth.container.js";
import { validate } from "../../middleware/validate.js";
import { signInSchema, signUpSchema } from "@repo/validators/auth";

const router: Router = Router();

router.post("/signup", validate(signUpSchema), authController.signup);
router.get("/verify/:token", authController.verify);
router.post("/signin", validate(signInSchema), authController.signin);

export { router as authRouter };
