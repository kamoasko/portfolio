import jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { TokenPayload, RefreshTokenPayload } from "../types";

export class AuthService {
  static generateAccessToken(
    userId: string,
    email: string,
    role: string,
  ): string {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiry(config.jwtExpiry),
    };

    return jwt.sign(payload, config.jwtSecret);
  }

  static generateRefreshToken(userId: string): string {
    const tokenId = `${userId}-${Date.now()}`;
    const payload: RefreshTokenPayload = {
      sub: userId,
      tokenId,
      iat: Math.floor(Date.now() / 1000),
      exp:
        Math.floor(Date.now() / 1000) +
        this.parseExpiry(config.refreshTokenExpiry),
    };

    return jwt.sign(payload, config.jwtRefreshSecret);
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
  }

  static generateTokenPair(userId: string, email: string, role: string) {
    return {
      accessToken: this.generateAccessToken(userId, email, role),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  private static parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case "s":
        return num;
      case "m":
        return num * 60;
      case "h":
        return num * 60 * 60;
      case "d":
        return num * 24 * 60 * 60;
      default:
        throw new Error(`Unknown expiry unit: ${unit}`);
    }
  }
}
