import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";
import { AdminUsersService } from "../../admin-users/admin-users.service";
import type { AdminJwtPayload } from "../auth.service";

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, "admin-jwt") {
	constructor(
		readonly configService: ConfigService,
		private readonly adminUsersService: AdminUsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request?.cookies?.admin_access_token;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_SECRET"),
		});
	}

	async validate(payload: AdminJwtPayload) {
		const admin = await this.adminUsersService.findById(payload.sub);
		if (!admin) {
			throw new UnauthorizedException("Admin not found");
		}
		return admin;
	}
}
