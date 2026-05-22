import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(supabasePayload: {
    supabaseId: string;
    email: string;
    user_metadata?: Record<string, any>;
  }) {
    const { supabaseId, email, user_metadata } = supabasePayload;

    let user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (user) {
      return this.cleanUserData(user);
    }

    user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // linking existing user to their supabase account
      user = await this.prisma.user.update({
        where: { email },
        data: { supabaseId },
      });
      return this.cleanUserData(user);
    }

    // creating a new user from Supabase data
    const username = this.generateUsername(email, user_metadata);
    const profileImg =
      user_metadata?.avatar_url || user_metadata?.picture || null;

    user = await this.prisma.user.create({
      data: {
        supabaseId,
        email,
        username,
        profileImg,
      },
    });

    return this.cleanUserData(user);
  }

  async getProfile(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) return null;
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
    const { password, ...cleanUser } = user;
    return cleanUser;
  }
}
