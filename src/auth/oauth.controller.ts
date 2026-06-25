import {
    Controller,
    Get,
    Req,
    Res,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
    AUTH_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    getAuthCookieOptions,
    getRefreshCookieOptions,
} from './constants/auth-cookie.constants';
import { getPrimaryFrontendUrl } from './config/oauth.config';
import { OAuthRedirectFilter } from './filters/oauth-redirect.filter';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthSessionResult } from './types/auth.types';

@ApiTags('auth')
@Controller('auth')
@UseFilters(OAuthRedirectFilter)
export class OAuthController {
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    googleAuth() {
        // Passport redirects to Google.
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    googleCallback(
        @Req() request: { user: AuthSessionResult },
        @Res() response: Response,
    ) {
        return this.completeOAuthLogin(request.user, response);
    }

    @Get('github')
    @UseGuards(GithubAuthGuard)
    githubAuth() {
        // Passport redirects to GitHub.
    }

    @Get('github/callback')
    @UseGuards(GithubAuthGuard)
    githubCallback(
        @Req() request: { user: AuthSessionResult },
        @Res() response: Response,
    ) {
        return this.completeOAuthLogin(request.user, response);
    }

    private completeOAuthLogin(session: AuthSessionResult, response: Response) {
        const frontendUrl = getPrimaryFrontendUrl();

        response.cookie(
            AUTH_COOKIE_NAME,
            session.accessToken,
            getAuthCookieOptions(),
        );
        response.cookie(
            REFRESH_COOKIE_NAME,
            session.refreshToken,
            getRefreshCookieOptions(),
        );

        return response.redirect(`${frontendUrl}/dashboard`);
    }
}
