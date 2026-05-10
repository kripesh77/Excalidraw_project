import { IncomingMessage } from "http";
import { SocketDeps } from "../types/socket.js";
import { isUserVerifiedMember } from "../repositories/userRepository.js";

export async function authenticate(
  req: IncomingMessage,
  { jwtUtil, prisma }: SocketDeps,
) {
  if (!req.url) throw new Error("Unauthorized");

  const fullUrl = new URL(req.url, `http://${req.headers.host}`);
  const token = fullUrl.searchParams.get("token");
  const slug = fullUrl.searchParams.get("slug");

  if (!slug) throw new Error("Unauthorized");

  if (!token) throw new Error("Unauthorized");

  const decoded = await jwtUtil.verifyAccessTokenAsync(token);

  if (!decoded?.sub) throw new Error("Unauthorized");

  const user = await isUserVerifiedMember(prisma, decoded.sub, slug);

  if (!user) throw new Error("User not found");

  return {
    id: user.id,
    slug,
  };
}
