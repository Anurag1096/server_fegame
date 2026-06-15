import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/Features/User/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WsJwtGuard } from './guards/ws-jwt.guard';

const secret = process.env.JWT_SECRET;

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
            secret,
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard, WsJwtGuard],
    exports: [AuthService, JwtAuthGuard, WsJwtGuard],
})
export class AuthModule {}
