import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import type { AdminUser } from "../../admin-users/entities/admin-user.entity";

export const CurrentAdmin = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): AdminUser => {
		const request = ctx.switchToHttp().getRequest();
		return request.user;
	},
);
