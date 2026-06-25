import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisam.service';
import { OAuthProvider } from '../types/oauth.types';

@Injectable()
export class AccountRepository {
    constructor(private readonly prisma: PrismaService) {}

    findByProvider(provider: OAuthProvider, providerId: string) {
        return this.prisma.account.findUnique({
            where: {
                provider_providerId: {
                    provider,
                    providerId,
                },
            },
            include: {
                user: true,
            },
        });
    }

    create(userId: number, provider: OAuthProvider, providerId: string) {
        return this.prisma.account.create({
            data: {
                userId,
                provider,
                providerId,
            },
        });
    }
}
