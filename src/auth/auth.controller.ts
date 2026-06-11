import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Body,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

// Helper to pull the attached user from the request
interface RequestWithUser extends Request {
  user: {
    supabaseId: string;
    email: string;
    user_metadata: Record<string, any>;
    app_metadata: Record<string, any>;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Get current user — creates the DB record on first call
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: RequestWithUser) {
    const { supabaseId, email, user_metadata } = req.user;
    const localUser = await this.authService.findOrCreateUser({
      supabaseId,
      email,
      user_metadata,
    });
    return { user: localUser };
  }

  // Get full profile
  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: RequestWithUser) {
    const profile = await this.authService.getProfile(req.user.supabaseId);
    return { user: profile };
  }

  // Update profile fields
  @Patch('profile')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body()
    updateData: {
      username?: string;
      name?: string;
      profileImg?: string;
      bio?: string;
      links?: string;
      interests?: string;
    },
  ) {
    const profile = await this.authService.updateProfile(
      req.user.supabaseId,
      updateData,
    );
    return { user: profile };
  }
}
