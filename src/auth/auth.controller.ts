import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // get user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(
    @CurrentUser()
    user: {
      supabaseId: string;
      email: string;
      user_metadata: Record<string, any>;
    },
  ) {
    const localUser = await this.authService.findOrCreateUser({
      supabaseId: user.supabaseId,
      email: user.email,
      user_metadata: user.user_metadata,
    });

    return { user: localUser };
  }

  // get profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser('supabaseId') supabaseId: string) {
    const profile = await this.authService.getProfile(supabaseId);
    return { user: profile };
  }
}
