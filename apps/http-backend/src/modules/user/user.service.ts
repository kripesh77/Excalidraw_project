import { PrismaClient } from "@repo/db";
import { SignUpDto } from "@repo/validators/auth";
import { IUserService } from "./user.types.js";
import { UserWhereUniqueInput } from "../../../../../packages/db/dist/generated/prisma/models.js";

export class UserService implements IUserService {
  constructor(private prisma: PrismaClient) {}

  async create(data: SignUpDto) {
    const user = await this.prisma.user.create({
      data,
    });
    return user;
  }

  private async _findUniqueSafe(where: UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where,
      omit: {
        password: true,
      },
    });
  }

  async findByEmail(email: string) {
    const user = await this._findUniqueSafe({ email });
    return user;
  }

  async findByVerificationTokenAndUpdate(hashedToken: string) {
    return this.prisma.user.update({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { gt: new Date() },
      },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      omit: {
        password: true,
      },
    });
  }

  async updateRefreshToken(id: string, hashedRefreshToken: string) {
    const user = this.prisma.user.update({
      where: { id },
      data: { refreshToken: hashedRefreshToken },
      select: { id: true },
    });
    return user;
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
