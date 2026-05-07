import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/Features/User/user.service';
@Module({
  imports:[UserService],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
