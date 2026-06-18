import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
    AUTH_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    getAuthCookieClearOptions,
    getAuthCookieOptions,
    getRefreshCookieClearOptions,
    getRefreshCookieOptions,
} from './constants/auth-cookie.constants';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtAuthGuard, JwtPayload } from './guards/jwt-auth.guard';
import { AuthSessionResult } from './types/auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('signup')
    async signUp(
        @Body() signUpDto: SignUpDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const session = await this.authService.signUp(
            signUpDto.username,
            signUpDto.email,
            signUpDto.password,
        );

        this.setAuthCookies(response, session);
        return { user: session.user };
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Body() signInDto: SignInDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const session = await this.authService.signIn(
            signInDto.userName,
            signInDto.password,
        );

        this.setAuthCookies(response, session);
        return { user: session.user };
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];
        if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
            throw new UnauthorizedException('Missing refresh token');
        }

        const session = await this.authService.refreshSession(refreshToken);
        this.setAuthCookies(response, session);
        return { user: session.user };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() request: Request & { user: JwtPayload }) {
        return this.authService.profileFromPayload(request.user);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];
        await this.authService.revokeRefreshToken(
            typeof refreshToken === 'string' ? refreshToken : undefined,
        );

        this.clearAuthCookies(response);
        return { message: 'Logged out' };
    }

    private setAuthCookies(response: Response, session: AuthSessionResult) {
        response.cookie(AUTH_COOKIE_NAME, session.accessToken, getAuthCookieOptions());
        response.cookie(
            REFRESH_COOKIE_NAME,
            session.refreshToken,
            getRefreshCookieOptions(),
        );
    }

    private clearAuthCookies(response: Response) {
        response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieClearOptions());
        response.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieClearOptions());
    }
}
