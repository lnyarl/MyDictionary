import { Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: ConfigService is needed at runtime for dependency injection
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
// biome-ignore lint/style/useImportType: UsersService is needed at runtime for dependency injection
import { UsersService } from "../../users/users.service";

export interface JwtPayload {
	sub: string;
	email: string;
	iat: number;
	exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(
		readonly configService: ConfigService,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request?.cookies?.access_token;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_SECRET"),
		});
	}

	async validate(payload: JwtPayload) {
		const user = await this.usersService.findById(payload.sub);

		if (!user) {
			throw new UnauthorizedException("User not found");
		}

		return user;
	}
}
