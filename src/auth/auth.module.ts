import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'prisma/prisam.service';
import { UserModule } from 'src/Features/User/user.module';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import { AuthService } from './auth.service';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AccountRepository } from './repository/account.repository';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import {
    isGithubOAuthConfigured,
    isGoogleOAuthConfigured,
} from './config/oauth.config';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

const secret = process.env.JWT_SECRET;

const oauthStrategyProviders = [
    ...(isGoogleOAuthConfigured() ? [GoogleStrategy] : []),
    ...(isGithubOAuthConfigured() ? [GithubStrategy] : []),
];

@Module({
    imports: [
        UserModule,
        PassportModule.register({ session: false }),
        JwtModule.register({
            global: true,
            secret,
            signOptions: { expiresIn: '15m' },
        }),
    ],
    controllers: [AuthController, OAuthController],
    providers: [
        AuthService,
        PrismaService,
        AccountRepository,
        RefreshTokenRepository,
        JwtAuthGuard,
        WsJwtGuard,
        ...oauthStrategyProviders,
        GoogleAuthGuard,
        GithubAuthGuard,
    ],
    exports: [AuthService, JwtAuthGuard, WsJwtGuard],
})
export class AuthModule {}
