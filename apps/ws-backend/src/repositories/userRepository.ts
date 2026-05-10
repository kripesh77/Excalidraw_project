import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@repo/db";

export async function isUserVerifiedMember(
  prisma: PrismaClient,
  userId: string,
  slug: string,
) {
  return await prisma.user.findFirst({
    where: {
      id: userId,
      isEmailVerified: true,
      memberships: {
        some: {
          room: {
            slug,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });
}
