import { User } from "@repo/db";
import { SignUpDto } from "@repo/validators/auth";
import {
  UserOmit,
  UserWhereUniqueInput,
} from "../../../../../packages/db/dist/generated/prisma/models.js";

export interface IFindUnique {
  where: UserWhereUniqueInput;
  omit?: UserOmit;
}

export interface IUserService {
  create(signUpDto: SignUpDto): Promise<User>;
  findByEmail(email: string): Promise<Omit<User, "password"> | null>;
  updateRefreshToken(
    id: string,
    hashedRefreshToken: string,
  ): Promise<Partial<User | "id">>;
  findByVerificationTokenAndUpdate(
    hashedToken: string,
  ): Promise<Omit<User, "password"> | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
}
