import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

export const SKIP_PASSWORD_CHECK_KEY = "skipPasswordCheck";
export const SkipPasswordCheck = () => SetMetadata(SKIP_PASSWORD_CHECK_KEY, true);

@Injectable()
export class PasswordChangeRequiredGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Skip if route has SkipPasswordCheck decorator
    const skipCheck = this.reflector.getAllAndOverride<boolean>(SKIP_PASSWORD_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.user;

    if (admin?.mustChangePassword) {
      throw new ForbiddenException({
        message: "Password change required",
        mustChangePassword: true,
      });
    }

    return true;
  }
}
