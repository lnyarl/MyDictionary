import { Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: ConfigService is needed at runtime for dependency injection
import { ConfigService } from "@nestjs/config";
// biome-ignore lint/style/useImportType: JwtService is needed at runtime for dependency injection
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { generateRandomNickname } from "../common/utils/generate-nickname.util";
import type { User } from "../users/entities/user.entity";
// biome-ignore lint/style/useImportType: UsersService is needed at runtime for dependency injection
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
		let user = await this.usersService.findByGoogleId(data.googleId);

		if (user) {
			await this.usersService.updateProfile(user.id, {
				email: data.email,
				profilePicture: data.picture,
			});
			return this.usersService.findById(user.id);
		}

		const nickname = generateRandomNickname();

		user = await this.usersService.create({
			googleId: data.googleId,
			email: data.email,
			nickname,
			profilePicture: data.picture,
		});

		return user;
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
		} catch (error) {
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
