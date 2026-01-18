import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { AdminUser } from "../admin-users/entities/admin-user.entity";
import { CurrentAdmin } from "../common/decorators/current-admin.decorator";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { SkipPasswordCheck } from "./guards/password-change-required.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post("login")
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const admin = await this.authService.validateCredentials(loginDto.username, loginDto.password);

    if (!admin) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Update last login
    await this.authService.updateLastLogin(admin.id);

    // Generate JWT
    const token = this.authService.generateJwtToken(admin);

    // Set httpOnly cookie
    const isDevelopment = this.configService.get("NODE_ENV") !== "production";
    res.cookie("admin_access_token", token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : "none",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: "/",
    });

    return res.status(HttpStatus.OK).json({
      admin: {
        id: admin.id,
        username: admin.username,
        mustChangePassword: admin.mustChangePassword,
      },
      token,
    });
  }

  @Post("change-password")
  @SkipPasswordCheck()
  async changePassword(
    @CurrentAdmin() admin: AdminUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // Verify current password
    const isValid = await this.authService.comparePassword(
      changePasswordDto.currentPassword,
      admin.password,
    );

    if (!isValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    // Update password and clear mustChangePassword flag
    await this.authService.changePassword(admin.id, changePasswordDto.newPassword);

    return { message: "Password changed successfully" };
  }

  @Get("me")
  @SkipPasswordCheck()
  getMe(@CurrentAdmin() admin: AdminUser) {
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
    };
  }

  @Post("logout")
  @SkipPasswordCheck()
  async logout(@Res() res: Response) {
    res.clearCookie("admin_access_token");
    return res.status(HttpStatus.OK).json({ message: "Logged out successfully" });
  }
}
