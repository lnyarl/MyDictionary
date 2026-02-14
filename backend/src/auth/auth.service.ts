import * as crypto from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { generateRandomNickname } from "@stashy/shared";
import { UserJwtPayload } from "@stashy/shared/dto/auth/type";
import { RefreshTokens, Users } from "@stashy/shared/types/db_entity.generated";
import { OAuth2Client } from "google-auth-library";
import { UsersService } from "../users/users.service";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository";

export type GoogleUserData = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {
    const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
    this.googleClient = new OAuth2Client(clientId);
  }

  async validateGoogleUser(data: GoogleUserData): Promise<Users> {
    const googleUser = await this.usersService.findByGoogleId(data.googleId);

    if (googleUser) {
      if (!googleUser.profilePicture) {
        await this.usersService.updateProfile(googleUser.id, {
          profilePicture: data.picture,
        });
      }
      return await this.usersService.findById(googleUser.id);
    }

    const nickname = generateRandomNickname();

    const newUser = await this.usersService.create({
      googleId: data.googleId,
      email: data.email,
      nickname,
      profilePicture: data.picture,
    });

    return newUser;
  }

  async verifyGoogleToken(token: string): Promise<GoogleUserData> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>("GOOGLE_CLIENT_ID"),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException("Invalid Google token");
      }

      return {
        googleId: payload.sub,
        email: payload.email || "",
        name: payload.name || "",
        picture: payload.picture,
      };
    } catch (_error) {
      throw new UnauthorizedException("Failed to verify Google token");
    }
  }

  generateJwtToken(user: Users): string {
    const payload: UserJwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  async generateTokenPair(user: Users, fromAdmin = false): Promise<TokenPair> {
    const accessToken = this.generateJwtToken(user);
    const refreshToken = await this.createRefreshToken(user.id, fromAdmin);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async createRefreshToken(userId: string, fromAdmin = false): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");

    let expiresAt: Date;
    if (fromAdmin) {
      expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    } else {
      const refreshExpiresIn = this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "30d";
      const expiresInMs = this.parseExpiresIn(refreshExpiresIn);
      expiresAt = new Date(Date.now() + expiresInMs);
    }

    await this.refreshTokenRepository.create(userId, token, expiresAt, fromAdmin);

    return token;
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number.parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[unit] || multipliers.d);
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: Users }> {
    const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.usersService.findById(storedToken.userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const accessToken = this.generateJwtToken(user);

    const newRefreshToken = await this.rotateRefreshToken(storedToken);

    return { accessToken, refreshToken: newRefreshToken, user };
  }

  private async rotateRefreshToken(storedToken: RefreshTokens): Promise<string> {
    await this.refreshTokenRepository.deleteById(storedToken.id);

    const newToken = crypto.randomBytes(32).toString("hex");

    if (storedToken.fromAdmin) {
      await this.refreshTokenRepository.create(
        storedToken.userId,
        newToken,
        storedToken.expiresAt,
        true,
      );
      return newToken;
    }

    const extensionThresholdDays =
      this.configService.get<number>("REFRESH_TOKEN_EXTENSION_THRESHOLD_DAYS") || 3;
    const extensionThresholdMs = extensionThresholdDays * 24 * 60 * 60 * 1000;

    const now = new Date();
    const timeUntilExpiry = storedToken.expiresAt.getTime() - now.getTime();

    const refreshExpiresIn = this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "30d";
    const defaultExpiresInMs = this.parseExpiresIn(refreshExpiresIn);

    let newExpiresAt: Date;
    if (timeUntilExpiry <= extensionThresholdMs) {
      newExpiresAt = new Date(now.getTime() + defaultExpiresInMs);
    } else {
      newExpiresAt = storedToken.expiresAt;
    }

    await this.refreshTokenRepository.create(storedToken.userId, newToken, newExpiresAt, false);

    return newToken;
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);
  }

  verifyJwtToken(token: string): UserJwtPayload | null {
    try {
      return this.jwtService.verify<UserJwtPayload>(token);
    } catch {
      return null;
    }
  }

  async findUserById(userId: string): Promise<Users | null> {
    return this.usersService.findById(userId);
  }
}
