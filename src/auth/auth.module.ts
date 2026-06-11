import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [AuthService, SupabaseAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, SupabaseAuthGuard],
})
export class AuthModule {}
