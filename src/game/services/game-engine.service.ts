import { BadRequestException, Injectable } from '@nestjs/common';
import { Board, Symbol } from '../types/game.types';

const WIN_LINES: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

@Injectable()
export class GameEngineService {
    createEmptyBoard(): Board {
        return Array<null>(9).fill(null);
    }

    isValidMove(board: Board, index: number): boolean {
        return index >= 0 && index <= 8 && board[index] === null;
    }

    applyMove(board: Board, index: number, symbol: Symbol): Board {
        if (!this.isValidMove(board, index)) {
            throw new BadRequestException('Invalid move');
        }

        const nextBoard = [...board] as Board;
        nextBoard[index] = symbol;
        return nextBoard;
    }

    checkWinner(board: Board): Symbol | null {
        for (const [a, b, c] of WIN_LINES) {
            const cell = board[a];
            if (cell && cell === board[b] && cell === board[c]) {
                return cell;
            }
        }
        return null;
    }

    isDraw(board: Board): boolean {
        return board.every((cell) => cell !== null) && this.checkWinner(board) === null;
    }
}
