import {
    ExecutionContext,
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isGithubOAuthConfigured } from '../config/oauth.config';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
    canActivate(context: ExecutionContext) {
        if (!isGithubOAuthConfigured()) {
            throw new ServiceUnavailableException('GitHub OAuth is not configured');
        }

        return super.canActivate(context);
    }
}
