import { User } from "@repo/db";
import { SignInDto, SignUpDto } from "@repo/validators/auth";
import { NextFunction } from "express";

export interface IAuthService {
  signup(
    bodyDto: SignUpDto,
  ): Promise<{ user: Omit<User, "password" | "refreshToken"> }>;
  verify(id: string): Promise<{
    user: Omit<User, "password" | "refreshToken">;
    accessToken: string;
    refreshToken: string;
  } | null>;
  signin(bodyDto: SignInDto): Promise<{
    user: Omit<User, "password" | "refreshToken">;
    accessToken: string;
    refreshToken: string;
  } | null>;
  refresh(userDto: User): Promise<string>;
}
