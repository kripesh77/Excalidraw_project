import { IncomingMessage } from "http";
import { SocketDeps } from "../types/socket.js";
import { isUserVerified } from "../repositories/userRepository.js";

export async function authenticate(
  req: IncomingMessage,
  { jwtUtil, prisma }: SocketDeps,
) {
  if (!req.url) throw new Error("Unauthorized");

  const fullUrl = new URL(req.url, `http://${req.headers.host}`);
  const token = fullUrl.searchParams.get("token");
  if (!token) throw new Error("Unauthorized");

  const decoded = await jwtUtil.verifyAccessTokenAsync(token);

  if (!decoded?.sub) throw new Error("Unauthorized");

  const user = await isUserVerified(prisma, decoded.sub);

  if (!user) throw new Error("User not found");

  return {
    id: user.id,
  };
}
