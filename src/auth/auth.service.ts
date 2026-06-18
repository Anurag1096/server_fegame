import { createHash, randomBytes } from 'crypto';
import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/Features/User/user.service';
import { hashPassword, verifyPassword } from 'src/utils/hash';
import { REFRESH_COOKIE_MAX_AGE_MS } from './constants/auth-cookie.constants';
import { JwtPayload } from './guards/jwt-auth.guard';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { AuthSessionResult, AuthUserResponse } from './types/auth.types';

type RefreshTokenParts = {
    plainToken: string;
    tokenHash: string;
    expiresAt: Date;
};

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly refreshTokenRepository: RefreshTokenRepository,
    ) {}

    async signUp(
        username: string,
        email: string,
        password: string,
    ): Promise<AuthSessionResult> {
        const existing = await this.userService.findOne({ username });
        if (existing) {
            throw new ConflictException('User already exists');
        }

        const { hashedPassword } = await hashPassword(password);
        if (!hashedPassword) {
            throw new InternalServerErrorException('Hashing failed');
        }

        const newUser = await this.userService.createUser({
            username,
            password: hashedPassword,
            email,
        });

        return this.createSession(newUser.id, newUser.username);
    }

    async signIn(userName: string, pass: string): Promise<AuthSessionResult> {
        const user = await this.userService.findOne({ username: userName });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await verifyPassword(user.password, pass);
        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.createSession(user.id, user.username);
    }

    async refreshSession(refreshToken: string): Promise<AuthSessionResult> {
        const tokenHash = this.hashRefreshToken(refreshToken);
        const storedToken =
            await this.refreshTokenRepository.findValidByHash(tokenHash);

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.refreshTokenRepository.revokeById(storedToken.id);

        return this.createSession(
            storedToken.user.id,
            storedToken.user.username,
        );
    }

    async revokeRefreshToken(refreshToken: string | undefined): Promise<void> {
        if (!refreshToken) {
            return;
        }

        const tokenHash = this.hashRefreshToken(refreshToken);
        await this.refreshTokenRepository.revokeByHash(tokenHash);
    }

    toAuthUser(id: number, username: string): AuthUserResponse {
        return { id, username };
    }

    profileFromPayload(payload: JwtPayload): AuthUserResponse {
        return this.toAuthUser(payload.sub, payload.userName);
    }

    private async createSession(
        userId: number,
        username: string,
    ): Promise<AuthSessionResult> {
        const accessToken = await this.generateAccessToken(userId, username);
        const refreshToken = await this.issueRefreshToken(userId);

        return {
            user: this.toAuthUser(userId, username),
            accessToken,
            refreshToken: refreshToken.plainToken,
        };
    }

    private async issueRefreshToken(userId: number): Promise<RefreshTokenParts> {
        const refreshToken = this.generateRefreshToken();
        await this.refreshTokenRepository.create(
            userId,
            refreshToken.tokenHash,
            refreshToken.expiresAt,
        );

        return refreshToken;
    }

    private generateRefreshToken(): RefreshTokenParts {
        const plainToken = randomBytes(48).toString('base64url');

        return {
            plainToken,
            tokenHash: this.hashRefreshToken(plainToken),
            expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE_MS),
        };
    }

    private hashRefreshToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private generateAccessToken(userId: number, username: string): Promise<string> {
        return this.jwtService.signAsync({ sub: userId, userName: username });
    }
}
