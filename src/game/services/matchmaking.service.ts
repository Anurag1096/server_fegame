import { ConflictException, Injectable } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room, toRoomSnapshot } from '../types/game.types';

export interface QueueEntry {
    userId: number;
    username: string;
    socketId: string;
    enqueuedAt: Date;
}

export type JoinQueueResult =
    | { type: 'queued'; position: number }
    | { type: 'matched'; room: Room; players: QueueEntry[] };

@Injectable()
export class MatchmakingService {
    private readonly queue: QueueEntry[] = [];

    constructor(private readonly roomService: RoomService) {}

    isInQueue(userId: number): boolean {
        return this.queue.some((entry) => entry.userId === userId);
    }

    leaveQueue(userId: number): boolean {
        const index = this.queue.findIndex((entry) => entry.userId === userId);
        if (index === -1) {
            return false;
        }
        this.queue.splice(index, 1);
        return true;
    }

    joinQueue(userId: number, username: string, socketId: string): JoinQueueResult {
        if (this.roomService.getRoomByUserId(userId)) {
            throw new ConflictException('Already in a room');
        }

        if (this.isInQueue(userId)) {
            const entry = this.queue.find((e) => e.userId === userId)!;
            entry.socketId = socketId;
            return { type: 'queued', position: this.queue.indexOf(entry) + 1 };
        }

        this.queue.push({
            userId,
            username,
            socketId,
            enqueuedAt: new Date(),
        });

        if (this.queue.length < 2) {
            return { type: 'queued', position: this.queue.length };
        }

        const playerOne = this.queue.shift()!;
        const playerTwo = this.queue.shift()!;

        const room = this.roomService.createRoom(
            playerOne.userId,
            playerOne.username,
            playerOne.socketId,
            'queue',
        );

        this.roomService.joinRoom(
            room.id,
            playerTwo.userId,
            playerTwo.username,
            playerTwo.socketId,
        );

        const matchedRoom = this.roomService.getRoom(room.id)!;

        return {
            type: 'matched',
            room: matchedRoom,
            players: [playerOne, playerTwo],
        };
    }

    removeUserFromQueue(userId: number): void {
        this.leaveQueue(userId);
    }

    getQueueSnapshot(): Array<{ userId: number; position: number }> {
        return this.queue.map((entry, index) => ({
            userId: entry.userId,
            position: index + 1,
        }));
    }
}

export { toRoomSnapshot };
