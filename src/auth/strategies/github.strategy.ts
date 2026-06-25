import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import {
    getGithubCallbackUrl,
    isGithubOAuthConfigured,
} from '../config/oauth.config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.GITHUB_CLIENT_ID!.trim(),
            clientSecret: process.env.GITHUB_CLIENT_SECRET!.trim(),
            callbackURL: getGithubCallbackUrl(),
            scope: ['user:email'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
    ) {
        if (!isGithubOAuthConfigured()) {
            throw new Error('GitHub OAuth is not configured');
        }

        const email =
            profile.emails?.find((entry) => entry.value)?.value ??
            `${profile.id}@users.noreply.github.com`;

        return this.authService.signInWithOAuth({
            provider: 'github',
            providerId: profile.id,
            email,
            displayName: profile.displayName || profile.username || 'player',
        });
    }
}
