import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { extractTokenFromCookieHeader } from '../constants/auth-cookie.constants';
import { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<Socket>();

        if (client.data.user) {
            return true;
        }

        const token = this.extractToken(client);
        if (!token) {
            throw new WsException('Missing access token');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
            client.data.user = { userId: payload.sub, username: payload.userName };
            return true;
        } catch {
            throw new WsException('Invalid access token');
        }
    }

    private extractToken(client: Socket): string | undefined {
        const cookieHeader = client.handshake.headers.cookie;
        const cookieToken = extractTokenFromCookieHeader(
            typeof cookieHeader === 'string' ? cookieHeader : undefined,
        );
        if (cookieToken) {
            return cookieToken;
        }

        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string' && authToken.length > 0) {
            return authToken;
        }

        const header = client.handshake.headers.authorization;
        if (typeof header === 'string' && header.startsWith('Bearer ')) {
            return header.slice(7);
        }

        return undefined;
    }
}
