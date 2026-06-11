import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('No Bearer token found in Authorization header');
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      this.logger.error('SUPABASE_URL or SUPABASE_ANON_KEY not set in environment');
      throw new UnauthorizedException('Server configuration error');
    }

    // Create a per-request Supabase client with the user's access token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      this.logger.warn(`Token verification failed: ${error?.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach structured user info to the request (same shape as the old JWT strategy)
    (request as any).user = {
      supabaseId: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata ?? {},
      app_metadata: data.user.app_metadata ?? {},
      role: data.user.role,
    };

    this.logger.debug(`Authenticated user: ${data.user.email}`);
    return true;
  }
}
