import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { User } from "../../users/entities/user.entity";

export const CurrentUser = createParamDecorator((data: string, ctx: ExecutionContext): User | User[keyof User] => {
  const request = ctx.switchToHttp().getRequest();
  if (data) {
    return request.user?.[data];
  }
  return request.user;
});
