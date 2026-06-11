import { Controller, Get, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/id/:id')
  async getUserById(@Param('id') id: string) {
    try {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        return new Error('Invalid user ID');
      }
      return await this.usersService.getUserById(parsedId);
    } catch (err) {
      console.error(err);
      return new Error('Failed to get user by id');
    }
  }

  @Get('/:name')
  async filterUsersByName(@Param() params) {
    try {
      const { name } = params;
      return await this.usersService.filterUsersByName(name);
    } catch (err) {
      console.error(err);
      return new Error(`Faild to filter users by name`);
    }
  }
}
