import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisam.service';

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(userId: number, tokenHash: string, expiresAt: Date) {
        return this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
    }

    findValidByHash(tokenHash: string) {
        return this.prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });
    }

    revokeById(id: string) {
        return this.prisma.refreshToken.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
    }

    revokeByHash(tokenHash: string) {
        return this.prisma.refreshToken.updateMany({
            where: {
                tokenHash,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });
    }
}
