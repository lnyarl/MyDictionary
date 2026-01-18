import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { Public } from "../common/decorators/public.decorator";
import type { User } from "../users/entities/user.entity";
import { AuthService } from "./auth.service";
import { GoogleLoginDto } from "./dto/google-login.dto";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post("auth/google")
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto, @Res() res: Response) {
    const googleUserData = await this.authService.verifyGoogleToken(googleLoginDto.credential);

    const user = await this.authService.validateGoogleUser(googleUserData);

    const token = this.authService.generateJwtToken(user);

    const isDevelopment = this.configService.get("NODE_ENV") !== "production";

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const { deletedAt, ...userWithoutDeletedAt } = user;
    return res.status(HttpStatus.OK).json({
      user: userWithoutDeletedAt,
      token,
    });
  }

  @Public()
  @Post("auth/mock-login")
  async mockLogin(@Body() body: { email?: string; name?: string } = {}, @Res() res: Response) {
    const isDevelopment = this.configService.get("NODE_ENV") !== "production";
    if (!isDevelopment) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: "Mock login only available in development" });
    }

    const email = body.email || "test@example.com";
    const name = body.name || "Test User";
    const googleId = `google-id-${email}`;

    const testUser = await this.authService.validateGoogleUser({
      email,
      name,
      googleId,
      picture: "https://example.com/test.jpg",
    });

    const token = this.authService.generateJwtToken(testUser);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(HttpStatus.OK).json({ user: testUser, token });
  }

  @Get("auth/me")
  @UseGuards(AuthGuard("jwt"))
  getMe(@Req() req: Request & { user: User }) {
    const { deletedAt, ...userWithoutDeletedAt } = req.user;
    return {
      ...userWithoutDeletedAt,
    };
  }

  @Post("auth/logout")
  logout(@Res() res: Response) {
    res.clearCookie("access_token", { path: "/" });
    return res.status(HttpStatus.OK).json({ message: "Logged out successfully" });
  }
}
