import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { generateRandomNickname } from "@shared";
import { OAuth2Client } from "google-auth-library";
import type { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

export interface GoogleUserData {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
    this.googleClient = new OAuth2Client(clientId);
  }

  async validateGoogleUser(data: GoogleUserData): Promise<User> {
    const googleUser = await this.usersService.findByGoogleId(data.googleId);

    if (googleUser) {
      await this.usersService.updateProfile(googleUser.id, {
        profilePicture: data.picture,
      });
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

  generateJwtToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
