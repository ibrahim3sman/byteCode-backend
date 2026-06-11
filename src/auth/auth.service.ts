import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(supabasePayload: {
    supabaseId: string;
    email: string;
    user_metadata?: Record<string, any>;
  }) {
    const { supabaseId, email, user_metadata } = supabasePayload;

    // 1. Try by supabaseId first (fastest path)
    let user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (user) {
      return this.cleanUserData(user);
    }

    // 2. Try linking an existing user by email
    user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { email },
        data: { supabaseId },
      });
      return this.cleanUserData(user);
    }

    // 3. Create a brand-new user
    const baseUsername = this.generateUsername(email, user_metadata);
    const profileImg =
      user_metadata?.avatar_url || user_metadata?.picture || null;

    // Guarantee uniqueness: append random suffix on collision
    let username = baseUsername;
    let attempts = 0;
    while (attempts < 5) {
      try {
        user = await this.prisma.user.create({
          data: { supabaseId, email, username, profileImg },
        });
        return this.cleanUserData(user);
      } catch (err: any) {
        if (err?.code === 'P2002' && attempts < 4) {
          // Unique constraint — try a different username
          username = `${baseUsername}${Math.floor(Math.random() * 9000) + 1000}`;
          attempts++;
        } else {
          this.logger.error(`Failed to create user: ${err}`);
          throw err;
        }
      }
    }

    throw new Error('Could not create user after multiple attempts');
  }

  async getProfile(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) return null;
    return this.cleanUserData(user);
  }

  async updateProfile(supabaseId: string, updateData: any) {
    if (updateData.username) {
      updateData.hasSetUsername = true;
    }
    const user = await this.prisma.user.update({
      where: { supabaseId },
      data: updateData,
    });
    return this.cleanUserData(user);
  }

  private generateUsername(
    email: string,
    metadata?: Record<string, any>,
  ): string {
    if (metadata?.user_name) return metadata.user_name;
    if (metadata?.preferred_username) return metadata.preferred_username;
    if (metadata?.full_name)
      return metadata.full_name.replace(/\s+/g, '_').toLowerCase();

    return email.split('@')[0];
  }

  private cleanUserData(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}

