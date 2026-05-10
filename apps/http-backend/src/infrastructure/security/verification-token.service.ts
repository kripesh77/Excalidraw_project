import crypto from "crypto";

export interface IVerificationTokenService {
  generate(): { rawToken: string; hashedToken: string; expiresAt: Date };
  hashToken(id: string): string;
}

export class VerificationTokenService implements IVerificationTokenService {
  generate() {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    return { rawToken, hashedToken, expiresAt };
  }

  hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

export const verificationTokenService = new VerificationTokenService();
