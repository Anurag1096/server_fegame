import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface ConnectedUser {
    userId: number;
    username: string;
}

@Injectable()
export class ConnectionRegistryService {
    private readonly socketToUser = new Map<string, ConnectedUser>();
    private readonly userToSocket = new Map<number, string>();

    register(socketId: string, userId: number, username: string): string | undefined {
        const previousSocketId = this.userToSocket.get(userId);
        if (previousSocketId && previousSocketId !== socketId) {
            this.socketToUser.delete(previousSocketId);
        }

        this.socketToUser.set(socketId, { userId, username });
        this.userToSocket.set(userId, socketId);
        return previousSocketId;
    }

    unregister(socketId: string): ConnectedUser | undefined {
        const user = this.socketToUser.get(socketId);
        if (!user) {
            return undefined;
        }

        this.socketToUser.delete(socketId);
        const currentSocket = this.userToSocket.get(user.userId);
        if (currentSocket === socketId) {
            this.userToSocket.delete(user.userId);
        }

        return user;
    }

    getUserBySocket(socketId: string): ConnectedUser | undefined {
        return this.socketToUser.get(socketId);
    }

    getSocketByUser(userId: number): string | undefined {
        return this.userToSocket.get(userId);
    }

    updateSocket(userId: number, socketId: string, username: string): void {
        this.register(socketId, userId, username);
    }
}

export function generateRoomId(): string {
    return randomBytes(3).toString('hex').toUpperCase();
}
