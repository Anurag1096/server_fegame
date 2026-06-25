import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { getPrimaryFrontendUrl } from '../config/oauth.config';

@Catch()
export class OAuthRedirectFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        const frontendUrl = getPrimaryFrontendUrl();

        if (exception instanceof HttpException && exception.getStatus() === 503) {
            response.redirect(`${frontendUrl}/login?error=oauth_unavailable`);
            return;
        }

        response.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
}
