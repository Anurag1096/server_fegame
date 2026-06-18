import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from '../constants/auth-cookie.constants';

export interface JwtPayload {
    sub: number;
    userName: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('Missing access token');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
            request['user'] = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid access token');
        }
    }

    private extractToken(request: Request): string | undefined {
        const cookieToken = request.cookies?.[AUTH_COOKIE_NAME];
        if (typeof cookieToken === 'string' && cookieToken.length > 0) {
            return cookieToken;
        }

        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
