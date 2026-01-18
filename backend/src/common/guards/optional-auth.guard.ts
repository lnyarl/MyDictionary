import { type ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalAuthGuard extends AuthGuard("jwt") {
  // Override handleRequest to allow requests without authentication
  handleRequest(err: any, user: any) {
    // If there's an error or no user, return null (don't throw)
    // This allows the request to proceed without authentication
    if (err || !user) {
      return null;
    }
    return user;
  }

  // Override canActivate to always return true
  canActivate(context: ExecutionContext) {
    // Always allow the request to proceed
    // This will attempt JWT validation, but won't reject if it fails
    return super.canActivate(context) as Promise<boolean> | boolean;
  }
}
