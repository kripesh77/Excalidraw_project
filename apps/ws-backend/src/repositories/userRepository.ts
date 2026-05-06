import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@repo/db";

export async function getUserById(prisma: PrismaClient, userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}
