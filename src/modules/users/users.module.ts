import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { UserRepository } from './repositories/user.repository';

@Module({
  controllers: [UserController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UserModule {}
