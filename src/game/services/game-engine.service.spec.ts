import { Test, TestingModule } from '@nestjs/testing';
import { GameEngineService } from './game-engine.service';

describe('GameEngineService', () => {
    let service: GameEngineService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameEngineService],
        }).compile();

        service = module.get<GameEngineService>(GameEngineService);
    });

    it('creates an empty board', () => {
        const board = service.createEmptyBoard();
        expect(board).toHaveLength(9);
        expect(board.every((cell) => cell === null)).toBe(true);
    });

    it('applies a valid move', () => {
        const board = service.createEmptyBoard();
        const next = service.applyMove(board, 4, 'X');
        expect(next[4]).toBe('X');
        expect(board[4]).toBeNull();
    });

    it('rejects invalid move on occupied cell', () => {
        const board = service.applyMove(service.createEmptyBoard(), 0, 'X');
        expect(() => service.applyMove(board, 0, 'O')).toThrow();
    });

    it('detects a row winner', () => {
        const board = service.createEmptyBoard();
        board[0] = 'X';
        board[1] = 'X';
        board[2] = 'X';
        expect(service.checkWinner(board)).toBe('X');
    });

    it('detects a diagonal winner', () => {
        const board = service.createEmptyBoard();
        board[0] = 'O';
        board[4] = 'O';
        board[8] = 'O';
        expect(service.checkWinner(board)).toBe('O');
    });

    it('detects a draw', () => {
        const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'] as const;
        expect(service.checkWinner([...board])).toBeNull();
        expect(service.isDraw([...board])).toBe(true);
    });
});
