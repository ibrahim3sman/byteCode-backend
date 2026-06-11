import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (err || !user) {
      this.logger.error(`JWT validation failed. err: ${err}, info: ${info}, status: ${status}`);
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
