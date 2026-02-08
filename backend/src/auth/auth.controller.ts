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
import { ErrorCode } from "@stashy/shared";
import { GoogleLoginDto } from "@stashy/shared/dto/auth/google-login.dto";
import type { CookieOptions, Request, Response } from "express";
import { Public } from "../common/decorators/public.decorator";
import { forbidden } from "../common/exceptions/business.exception";
import type { User } from "../users/entities/user.entity";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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

    const accessTokenMaxAge = 60 * 60 * 1000;
    const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000;
    res.cookie("access_token", accessToken, this.getCookieOptions(accessTokenMaxAge));
    res.cookie("refresh_token", newRefreshToken, this.getCookieOptions(refreshTokenMaxAge));

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
    const isDevelopment = this.configService.get("NODE_ENV") !== "production";

    res.cookie("access_token", body.token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : "none",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.status(HttpStatus.OK).json({ success: true });
  }
}
