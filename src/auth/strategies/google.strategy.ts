import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import {
    getGoogleCallbackUrl,
    isGoogleOAuthConfigured,
} from '../config/oauth.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
            callbackURL: getGoogleCallbackUrl(),
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ) {
        if (!isGoogleOAuthConfigured()) {
            done(new Error('Google OAuth is not configured'), false);
            return;
        }

        const email = profile.emails?.[0]?.value;
        if (!email) {
            done(new Error('Google account has no email'), false);
            return;
        }

        try {
            const session = await this.authService.signInWithOAuth({
                provider: 'google',
                providerId: profile.id,
                email,
                displayName: profile.displayName || email.split('@')[0] || 'player',
            });

            done(null, session);
        } catch (error) {
            done(error as Error, false);
        }
    }
}
