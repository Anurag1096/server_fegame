import {
    ExecutionContext,
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isGoogleOAuthConfigured } from '../config/oauth.config';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    canActivate(context: ExecutionContext) {
        if (!isGoogleOAuthConfigured()) {
            throw new ServiceUnavailableException('Google OAuth is not configured');
        }

        return super.canActivate(context);
    }
}
