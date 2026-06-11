import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async filterUsersByName(name: string) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: name } },
          { username: { contains: name } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        profileImg: true,
        bio: true,
      },
    });
    return users;
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        profileImg: true,
        bio: true,
        interests: true,
        links: true,
        status: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  }
}
