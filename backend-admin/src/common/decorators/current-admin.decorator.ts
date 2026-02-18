import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AdminUser } from "@stashy/shared/admin/entities/admin-user.entity";

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AdminUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
