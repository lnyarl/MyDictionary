import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { User } from "@shared/entities/user.entity";

@Injectable()
export class SuspendedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // Allow read-only operations
    if (request.method === "GET") {
      return true;
    }

    // If no user (e.g. public endpoint), allow
    if (!user) {
      return true;
    }

    if (user.suspendedAt) {
      throw new ForbiddenException("Your account has been suspended.");
    }

    return true;
  }
}
