import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GoogleLoginDto } from "@stashy/shared/dto/auth/google-login.dto";
import type { Request, Response } from "express";
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
    private readonly eventEmitter: EventEmitterService,
    private readonly loginStreaksService: LoginStreaksService,
  ) {}

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

    const { areadyChecked, streak } = await this.loginStreaksService.recordLogin(user.id);
    if (!areadyChecked) {
      await this.eventEmitter.emitUserDailyLogin(user.id);
      await this.eventEmitter.emitUserLoginStreak(user.id, streak);
    }

    const { deletedAt, ...userWithoutDeletedAt } = user;
    return res.status(HttpStatus.OK).json({
      user: userWithoutDeletedAt,
      token: accessToken,
      refreshToken,
      authMode: "bearer",
    });
  }

  @Public()
  @Post("/auth/refresh")
  async refreshToken(@Body() body: { refreshToken?: string }, @Res() res: Response) {
    const refreshToken = body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await this.authService.refreshAccessToken(refreshToken);

    const { areadyChecked, streak } = await this.loginStreaksService.recordLogin(user.id);
    if (!areadyChecked) {
      await this.eventEmitter.emitUserDailyLogin(user.id);
      await this.eventEmitter.emitUserLoginStreak(user.id, streak);
    }

    const { deletedAt, ...userWithoutDeletedAt } = user;
    return res.status(HttpStatus.OK).json({
      user: userWithoutDeletedAt,
      token: accessToken,
      refreshToken: newRefreshToken,
      authMode: "bearer",
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

  @Public()
  @Post("/auth/logout")
  async logout(@Body() body: { refreshToken?: string }, @Res() res: Response) {
    const refreshToken = body?.refreshToken;

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

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

    return res.status(HttpStatus.OK).json({
      success: true,
      token: accessToken,
      refreshToken,
      authMode: "bearer",
    });
  }
}
