import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/Features/User/user.module';
import { AuthService } from './auth.service';
import { UserService } from 'src/Features/User/user.service';
import { JwtModule } from '@nestjs/jwt';
const secret= process.env.JWT_SECRET
@Module({
  imports:[UserService,UserModule,

    JwtModule.register({
      global:true,
      secret:secret,
      signOptions:{ expiresIn:'100s'}
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports:[AuthService]
})
export class AuthModule {}
