import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { GameEngineService } from './game-engine.service';
import { generateRoomId } from './connection-registry.service';
import {
    GameMode,
    GameStatus,
    GameWinner,
    Player,
    Room,
    RoomSnapshot,
    Symbol,
    toRoomSnapshot,
} from '../types/game.types';

export class GameError extends Error {
    constructor(
        message: string,
        public readonly code: string,
    ) {
        super(message);
    }
}

export interface MoveResult {
    room: Room;
    snapshot: RoomSnapshot;
    gameOver: boolean;
    winner: GameWinner;
}

@Injectable()
export class RoomService {
    private readonly rooms = new Map<string, Room>();
    private readonly userRoomMap = new Map<number, string>();

    constructor(private readonly gameEngine: GameEngineService) {}

    createRoom(
        userId: number,
        username: string,
        socketId: string,
        mode: GameMode = 'invite',
    ): Room {
        if (this.userRoomMap.has(userId)) {
            throw new ConflictException('Already in a room');
        }

        let roomId = generateRoomId();
        while (this.rooms.has(roomId)) {
            roomId = generateRoomId();
        }

        const room: Room = {
            id: roomId,
            players: [
                {
                    userId,
                    username,
                    symbol: 'X',
                    socketId,
                },
            ],
            board: this.gameEngine.createEmptyBoard(),
            currentTurn: 'X',
            status: GameStatus.WAITING,
            winner: null,
            createdAt: new Date(),
            mode,
        };

        this.rooms.set(roomId, room);
        this.userRoomMap.set(userId, roomId);
        return room;
    }

    joinRoom(
        roomId: string,
        userId: number,
        username: string,
        socketId: string,
    ): Room {
        if (this.userRoomMap.has(userId)) {
            const existingRoomId = this.userRoomMap.get(userId)!;
            if (existingRoomId !== roomId) {
                throw new ConflictException('Already in a different room');
            }
            return this.updatePlayerSocket(roomId, userId, socketId);
        }

        const room = this.getRoomOrThrow(roomId);

        if (room.status !== GameStatus.WAITING) {
            throw new BadRequestException('Room is not accepting players');
        }

        if (room.players.length >= 2) {
            throw new ConflictException('Room is full');
        }

        if (room.players.some((player) => player.userId === userId)) {
            return this.updatePlayerSocket(roomId, userId, socketId);
        }

        const player: Player = {
            userId,
            username,
            symbol: 'O',
            socketId,
        };

        room.players.push(player);
        room.status = GameStatus.IN_PROGRESS;
        this.userRoomMap.set(userId, roomId);
        return room;
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    getRoomByUserId(userId: number): Room | undefined {
        const roomId = this.userRoomMap.get(userId);
        if (!roomId) {
            return undefined;
        }
        return this.rooms.get(roomId);
    }

    makeMove(roomId: string, userId: number, cellIndex: number): MoveResult {
        const room = this.getRoomOrThrow(roomId);

        if (room.status !== GameStatus.IN_PROGRESS) {
            throw new GameError('Game is not in progress', 'GAME_NOT_IN_PROGRESS');
        }

        const player = room.players.find((p) => p.userId === userId);
        if (!player) {
            throw new GameError('You are not in this room', 'NOT_IN_ROOM');
        }

        if (player.symbol !== room.currentTurn) {
            throw new GameError('Not your turn', 'NOT_YOUR_TURN');
        }

        if (!this.gameEngine.isValidMove(room.board, cellIndex)) {
            throw new GameError('Invalid move', 'INVALID_MOVE');
        }

        room.board = this.gameEngine.applyMove(room.board, cellIndex, player.symbol);

        const winner = this.gameEngine.checkWinner(room.board);
        if (winner) {
            room.status = GameStatus.FINISHED;
            room.winner = winner;
        } else if (this.gameEngine.isDraw(room.board)) {
            room.status = GameStatus.FINISHED;
            room.winner = 'draw';
        } else {
            room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
        }

        return {
            room,
            snapshot: toRoomSnapshot(room),
            gameOver: room.status === GameStatus.FINISHED,
            winner: room.winner,
        };
    }

    leaveRoom(
        roomId: string,
        userId: number,
    ): { room: Room | null; abandoned: boolean; winner: GameWinner } {
        const room = this.rooms.get(roomId);
        if (!room) {
            return { room: null, abandoned: false, winner: null };
        }

        const playerIndex = room.players.findIndex((p) => p.userId === userId);
        if (playerIndex === -1) {
            return { room, abandoned: false, winner: null };
        }

        room.players.splice(playerIndex, 1);
        this.userRoomMap.delete(userId);

        if (room.players.length === 0) {
            this.rooms.delete(roomId);
            return { room: null, abandoned: true, winner: null };
        }

        if (room.status === GameStatus.IN_PROGRESS) {
            room.status = GameStatus.ABANDONED;
            room.winner = room.players[0]?.symbol ?? null;
            return { room, abandoned: false, winner: room.winner };
        }

        if (room.status === GameStatus.WAITING) {
            room.status = GameStatus.WAITING;
        }

        return { room, abandoned: false, winner: null };
    }

    handlePlayerDisconnect(userId: number): {
        room: Room | null;
        opponentUserId?: number;
        forfeit: boolean;
    } {
        const room = this.getRoomByUserId(userId);
        if (!room) {
            return { room: null, forfeit: false };
        }

        const opponent = room.players.find((p) => p.userId !== userId);
        const result = this.leaveRoom(room.id, userId);

        if (result.room && result.room.status === GameStatus.ABANDONED) {
            if (opponent) {
                this.userRoomMap.delete(opponent.userId);
            }
            return {
                room: result.room,
                opponentUserId: opponent?.userId,
                forfeit: true,
            };
        }

        return { room: result.room, forfeit: false };
    }

    updatePlayerSocket(roomId: string, userId: number, socketId: string): Room {
        const room = this.getRoomOrThrow(roomId);
        const player = room.players.find((p) => p.userId === userId);
        if (!player) {
            throw new NotFoundException('Player not in room');
        }
        player.socketId = socketId;
        return room;
    }

    clearUserRoom(userId: number): void {
        this.userRoomMap.delete(userId);
    }

    assignUserToRoom(userId: number, roomId: string): void {
        this.userRoomMap.set(userId, roomId);
    }

    private getRoomOrThrow(roomId: string): Room {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        return room;
    }
}
