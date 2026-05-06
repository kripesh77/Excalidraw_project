// src/config/jwt.config.ts
import { JwtUtil } from "@repo/auth-utils";
import { config } from "../../utils/jwtConfig.js";

export const jwtUtil = new JwtUtil(config);
