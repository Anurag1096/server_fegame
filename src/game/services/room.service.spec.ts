import { Test, TestingModule } from '@nestjs/testing';
import { GameEngineService } from './game-engine.service';
import { RoomService } from './room.service';
import { GameStatus } from '../types/game.types';

describe('RoomService', () => {
    let roomService: RoomService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RoomService, GameEngineService],
        }).compile();

        roomService = module.get<RoomService>(RoomService);
    });

    it('creates a waiting invite room with creator as X', () => {
        const room = roomService.createRoom(1, 'alice', 'socket-1', 'invite');
        expect(room.players).toHaveLength(1);
        expect(room.players[0].symbol).toBe('X');
        expect(room.status).toBe(GameStatus.WAITING);
    });

    it('starts game when second player joins', () => {
        const room = roomService.createRoom(1, 'alice', 'socket-1', 'invite');
        const joined = roomService.joinRoom(room.id, 2, 'bob', 'socket-2');

        expect(joined.players).toHaveLength(2);
        expect(joined.players[1].symbol).toBe('O');
        expect(joined.status).toBe(GameStatus.IN_PROGRESS);
    });

    it('rejects move when not player turn', () => {
        const room = roomService.createRoom(1, 'alice', 'socket-1', 'invite');
        roomService.joinRoom(room.id, 2, 'bob', 'socket-2');

        expect(() => roomService.makeMove(room.id, 2, 0)).toThrow();
    });

    it('detects win after valid moves', () => {
        const room = roomService.createRoom(1, 'alice', 'socket-1', 'invite');
        roomService.joinRoom(room.id, 2, 'bob', 'socket-2');

        roomService.makeMove(room.id, 1, 0);
        roomService.makeMove(room.id, 2, 3);
        roomService.makeMove(room.id, 1, 1);
        roomService.makeMove(room.id, 2, 4);
        const result = roomService.makeMove(room.id, 1, 2);

        expect(result.gameOver).toBe(true);
        expect(result.winner).toBe('X');
    });
});
