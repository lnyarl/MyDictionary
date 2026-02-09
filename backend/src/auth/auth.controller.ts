import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { GoogleLoginDto } from "@stashy/shared/dto/auth/google-login.dto";
import type { CookieOptions, Request, Response } from "express";
import { Public } from "../common/decorators/public.decorator";
import { EventEmitterService } from "../common/events";
import { forbidden } from "../common/exceptions/business.exception";
import { LoginStreaksService } from "../login-streaks";
import type { User } from "../users/entities/user.entity";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitterService,
    private readonly loginStreaksService: LoginStreaksService,
  ) {}

  private getCookieOptions(maxAge: number): CookieOptions {
    const isDevelopment = this.configService.get("NODE_ENV") !== "production";
    return {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : "none",
      maxAge,
      path: "/",
    };
  }

  @Public()
  @Post("/auth/google")
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto, @Res() res: Response) {
    const googleUserData = await this.authService.verifyGoogleToken(googleLoginDto.credential);
    const now = new Date();

    const user = await this.authService.validateGoogleUser(googleUserData);
    if (user.suspendedAt && user.suspendedAt < now) {
      throw forbidden("FORBIDDEN_ACCESS", "정지된 유저입니다.");
    }

    const { accessToken, refreshToken } = await this.authService.generateTokenPair(user);

    const accessTokenMaxAge = 60 * 60 * 1000;
    const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000;

    res.cookie("access_token", accessToken, this.getCookieOptions(accessTokenMaxAge));
    res.cookie("refresh_token", refreshToken, this.getCookieOptions(refreshTokenMaxAge));

    const { areadyChecked, streak } = await this.loginStreaksService.recordLogin(user.id);
    if (!areadyChecked) {
      await this.eventEmitter.emitUserDailyLogin(user.id);
      await this.eventEmitter.emitUserLoginStreak(user.id, streak);
    }

    const { deletedAt, ...userWithoutDeletedAt } = user;
    return res.status(HttpStatus.OK).json({
      user: userWithoutDeletedAt,
      token: accessToken,
    });
  }

  @Public()
  @Post("/auth/refresh")
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await this.authService.refreshAccessToken(refreshToken);

    const accessTokenMaxAge = 15 * 60 * 1000; // 15분
    const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000; // 30일
    res.cookie("access_token", accessToken, this.getCookieOptions(accessTokenMaxAge));
    res.cookie("refresh_token", newRefreshToken, this.getCookieOptions(refreshTokenMaxAge));

    const { areadyChecked, streak } = await this.loginStreaksService.recordLogin(user.id);
    if (!areadyChecked) {
      await this.eventEmitter.emitUserDailyLogin(user.id);
      await this.eventEmitter.emitUserLoginStreak(user.id, streak);
    }

    const { deletedAt, ...userWithoutDeletedAt } = user;
    return res.status(HttpStatus.OK).json({
      user: userWithoutDeletedAt,
      token: accessToken,
    });
  }

  @Get("/auth/me")
  @UseGuards(AuthGuard("jwt"))
  getMe(@Req() req: Request & { user: User }) {
    const { deletedAt, ...userWithoutDeletedAt } = req.user;
    return {
      ...userWithoutDeletedAt,
    };
  }

  @Post("/auth/logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    return res.status(HttpStatus.OK).json({ message: "Logged out successfully" });
  }

  @Public()
  @Post("/auth/session")
  async createSession(@Body() body: { token: string }, @Res() res: Response) {
    const payload = this.authService.verifyJwtToken(body.token);
    if (!payload) {
      throw new UnauthorizedException("Invalid token");
    }

    const user = await this.authService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const { accessToken, refreshToken } = await this.authService.generateTokenPair(user, true);

    const accessTokenMaxAge = 60 * 60 * 1000;
    const refreshTokenMaxAge = 60 * 60 * 1000;
    const domain = URL.parse(this.configService.get<string>("FRONTEND_URL")).hostname;
    res.cookie("access_token", accessToken, {
      ...this.getCookieOptions(accessTokenMaxAge),
      domain,
    });
    res.cookie("refresh_token", refreshToken, {
      ...this.getCookieOptions(refreshTokenMaxAge),
      domain,
    });

    return res.status(HttpStatus.OK).json({ success: true });
  }
}
