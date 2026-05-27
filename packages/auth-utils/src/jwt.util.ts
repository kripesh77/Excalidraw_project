import jwt, {
  SignOptions,
  VerifyOptions,
  JwtPayload,
  Secret,
} from "jsonwebtoken";
import { promisify } from "util";
import type { StringValue } from "ms";

/**
 * Promisified helpers
 */
const signAsync = promisify(jwt.sign) as unknown as (
  payload: string | object | Buffer,
  secret: Secret,
  options?: SignOptions,
) => Promise<string>;

const verifyAsync = promisify(jwt.verify) as unknown as (
  token: string,
  secret: Secret,
  options?: VerifyOptions,
) => Promise<string | JwtPayload>;

export interface JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret?: string;
  accessTokenExpiry?: StringValue | number;
  refreshTokenExpiry?: StringValue | number;
}

export interface TokenPayload extends JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

export interface ITokenService {
  signAccessToken(payload: TokenPayload, options?: SignOptions): string;
  signRefreshToken(payload: TokenPayload, options?: SignOptions): string;
  verifyAccessToken<T extends TokenPayload>(
    token: string,
    options?: VerifyOptions,
  ): T;
  verifyRefreshToken<T extends TokenPayload>(
    token: string,
    options?: VerifyOptions,
  ): T;

  signAccessTokenAsync(
    payload: TokenPayload,
    options?: SignOptions,
  ): Promise<string>;
  signRefreshTokenAsync(
    payload: TokenPayload,
    options?: SignOptions,
  ): Promise<string>;
  verifyAccessTokenAsync<T extends TokenPayload>(
    token: string,
    options?: VerifyOptions,
  ): Promise<T>;
  verifyRefreshTokenAsync<T extends TokenPayload>(
    token: string,
    options?: VerifyOptions,
  ): Promise<T>;
}

export class JwtUtil implements ITokenService {
  private accessSecret: string;
  private refreshSecret?: string;
  private accessExpiry: StringValue | number;
  private refreshExpiry: StringValue | number;

  constructor(config: JwtConfig) {
    if (!config.accessTokenSecret) {
      throw new Error("Access token secret is required");
    }

    this.accessSecret = config.accessTokenSecret;
    this.refreshSecret = config.refreshTokenSecret;

    this.accessExpiry = config.accessTokenExpiry || "15m";
    this.refreshExpiry = config.refreshTokenExpiry || "7d";
  }

  /**
   * Sign Access Token
   */
  signAccessToken(payload: TokenPayload, options?: SignOptions): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiry,
      ...options,
    });
  }

  /**
   * Sign Refresh Token
   */
  signRefreshToken(payload: TokenPayload, options?: SignOptions): string {
    if (!this.refreshSecret) {
      throw new Error("Refresh token secret is not configured");
    }

    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
      ...options,
    });
  }

  /**
   * Verify Access Token
   */
  verifyAccessToken<T extends TokenPayload>(
    token: string,
    options?: VerifyOptions,
  ): T {
    return jwt.verify(token, this.accessSecret, options) as T;
  }

  /**
   * Verify Refresh Token
   */
  verifyRefreshToken<T extends TokenPayload>(
    token: string,
    options?: VerifyOptions,
  ): T {
    if (!this.refreshSecret) {
      throw new Error("Refresh token secret is not configured");
    }

    return jwt.verify(token, this.refreshSecret, options) as T;
  }

  /**
   * Async: Sign Access Token
   */
  async signAccessTokenAsync(
    payload: TokenPayload,
    options?: SignOptions,
  ): Promise<string> {
    return signAsync(payload, this.accessSecret, {
      expiresIn: this.accessExpiry,
      ...options,
    });
  }

  /**
   * Async: Sign Refresh Token
   */
  async signRefreshTokenAsync(
    payload: TokenPayload,
    options?: SignOptions,
  ): Promise<string> {
    if (!this.refreshSecret) {
      throw new Error("Refresh token secret is not configured");
    }

    return signAsync(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
      ...options,
    });
  }

  /**
   * Async: Verify Access Token
   */
  async verifyAccessTokenAsync<T extends TokenPayload>(
    token: string,
    options?: VerifyOptions,
  ): Promise<T> {
    const decoded = await verifyAsync(token, this.accessSecret, options);

    if (typeof decoded === "string") {
      throw new Error("Invalid token payload");
    }

    return decoded as T;
  }

  /**
   * Async: Verify Refresh Token
   */
  async verifyRefreshTokenAsync<T extends TokenPayload>(
    token: string,
    options?: VerifyOptions,
  ): Promise<T> {
    if (!this.refreshSecret) {
      throw new Error("Refresh token secret is not configured");
    }

    const decoded = await verifyAsync(token, this.refreshSecret, options);

    if (typeof decoded === "string") {
      throw new Error("Invalid token payload");
    }

    return decoded as T;
  }
}
