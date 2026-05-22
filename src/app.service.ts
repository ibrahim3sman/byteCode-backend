import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  async healthCheck() {
    return { status: 'ok', message: 'ByteCode backend is healthly ✅' };
  }
}
