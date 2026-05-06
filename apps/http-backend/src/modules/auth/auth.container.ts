import { JwtUtil } from "@repo/auth-utils";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { config } from "../../utils/jwtConfig.js";
import { BcryptPasswordService } from "../../infrastructure/security/password.service.js";
import { prisma } from "@repo/db";
import { UserService } from "../user/user.service.js";
import { eventBus } from "../../events/eventBus.js";
import { VerificationTokenService } from "../../infrastructure/security/verification-token.service.js";

const jwtUtil = new JwtUtil(config);

const bcryptPasswordService = new BcryptPasswordService();

const verificationTokenService = new VerificationTokenService();

const userService = new UserService(prisma);

const authService = new AuthService(
  jwtUtil,
  bcryptPasswordService,
  userService,
  eventBus,
  verificationTokenService,
);

const controller = new AuthController(authService);

export { controller as authController };
